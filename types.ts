
export enum PlayerColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW'
}

export enum TileType {
  RESOURCE = 'RESOURCE',
  HAZARD = 'HAZARD',
  MOUNTAIN = 'MOUNTAIN',
  DRAGON = 'DRAGON',
  GOLD_MINE = 'GOLD_MINE',
  WIZARD = 'WIZARD'
}

export type Language = 'en' | 'ja';

export interface Tile {
  type: TileType;
  value: number; // Face value
  id: string; // Unique ID for React keys
}

export interface Castle {
  color: PlayerColor;
  rank: 1 | 2 | 3 | 4;
  id: string;
}

export interface CellData {
  row: number;
  col: number;
  tile: Tile | null;
  castle: Castle | null;
}

export type BoardState = CellData[][];

export interface ScoreResult {
  [key: string]: number; // PlayerColor -> Score
}

// Stats containing calculated effective values
export interface TileStats {
  effectiveValue: number; // The global effective value of this tile considering all row/col modifiers
  modifiers: string[]; // For UI: ['Dragon', 'Gold Mine']
}

export interface CastleStats {
  rowSegmentTotal: number; // Total value of tiles in this row segment
  colSegmentTotal: number; // Total value of tiles in this col segment
  rowEffectiveRank: number;
  colEffectiveRank: number;
}

export interface GameAnalysis {
  scores: ScoreResult;
  tileStats: Record<string, TileStats>;
  castleStats: Record<string, CastleStats>;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
}