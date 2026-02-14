
import React from 'react';
import { BoardState, CellData, TileStats, CastleStats, PlayerColor, GameAnalysis, TileType } from '../types';
import { getTileIcon, PLAYER_CONFIG } from '../constants';

interface BoardProps {
  board: BoardState;
  analysis: GameAnalysis;
  onCellClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, analysis, onCellClick }) => {
  return (
    <div className="grid grid-cols-6 gap-1 bg-stone-800 p-2 rounded-lg shadow-2xl border-4 border-stone-600 w-fit mx-auto">
      {board.map((row, rIndex) =>
        row.map((cell, cIndex) => {
          let tStats: TileStats | undefined;
          let cStats: CastleStats | undefined;
          
          if (cell.tile) {
            tStats = analysis.tileStats[cell.tile.id];
          } else if (cell.castle) {
            cStats = analysis.castleStats[cell.castle.id];
          }

          return (
            <BoardCell 
              key={`${rIndex}-${cIndex}`} 
              cell={cell} 
              tileStats={tStats}
              castleStats={cStats}
              onClick={() => onCellClick(rIndex, cIndex)} 
            />
          );
        })
      )}
    </div>
  );
};

interface CellProps {
  cell: CellData;
  tileStats?: TileStats;
  castleStats?: CastleStats;
  onClick: () => void;
}

const BoardCell: React.FC<CellProps> = ({ cell, tileStats, castleStats, onClick }) => {
  const tile = cell.tile;
  const castle = cell.castle;

  let content = null;
  let bgClass = "bg-stone-200 hover:bg-stone-100";
  let textClass = "text-stone-800";
  let borderClass = "border-stone-400";

  // --- Visualization Helpers ---
  const renderTileStats = (stats: TileStats, faceValue: number) => {
    // Show stats if effective value differs from face value
    if (stats.effectiveValue === faceValue) return null;

    const isZeroed = stats.effectiveValue === 0 && faceValue !== 0;
    const isDoubled = Math.abs(stats.effectiveValue) > Math.abs(faceValue);

    return (
      <div className="absolute top-0 right-0 p-1 pointer-events-none">
        <span className={`
          text-[10px] font-bold font-mono px-1 rounded shadow-sm border
          ${isZeroed ? 'bg-red-500 text-white border-red-700' : ''}
          ${isDoubled ? 'bg-yellow-400 text-black border-yellow-600' : ''}
        `}>
          {stats.effectiveValue}
        </span>
      </div>
    );
  };

  const renderCastleStats = (stats: CastleStats) => {
    return (
      <div className="absolute pointer-events-none flex flex-col justify-between h-full w-full p-0.5 text-[9px] leading-tight font-mono font-bold text-white drop-shadow-md z-20">
        <div className={`self-end ${stats.rowSegmentTotal === 0 ? 'text-red-300' : ''}`}>
           {`↔${stats.rowSegmentTotal}`}
        </div>
        <div className={`self-end mt-auto ${stats.colSegmentTotal === 0 ? 'text-red-300' : ''}`}>
           {`↕${stats.colSegmentTotal}`}
        </div>
      </div>
    );
  };

  if (castle) {
    const pConfig = PLAYER_CONFIG[castle.color];
    bgClass = `${pConfig.bg} hover:brightness-110`;
    textClass = "text-white font-bold";
    borderClass = pConfig.border;
    
    content = (
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        <span className="text-2xl drop-shadow-md z-0">🏰</span>
        <div className="absolute top-1 left-1 text-xs font-mono bg-black/40 rounded px-1.5 z-10 border border-white/20">
          {castle.rank}
          {(castleStats && (castleStats.rowEffectiveRank > castle.rank || castleStats.colEffectiveRank > castle.rank)) && <span className="text-blue-200 ml-0.5" title="Wizard Bonus">+</span>}
        </div>
        {castleStats && renderCastleStats(castleStats)}
      </div>
    );
  } else if (tile) {
    const icon = getTileIcon(tile.type, tile.value);
    
    if (tile.type === TileType.RESOURCE) {
      bgClass = "bg-green-100 hover:bg-green-50";
      textClass = "text-green-800 font-bold";
      borderClass = "border-green-300";
    } else if (tile.type === TileType.HAZARD) {
      bgClass = "bg-red-100 hover:bg-red-50";
      textClass = "text-red-800 font-bold";
      borderClass = "border-red-300";
    } else if (tile.type === TileType.MOUNTAIN) {
      bgClass = "bg-stone-600 hover:bg-stone-500";
      textClass = "text-white text-3xl";
      borderClass = "border-stone-800";
    } else if (tile.type === TileType.DRAGON) {
      bgClass = "bg-purple-100 hover:bg-purple-50";
      textClass = "text-4xl";
      borderClass = "border-purple-300";
    } else if (tile.type === TileType.GOLD_MINE) {
      bgClass = "bg-yellow-100 hover:bg-yellow-50";
      textClass = "text-4xl";
      borderClass = "border-yellow-300";
    } else if (tile.type === TileType.WIZARD) {
      bgClass = "bg-blue-100 hover:bg-blue-50";
      textClass = "text-4xl";
      borderClass = "border-blue-300";
    }

    content = (
      <>
        <span className="drop-shadow-sm">{icon}</span>
        {tileStats && (tile.type === TileType.RESOURCE || tile.type === TileType.HAZARD) && renderTileStats(tileStats, tile.value)}
      </>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 relative 
        flex items-center justify-center 
        cursor-pointer rounded-md border-b-4 
        transition-all duration-100 active:border-b-0 active:translate-y-1
        ${bgClass} ${textClass} ${borderClass}
        text-2xl select-none
      `}
    >
      {content}
    </div>
  );
};

export default Board;
