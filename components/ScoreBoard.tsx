import React from 'react';
import { PlayerColor, ScoreResult } from '../types';
import { PLAYER_CONFIG } from '../constants';

interface ScoreBoardProps {
  scores: ScoreResult;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores }) => {
  // Sort players by score descending
  const sortedPlayers = Object.keys(scores).sort((a, b) => scores[b] - scores[a]) as PlayerColor[];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-lg font-bold mb-3 text-stone-800 border-b pb-2">Scores</h2>
      <div className="space-y-3">
        {sortedPlayers.map((color) => (
          <div key={color} className="flex items-center justify-between p-2 rounded bg-gray-50">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${PLAYER_CONFIG[color].bg}`}></div>
              <span className="font-semibold text-gray-700">{PLAYER_CONFIG[color].name}</span>
            </div>
            <span className="text-2xl font-mono font-bold text-gray-900">{scores[color]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;
