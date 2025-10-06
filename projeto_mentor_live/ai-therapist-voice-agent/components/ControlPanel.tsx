
import React from 'react';
import type { SessionStatus } from '../types';

interface ControlPanelProps {
  status: SessionStatus;
  onStart: () => void;
  onEnd: () => void;
}

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
    </svg>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({ status, onStart, onEnd }) => {
  const isIdle = status === 'IDLE' || status === 'CLOSED' || status === 'ERROR';
  const isConnecting = status === 'CONNECTING';
  const isListening = status === 'LISTENING';

  return (
    <div className="flex items-center justify-center">
      {isIdle && (
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
        >
          <MicIcon />
          Iniciar Sessão
        </button>
      )}
      {isConnecting && (
        <button
          disabled
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-full cursor-not-allowed"
        >
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Conectando...
        </button>
      )}
      {isListening && (
        <button
          onClick={onEnd}
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500"
        >
          <StopIcon />
          Terminar Sessão
        </button>
      )}
    </div>
  );
};
