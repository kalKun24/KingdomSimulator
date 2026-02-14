import { PlayerColor, Tile, TileType } from './types';

export const BOARD_ROWS = 5;
export const BOARD_COLS = 6;

export const PLAYER_CONFIG: Record<PlayerColor, { name: string; hex: string; bg: string; border: string }> = {
  [PlayerColor.RED]: { name: 'Red', hex: '#ef4444', bg: 'bg-red-500', border: 'border-red-700' },
  [PlayerColor.BLUE]: { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500', border: 'border-blue-700' },
  [PlayerColor.GREEN]: { name: 'Green', hex: '#22c55e', bg: 'bg-green-500', border: 'border-green-700' },
  [PlayerColor.YELLOW]: { name: 'Yellow', hex: '#eab308', bg: 'bg-yellow-400', border: 'border-yellow-600' },
};

export const TILES_CONFIG = [
  // Resources
  ...Array.from({ length: 6 }, (_, i) => ({ type: TileType.RESOURCE, value: i + 1, label: `+${i + 1}` })),
  // Hazards
  ...Array.from({ length: 6 }, (_, i) => ({ type: TileType.HAZARD, value: -(i + 1), label: `${-(i + 1)}` })),
  // Specials
  { type: TileType.MOUNTAIN, value: 0, label: 'Mountain' },
  { type: TileType.DRAGON, value: 0, label: 'Dragon' },
  { type: TileType.GOLD_MINE, value: 0, label: 'Gold Mine' },
  { type: TileType.WIZARD, value: 0, label: 'Wizard' },
];

export const getTileIcon = (type: TileType, value: number) => {
  switch (type) {
    case TileType.RESOURCE: return `+${value}`;
    case TileType.HAZARD: return `${value}`;
    case TileType.MOUNTAIN: return '🏔️';
    case TileType.DRAGON: return '🐉';
    case TileType.GOLD_MINE: return '⛏️'; // Using pickaxe/goldmine feel
    case TileType.WIZARD: return '🧙';
    default: return '?';
  }
};
