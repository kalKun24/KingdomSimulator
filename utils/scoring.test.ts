
import { describe, it, expect } from 'vitest'; // or 'jest' depending on environment
import { calculateScores } from './scoring';
import { BoardState, PlayerColor, TileType, CellData } from '../types';
import { BOARD_ROWS, BOARD_COLS } from '../constants';

// --- Test Helpers ---
const createEmptyBoard = (): BoardState => {
  return Array.from({ length: BOARD_ROWS }, (_, r) =>
    Array.from({ length: BOARD_COLS }, (_, c) => ({
      row: r,
      col: c,
      tile: null,
      castle: null,
    }))
  );
};

const placeTile = (board: BoardState, r: number, c: number, type: TileType, value: number = 0) => {
  board[r][c].tile = { type, value, id: `t-${r}-${c}` };
};

const placeCastle = (board: BoardState, r: number, c: number, color: PlayerColor, rank: 1 | 2 | 3 | 4) => {
  board[r][c].castle = { color, rank, id: `c-${r}-${c}` };
};

// --- Test Suite ---
describe('Kingdoms Scoring Logic', () => {

  // --- 1. Basic Scoring ---
  
  it('1a. Basic Scoring (Row): Castle collects resources in row', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1); // Rank 1
    placeTile(board, 0, 1, TileType.RESOURCE, 5); // +5
    
    const scores = calculateScores(board);
    // Row total: 5, Castle Rank: 1 => 5
    expect(scores[PlayerColor.RED]).toBe(5);
  });

  it('1b. Basic Scoring (Col): Castle collects resources in column', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.BLUE, 1); 
    placeTile(board, 1, 0, TileType.RESOURCE, 5); // Same column (down)
    
    const scores = calculateScores(board);
    // Col total: 5, Castle Rank: 1 => 5
    expect(scores[PlayerColor.BLUE]).toBe(5);
  });

  // --- 2. Hazard Scoring ---

  it('2. Hazard Scoring: Castle collects negative points', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.BLUE, 1);
    placeTile(board, 0, 1, TileType.HAZARD, -5);
    
    const scores = calculateScores(board);
    expect(scores[PlayerColor.BLUE]).toBe(-5);
  });

  // --- 3. Dragon Mechanics ---

  it('3a. Dragon (Row): Dragon negates resources in same row', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.RESOURCE, 10);
    placeTile(board, 0, 2, TileType.DRAGON);
    
    const scores = calculateScores(board);
    expect(scores[PlayerColor.RED]).toBe(0);
  });

  it('3b. Dragon (Col): Dragon negates resources in same column', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.GREEN, 1);
    placeTile(board, 1, 0, TileType.RESOURCE, 10);
    placeTile(board, 2, 0, TileType.DRAGON); // Same column
    
    const scores = calculateScores(board);
    expect(scores[PlayerColor.GREEN]).toBe(0);
  });

  it('4. Dragon Cross (CRITICAL): Dragon in column kills resource for row castle', () => {
    // Explanation:
    // [C] [R] .
    //  .  [D] .
    // The Dragon is in the same COLUMN as the Resource.
    // This sets the Resource's effective value to 0 globally.
    // Therefore, the Castle in the ROW should score 0.
    
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1); // Row 0, Col 0
    placeTile(board, 0, 1, TileType.RESOURCE, 10); // Row 0, Col 1
    placeTile(board, 1, 1, TileType.DRAGON);       // Row 1, Col 1 (Same col as resource)

    const scores = calculateScores(board);
    expect(scores[PlayerColor.RED]).toBe(0);
  });

  // --- 4. Mountain Mechanics ---

  it('5a. Mountain Split (Row): Mountain blocks collection', () => {
    const board = createEmptyBoard();
    // [Castle] [Mountain] [Resource]
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.MOUNTAIN);
    placeTile(board, 0, 2, TileType.RESOURCE, 10);

    const scores = calculateScores(board);
    expect(scores[PlayerColor.RED]).toBe(0);
  });

  it('5b. Mountain Split (Col): Mountain blocks collection vertically', () => {
    const board = createEmptyBoard();
    // [Castle]
    // [Mountain]
    // [Resource]
    placeCastle(board, 0, 0, PlayerColor.YELLOW, 1);
    placeTile(board, 1, 0, TileType.MOUNTAIN);
    placeTile(board, 2, 0, TileType.RESOURCE, 10);

    const scores = calculateScores(board);
    expect(scores[PlayerColor.YELLOW]).toBe(0);
  });

  it('6. Mountain Block: Mountain protects resource from Dragon', () => {
    const board = createEmptyBoard();
    // [Castle] [Resource] [Mountain] [Dragon]
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.RESOURCE, 10);
    placeTile(board, 0, 2, TileType.MOUNTAIN);
    placeTile(board, 0, 3, TileType.DRAGON);

    const scores = calculateScores(board);
    expect(scores[PlayerColor.RED]).toBe(10);
  });

  // --- 5. Gold Mine Mechanics ---

  it('7. Gold Mine: Doubles value', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.RESOURCE, 5);
    placeTile(board, 0, 2, TileType.GOLD_MINE);

    const scores = calculateScores(board);
    // 5 * 2 = 10
    expect(scores[PlayerColor.RED]).toBe(10);
  });

  it('8. Gold Mine Cross: Mine in column doubles resource for row castle', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.RESOURCE, 5); // Row 0
    placeTile(board, 1, 1, TileType.GOLD_MINE);   // Col 1 (Same col as resource)

    const scores = calculateScores(board);
    // 5 * 2 = 10
    expect(scores[PlayerColor.RED]).toBe(10);
  });

  it('9. Priority: Dragon > Gold Mine (Dragon kills, Gold Mine doubles 0)', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.RESOURCE, 10);
    placeTile(board, 0, 2, TileType.DRAGON);
    placeTile(board, 0, 3, TileType.GOLD_MINE);

    const scores = calculateScores(board);
    // Dragon makes it 0. Gold Mine doubles 0 to 0.
    expect(scores[PlayerColor.RED]).toBe(0);
  });
  
  // --- 6. Wizard Mechanics ---

  it('10a. Wizard (Row): Increases castle rank by 1', () => {
    const board = createEmptyBoard();
    // [Castle 1] [Wizard] [Resource 10]
    placeCastle(board, 0, 0, PlayerColor.RED, 1); // Rank 1
    placeTile(board, 0, 1, TileType.WIZARD);
    placeTile(board, 0, 2, TileType.RESOURCE, 10);
    
    const scores = calculateScores(board);
    // Effective Rank = 1 + 1 = 2
    // Score = 2 * 10 = 20
    expect(scores[PlayerColor.RED]).toBe(20);
  });

  it('10b. Wizard (Col): Increases castle rank vertically', () => {
    const board = createEmptyBoard();
    // [Castle 1]
    // [Wizard]
    // [Resource 10]
    placeCastle(board, 0, 0, PlayerColor.GREEN, 1);
    placeTile(board, 1, 0, TileType.WIZARD);
    placeTile(board, 2, 0, TileType.RESOURCE, 10);
    
    const scores = calculateScores(board);
    // Effective Rank = 1 + 1 = 2
    // Score = 2 * 10 = 20
    expect(scores[PlayerColor.GREEN]).toBe(20);
  });

  // --- 7. Complex Scenarios ---

  it('11. Complex Scenario: Dragon Cross + Mountain Protection', () => {
    //    C(Red)   R(10)   M
    //      .        .     .
    //      .        D     .
    
    // Here, Row has Castle, Resource, Mountain.
    // Column 1 has Resource and Dragon.
    // The Dragon is NOT blocked by a mountain in the Column.
    // So Resource should be 0.
    
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.RESOURCE, 10);
    placeTile(board, 0, 2, TileType.MOUNTAIN);
    
    placeTile(board, 2, 1, TileType.DRAGON); // Same col as resource

    const scores = calculateScores(board);
    expect(scores[PlayerColor.RED]).toBe(0);
  });

  it('12. Complex Scenario: Mountain isolates Dragon Cross', () => {
    //    C(Red)   R(10)   
    //      .        M     
    //      .        D     
    
    // Here, Column 1 has Resource, Mountain, Dragon.
    // Mountain separates Dragon from Resource.
    // Resource should survive.
    
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.RESOURCE, 10);
    
    placeTile(board, 1, 1, TileType.MOUNTAIN); // Blocks column
    placeTile(board, 2, 1, TileType.DRAGON);

    const scores = calculateScores(board);
    expect(scores[PlayerColor.RED]).toBe(10);
  });

  it('13. Dual Axis Scoring: Castle scores both Row and Column', () => {
    const board = createEmptyBoard();
    //   R(5)
    //   C(1)  R(5)
    
    placeCastle(board, 1, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 0, TileType.RESOURCE, 5); // In Column
    placeTile(board, 1, 1, TileType.RESOURCE, 5); // In Row
    
    const scores = calculateScores(board);
    // Row: 5 * 1 = 5
    // Col: 5 * 1 = 5
    // Total: 10
    expect(scores[PlayerColor.RED]).toBe(10);
  });

  // --- New Tests ---

  it('14. Dragon vs Hazard: Dragon does NOT negate Hazards', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.HAZARD, -5);
    placeTile(board, 0, 2, TileType.DRAGON); // Same row
    
    const scores = calculateScores(board);
    // Dragon only affects Resources (positive). Hazard remains -5.
    expect(scores[PlayerColor.RED]).toBe(-5);
  });

  it('15. Gold Mine vs Hazard: Gold Mine doubles Hazards', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.HAZARD, -5);
    placeTile(board, 0, 2, TileType.GOLD_MINE);
    
    const scores = calculateScores(board);
    // -5 * 2 = -10
    expect(scores[PlayerColor.RED]).toBe(-10);
  });

  it('16. Multiple Wizards: Bonuses stack', () => {
    const board = createEmptyBoard();
    //   W
    // W C W
    //   W
    placeCastle(board, 1, 1, PlayerColor.BLUE, 1);
    placeTile(board, 0, 1, TileType.WIZARD); // Top
    placeTile(board, 2, 1, TileType.WIZARD); // Bottom
    placeTile(board, 1, 0, TileType.WIZARD); // Left
    placeTile(board, 1, 2, TileType.WIZARD); // Right
    
    // Place a resource to score
    placeTile(board, 1, 3, TileType.RESOURCE, 10);

    const scores = calculateScores(board);
    // Rank 1 + 4 Wizards = Effective Rank 5.
    // Score = 5 * 10 = 50.
    expect(scores[PlayerColor.BLUE]).toBe(50);
  });

  it('17. Dragon in Row AND Col: Resource is definitely 0', () => {
    const board = createEmptyBoard();
    placeCastle(board, 0, 0, PlayerColor.RED, 1);
    placeTile(board, 0, 1, TileType.RESOURCE, 100);
    placeTile(board, 0, 2, TileType.DRAGON); // Row
    placeTile(board, 1, 1, TileType.DRAGON); // Col

    const scores = calculateScores(board);
    expect(scores[PlayerColor.RED]).toBe(0);
  });

});
