
import React from 'react';
import { PlayerColor, ScoreResult, Language } from '../types';
import { PLAYER_CONFIG, TRANSLATIONS } from '../constants';

interface ScoreBoardProps {
  scores: ScoreResult;
  lang: Language;
  customNames: Partial<Record<PlayerColor, string>>;
  onNameChange: (color: PlayerColor, name: string) => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores, lang, customNames, onNameChange }) => {
  // Sort players by score descending
  const sortedPlayers = Object.keys(scores).sort((a, b) => scores[b] - scores[a]) as PlayerColor[];
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-lg font-bold mb-3 text-stone-800 border-b pb-2">{t.scoresTitle}</h2>
      <div className="space-y-3">
        {sortedPlayers.map((color) => {
          // Use custom name if set, otherwise fallback to translated color name
          const displayName = customNames[color] !== undefined ? customNames[color] : t.colors[color];

          return (
            <div key={color} className="flex items-center justify-between p-2 rounded bg-gray-50">
              <div className="flex items-center space-x-2 flex-1">
                <div className={`w-4 h-4 shrink-0 rounded-full ${PLAYER_CONFIG[color].bg}`}></div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => onNameChange(color, e.target.value)}
                  placeholder={t.colors[color]}
                  className="font-semibold text-gray-700 bg-transparent border-b border-transparent focus:border-blue-400 hover:border-gray-300 outline-none transition-colors w-full px-1"
                  aria-label={`Player name for ${color}`}
                />
              </div>
              <span className="text-2xl font-mono font-bold text-gray-900 ml-4">{scores[color]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBoard;
