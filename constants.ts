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

export const TRANSLATIONS = {
  en: {
    appTitle: 'Kingdoms Calculator',
    subTitle: 'Reiner Knizia\'s Kingdoms Board Game Helper',
    resetBtn: 'Reset Board',
    scoresTitle: 'Scores',
    rulesTitle: 'Scoring Rules',
    rules: [
      'Resources (+): Add value',
      'Hazards (-): Subtract value',
      'Mountain: Blocks row/column',
      'Dragon: Negates resources in row/column',
      'Gold Mine: Doubles value in row/column',
      'Wizard: Increases adjacent castle rank by 1',
    ],
    tileNames: {
      [TileType.RESOURCE]: 'Resource',
      [TileType.HAZARD]: 'Hazard',
      [TileType.MOUNTAIN]: 'Mountain',
      [TileType.DRAGON]: 'Dragon',
      [TileType.GOLD_MINE]: 'Gold Mine',
      [TileType.WIZARD]: 'Wizard',
    },
    colors: {
      [PlayerColor.RED]: 'Red',
      [PlayerColor.BLUE]: 'Blue',
      [PlayerColor.GREEN]: 'Green',
      [PlayerColor.YELLOW]: 'Yellow',
    },
    cleared: 'Cleared cell at',
    placed: 'Placed',
    at: 'at',
    castle: 'Castle',
    rank: 'Rank',
    confirmReset: 'Are you sure you want to clear the board?',
    boardResetLog: 'Board has been reset.',
    selected: 'Selected',
    eraser: 'Eraser',
    tilesTitle: 'Tiles',
    castlesTitle: 'Castles',
    noActions: 'No actions yet.',
    logTitle: 'Action Log',
  },
  ja: {
    appTitle: 'キングダム カリキュレーター',
    subTitle: 'ライナー・クニツィアのキングダム ボードゲーム支援ツール',
    resetBtn: 'リセット',
    scoresTitle: 'スコア',
    rulesTitle: 'スコア計算ルール',
    rules: [
      '資源 (+): 数値を加算',
      '災い (-): 数値を減算',
      '山脈: 行/列を分断する',
      'ドラゴン: 行/列の資源を無効化',
      '金山: 行/列の価値を2倍にする',
      '魔法使い: 隣接する城のランクを+1',
    ],
    tileNames: {
      [TileType.RESOURCE]: '資源',
      [TileType.HAZARD]: '災い',
      [TileType.MOUNTAIN]: '山脈',
      [TileType.DRAGON]: 'ドラゴン',
      [TileType.GOLD_MINE]: '金山',
      [TileType.WIZARD]: '魔法使い',
    },
    colors: {
      [PlayerColor.RED]: '赤',
      [PlayerColor.BLUE]: '青',
      [PlayerColor.GREEN]: '緑',
      [PlayerColor.YELLOW]: '黄',
    },
    cleared: 'セルをクリアしました',
    placed: '配置しました:',
    at: '場所:',
    castle: '城',
    rank: 'ランク',
    confirmReset: 'ボードをクリアしてもよろしいですか？',
    boardResetLog: 'ボードがリセットされました。',
    selected: '選択中',
    eraser: '消しゴム',
    tilesTitle: 'タイル',
    castlesTitle: '城',
    noActions: '履歴はありません',
    logTitle: 'アクションログ',
  },
};