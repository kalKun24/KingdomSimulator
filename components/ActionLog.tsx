import React, { useEffect, useRef } from 'react';
import { LogEntry, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ActionLogProps {
  logs: LogEntry[];
  lang: Language;
}

const ActionLog: React.FC<ActionLogProps> = ({ logs, lang }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 h-64 flex flex-col">
      <h2 className="text-lg font-bold mb-2 text-stone-800 border-b pb-2">{t.logTitle}</h2>
      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {logs.length === 0 && <p className="text-gray-400 italic text-sm">{t.noActions}</p>}
        {logs.map((log) => (
          <div key={log.id} className="text-sm border-l-2 border-stone-300 pl-2 py-1">
            <span className="text-gray-400 text-xs block">{log.timestamp.toLocaleTimeString()}</span>
            <span className="text-gray-700">{log.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ActionLog;