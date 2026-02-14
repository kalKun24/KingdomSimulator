
import { BoardState, CellData, PlayerColor, GameAnalysis, TileType } from '../types';
import { BOARD_ROWS, BOARD_COLS } from '../constants';

// Helper: Get Wizard bonus (Adjacent cells only)
const getWizardBonus = (board: BoardState, r: number, c: number): number => {
  let bonus = 0;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of directions) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS) {
      if (board[nr][nc].tile?.type === TileType.WIZARD) {
        bonus += 1;
      }
    }
  }
  return bonus;
};

// Helper: Get the contiguous segment of cells for a given direction, respecting Mountains
const getSegment = (board: BoardState, startR: number, startC: number, dr: number, dc: number): CellData[] => {
  const segment: CellData[] = [];
  
  // Scan backwards
  let r = startR;
  let c = startC;
  while (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
    if (board[r][c].tile?.type === TileType.MOUNTAIN) break;
    segment.push(board[r][c]); // Add cells even if empty, as long as not mountain
    r -= dr;
    c -= dc;
  }
  
  // Scan forwards (excluding start to avoid double count, but we need to order them? Order doesn't matter for sets)
  // Actually, easiest is to scan entire line and filter by the "island" containing startR, startC
  // Let's use the scan forward/backward approach but correct the logic.
  
  const cells: CellData[] = [];
  
  // Find Start Boundary
  let currR = startR;
  let currC = startC;
  
  // Move "negative" until wall or edge
  while (true) {
    const nextR = currR - dr;
    const nextC = currC - dc;
    if (nextR < 0 || nextR >= BOARD_ROWS || nextC < 0 || nextC >= BOARD_COLS) break;
    if (board[nextR][nextC].tile?.type === TileType.MOUNTAIN) break;
    currR = nextR;
    currC = nextC;
  }
  
  // Now iterate "positive" until wall or edge
  while (currR >= 0 && currR < BOARD_ROWS && currC >= 0 && currC < BOARD_COLS) {
    if (board[currR][currC].tile?.type === TileType.MOUNTAIN) break;
    cells.push(board[currR][currC]);
    currR += dr;
    currC += dc;
  }

  return cells;
};

export const calculateGame = (board: BoardState): GameAnalysis => {
  const analysis: GameAnalysis = {
    scores: {
      [PlayerColor.RED]: 0,
      [PlayerColor.BLUE]: 0,
      [PlayerColor.GREEN]: 0,
      [PlayerColor.YELLOW]: 0,
    },
    tileStats: {},
    castleStats: {}
  };

  // PHASE 1: Calculate Effective Value for every Tile
  // The value of a tile is determined by its environment (Row context + Col context).
  // A Dragon in the Row kills the tile. A Dragon in the Col kills the tile.
  
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const cell = board[r][c];
      if (!cell.tile) continue;

      // Only Resources and Hazards have numerical value to modify
      if (cell.tile.type !== TileType.RESOURCE && cell.tile.type !== TileType.HAZARD) {
        analysis.tileStats[cell.tile.id] = { effectiveValue: 0, modifiers: [] };
        continue;
      }

      const rowSegment = getSegment(board, r, c, 0, 1); // Row direction
      const colSegment = getSegment(board, r, c, 1, 0); // Col direction

      const allInfluencers = [...rowSegment, ...colSegment];

      // Priority 1: Mountain (Already handled by getSegment - it isolates the tile)
      
      // Priority 2: Dragon
      // If ANY Dragon is in the Row Segment OR Col Segment, Resource becomes 0.
      const hasDragon = allInfluencers.some(c => c.tile?.type === TileType.DRAGON);
      
      // Priority 3: Gold Mine
      // If ANY Gold Mine is in Row Segment OR Col Segment, Value doubles.
      const hasGoldMine = allInfluencers.some(c => c.tile?.type === TileType.GOLD_MINE);

      let effectiveValue = cell.tile.value;
      const modifiers: string[] = [];

      if (cell.tile.type === TileType.RESOURCE) {
        if (hasDragon) {
          effectiveValue = 0;
          modifiers.push('Dragon');
        }
      }

      // Gold Mine applies to current value (if Dragon made it 0, 0 * 2 = 0)
      // Applies to Resources and Hazards
      if (hasGoldMine) {
        effectiveValue *= 2;
        modifiers.push('Gold Mine');
      }

      analysis.tileStats[cell.tile.id] = { effectiveValue, modifiers };
    }
  }

  // PHASE 2: Calculate Castle Scores
  // Castles simply sum the "Effective Value" of all tiles in their Row/Col segments.
  
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const cell = board[r][c];
      if (!cell.castle) continue;

      const rowSegment = getSegment(board, r, c, 0, 1);
      const colSegment = getSegment(board, r, c, 1, 0);

      // Sum Row Segment
      let rowSum = 0;
      rowSegment.forEach(segCell => {
        if (segCell.tile && analysis.tileStats[segCell.tile.id]) {
          rowSum += analysis.tileStats[segCell.tile.id].effectiveValue;
        }
      });

      // Sum Col Segment
      let colSum = 0;
      colSegment.forEach(segCell => {
        if (segCell.tile && analysis.tileStats[segCell.tile.id]) {
          colSum += analysis.tileStats[segCell.tile.id].effectiveValue;
        }
      });

      // Wizard Bonus
      const wizardBonus = getWizardBonus(board, r, c);
      const effectiveRank = cell.castle.rank + wizardBonus;

      // Store Castle Stats
      analysis.castleStats[cell.castle.id] = {
        rowSegmentTotal: rowSum,
        colSegmentTotal: colSum,
        rowEffectiveRank: effectiveRank,
        colEffectiveRank: effectiveRank
      };

      // Add to Player Score
      // Note: A castle scores for BOTH row and column.
      const totalPoints = (rowSum * effectiveRank) + (colSum * effectiveRank);
      analysis.scores[cell.castle.color] += totalPoints;
    }
  }

  return analysis;
};

export const calculateScores = (board: BoardState) => calculateGame(board).scores;
export const analyzeBoard = (board: BoardState) => {
  const game = calculateGame(board);
  return { tiles: game.tileStats, castles: game.castleStats };
};
