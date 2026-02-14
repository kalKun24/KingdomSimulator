
import React from 'react';
import { PlayerColor, ScoreResult, Language, Epoch } from '../types';
import { PLAYER_CONFIG, TRANSLATIONS } from '../constants';

interface ScoreBoardProps {
  epochScores: Record<Epoch, ScoreResult>;
  totalScores: ScoreResult;
  lang: Language;
  customNames: Partial<Record<PlayerColor, string>>;
  onNameChange: (color: PlayerColor, name: string) => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ epochScores, totalScores, lang, customNames, onNameChange }) => {
  // Sort players by TOTAL score descending
  const sortedPlayers = Object.keys(totalScores).sort((a, b) => totalScores[b] - totalScores[a]) as PlayerColor[];
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-lg font-bold mb-3 text-stone-800 border-b pb-2">{t.scoresTitle}</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-stone-500 border-b">
              <th className="pb-2 font-medium w-full">Player</th>
              <th className="pb-2 font-medium px-2 text-center whitespace-nowrap">1</th>
              <th className="pb-2 font-medium px-2 text-center whitespace-nowrap">2</th>
              <th className="pb-2 font-medium px-2 text-center whitespace-nowrap">3</th>
              <th className="pb-2 font-bold px-2 text-right whitespace-nowrap text-stone-800">{t.total}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedPlayers.map((color) => {
              const displayName = customNames[color] !== undefined ? customNames[color] : t.colors[color];
              const pConfig = PLAYER_CONFIG[color];

              return (
                <tr key={color} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-2 pr-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 shrink-0 rounded-full ${pConfig.bg}`}></div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => onNameChange(color, e.target.value)}
                        placeholder={t.colors[color]}
                        className="font-semibold text-gray-700 bg-transparent border-b border-transparent focus:border-blue-400 hover:border-gray-300 outline-none transition-colors w-full min-w-[80px]"
                        aria-label={`Player name for ${color}`}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center text-gray-500 font-mono">
                    {epochScores[1][color]}
                  </td>
                  <td className="py-2 px-2 text-center text-gray-500 font-mono">
                    {epochScores[2][color]}
                  </td>
                  <td className="py-2 px-2 text-center text-gray-500 font-mono">
                    {epochScores[3][color]}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-gray-900 font-mono text-base">
                    {totalScores[color]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreBoard;
