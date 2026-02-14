
import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import { ToolType, TilePanel, CastlePanel, EraserTool } from './components/Controls';
import ScoreBoard from './components/ScoreBoard';
import ActionLog from './components/ActionLog';
import { BoardState, LogEntry, PlayerColor, GameAnalysis, TileType, Language } from './types';
import { BOARD_COLS, BOARD_ROWS, PLAYER_CONFIG, TRANSLATIONS } from './constants';
import { calculateGame } from './utils/scoring';

// Helper to create empty board
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

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [selectedTool, setSelectedTool] = useState<ToolType>({ mode: 'CASTLE', color: PlayerColor.RED, rank: 1 });
  const [gameAnalysis, setGameAnalysis] = useState<GameAnalysis>({ 
    scores: { RED: 0, BLUE: 0, GREEN: 0, YELLOW: 0 }, 
    tileStats: {}, 
    castleStats: {} 
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lang, setLang] = useState<Language>('ja');
  const [customNames, setCustomNames] = useState<Partial<Record<PlayerColor, string>>>({});

  // Calculate game state whenever board changes
  useEffect(() => {
    setGameAnalysis(calculateGame(board));
  }, [board]);

  const t = TRANSLATIONS[lang];

  const addLog = (message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message
    }]);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ja' : 'en');
  };

  const handleCellClick = (r: number, c: number) => {
    const newBoard = [...board.map(row => [...row])]; // Deep copy structure
    const cell = newBoard[r][c];

    if (selectedTool.mode === 'ERASER') {
      if (cell.tile || cell.castle) {
        newBoard[r][c] = { ...cell, tile: null, castle: null };
        setBoard(newBoard);
        addLog(`${t.cleared} (${r + 1}, ${c + 1})`);
      }
      return;
    }

    if (selectedTool.mode === 'TILE') {
      newBoard[r][c] = {
        ...cell,
        castle: null, // Overwrite
        tile: {
          type: selectedTool.type,
          value: selectedTool.value,
          id: Math.random().toString(36)
        }
      };
      
      const tileName = t.tileNames[selectedTool.type];
      const valStr = selectedTool.type === 'RESOURCE' || selectedTool.type === 'HAZARD' ? 
        `(${selectedTool.type === 'RESOURCE' ? '+' : ''}${selectedTool.value})` : '';
        
      addLog(`${t.placed} ${tileName} ${valStr} ${t.at} (${r + 1}, ${c + 1})`);
    } 
    
    if (selectedTool.mode === 'CASTLE') {
      newBoard[r][c] = {
        ...cell,
        tile: null, // Overwrite
        castle: {
          color: selectedTool.color,
          rank: selectedTool.rank,
          id: Math.random().toString(36)
        }
      };
      const colorName = t.colors[selectedTool.color];
      addLog(`${t.placed} ${colorName} ${t.castle} (${t.rank} ${selectedTool.rank}) ${t.at} (${r + 1}, ${c + 1})`);
    }

    setBoard(newBoard);
  };

  const handleReset = () => {
    if (window.confirm(t.confirmReset)) {
      setBoard(createEmptyBoard());
      setLogs([]); 
      addLog(t.boardResetLog);
    }
  };

  const getSelectionText = () => {
    if (selectedTool.mode === 'ERASER') return `${t.selected}: ${t.eraser}`;
    
    if (selectedTool.mode === 'TILE') {
      const tileName = t.tileNames[selectedTool.type];
      const valStr = selectedTool.value !== 0 ? Math.abs(selectedTool.value) : '';
      return `${t.selected}: ${tileName} ${valStr}`;
    }
    
    if (selectedTool.mode === 'CASTLE') {
      const colorName = t.colors[selectedTool.color];
      return `${t.selected}: ${colorName} ${t.castle} (${t.rank} ${selectedTool.rank})`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900 flex flex-col">
      <header className="bg-stone-800 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.appTitle}</h1>
            <p className="text-stone-400 text-xs">{t.subTitle}</p>
          </div>
          <div className="flex space-x-3 items-center">
            <button
              onClick={toggleLang}
              className="text-stone-300 hover:text-white font-mono border border-stone-600 px-2 py-1 rounded text-xs uppercase"
            >
              {lang === 'en' ? '日本語' : 'English'}
            </button>
            <button 
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {t.resetBtn}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[300px_1fr_300px] auto-rows-max">
          
          {/* Top Left: Scores */}
          <div className="flex flex-col gap-4">
            <ScoreBoard 
              scores={gameAnalysis.scores} 
              lang={lang} 
              customNames={customNames}
              onNameChange={(color, name) => setCustomNames(prev => ({ ...prev, [color]: name }))}
            />
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800 shadow-sm">
              <h3 className="font-bold mb-1">{t.rulesTitle}</h3>
              <ul className="list-disc pl-4 space-y-1">
                {t.rules.map((rule: string, i: number) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Center: Board (Spans 2 rows visually in large screens if needed, but flex-col works) */}
          <div className="flex flex-col items-center gap-4 lg:row-span-2">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md inline-block">
               <Board board={board} analysis={gameAnalysis} onCellClick={handleCellClick} />
            </div>
            <div className="text-center text-sm font-medium text-stone-600 bg-white px-4 py-2 rounded-full shadow-sm border border-stone-200">
               {getSelectionText()}
            </div>
            <div className="w-full max-w-xs">
              <EraserTool selectedTool={selectedTool} onSelectTool={setSelectedTool} lang={lang} />
            </div>
          </div>

          {/* Top Right: Tiles */}
          <div className="flex flex-col gap-4">
            <TilePanel selectedTool={selectedTool} onSelectTool={setSelectedTool} lang={lang} />
          </div>

          {/* Bottom Left: Logs */}
          <div className="flex flex-col h-[300px] lg:h-auto">
             <ActionLog logs={logs} lang={lang} />
          </div>

          {/* Center Space: (Occupied by Board row-span) - handled by grid flow, or we skip */}

          {/* Bottom Right: Castles */}
          <div className="flex flex-col gap-4">
            <CastlePanel selectedTool={selectedTool} onSelectTool={setSelectedTool} lang={lang} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
