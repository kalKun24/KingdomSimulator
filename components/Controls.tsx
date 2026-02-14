import React from 'react';
import { PlayerColor, TileType } from '../types';
import { PLAYER_CONFIG, TILES_CONFIG, getTileIcon } from '../constants';

export type ToolType = 
  | { mode: 'TILE'; type: TileType; value: number }
  | { mode: 'CASTLE'; color: PlayerColor; rank: 1 | 2 | 3 | 4 }
  | { mode: 'ERASER' };

interface BaseControlProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

export const EraserTool: React.FC<BaseControlProps> = ({ selectedTool, onSelectTool }) => {
  const isSelected = selectedTool.mode === 'ERASER';
  return (
    <button
      className={`w-full py-3 rounded-lg font-bold border-2 transition-all shadow-sm flex items-center justify-center gap-2
        ${isSelected 
          ? 'bg-red-100 border-red-500 text-red-700 ring-2 ring-red-200' 
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
        }`}
      onClick={() => onSelectTool({ mode: 'ERASER' })}
    >
      <span className="text-xl">⌫</span>
      <span>Eraser</span>
    </button>
  );
};

export const TilePanel: React.FC<BaseControlProps> = ({ selectedTool, onSelectTool }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Tiles</h3>
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {TILES_CONFIG.map((tileConf, idx) => {
          const isActive = selectedTool.mode === 'TILE' && selectedTool.type === tileConf.type && selectedTool.value === tileConf.value;
          return (
            <button
              key={`tile-${idx}`}
              onClick={() => onSelectTool({ mode: 'TILE', type: tileConf.type, value: tileConf.value })}
              className={`
                flex flex-col items-center justify-center p-1 rounded border-2 h-14 w-full
                transition-all
                ${isActive ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 z-10' : 'border-gray-200 hover:border-gray-400 bg-gray-50'}
              `}
              title={`${tileConf.type} ${tileConf.value !== 0 ? tileConf.value : ''}`}
            >
              <span className="text-xl leading-none">{getTileIcon(tileConf.type, tileConf.value)}</span>
              {(tileConf.type === TileType.RESOURCE || tileConf.type === TileType.HAZARD) && (
                 <span className="text-[10px] font-mono text-gray-500 mt-1">{tileConf.value > 0 ? `+${tileConf.value}` : tileConf.value}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const CastlePanel: React.FC<BaseControlProps> = ({ selectedTool, onSelectTool }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Castles</h3>
      <div className="space-y-3">
        {Object.values(PlayerColor).map((color) => (
          <div key={color} className="flex gap-1 justify-between">
            {[1, 2, 3, 4].map((rank) => {
              const r = rank as 1 | 2 | 3 | 4;
              const isActive = selectedTool.mode === 'CASTLE' && selectedTool.color === color && selectedTool.rank === r;
              const pConf = PLAYER_CONFIG[color];
              return (
                <button
                  key={`${color}-${rank}`}
                  onClick={() => onSelectTool({ mode: 'CASTLE', color, rank: r })}
                  className={`
                    flex-1 flex flex-col items-center justify-center rounded border-2 h-12 relative
                    transition-all
                    ${isActive ? 'ring-2 ring-offset-1 ring-black scale-105 z-10' : 'border-gray-200 hover:border-gray-400 hover:opacity-90'}
                    ${pConf.bg}
                  `}
                >
                  <span className="text-xl filter drop-shadow-sm">🏰</span>
                  <span className="absolute bottom-0 right-0.5 text-[10px] font-bold text-white bg-black/30 px-1 rounded leading-tight">{rank}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
