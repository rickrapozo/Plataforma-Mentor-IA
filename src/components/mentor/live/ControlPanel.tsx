import React from "react";
import type { SessionStatus } from "./StatusIndicator";

interface ControlPanelProps {
  status: SessionStatus;
  onStart: () => void;
  onEnd: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ status, onStart, onEnd }) => {
  const isIdle = status === "IDLE" || status === "CLOSED" || status === "ERROR";
  const isConnecting = status === "CONNECTING";
  const isListening = status === "LISTENING";

  return (
    <div className="flex items-center justify-center">
      {isIdle && (
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-6 py-3 font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/80 transition-colors duration-200"
        >
          <span className="inline-flex w-5 h-5 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v8m0 0a3 3 0 11-6 0V5a3 3 0 016 0v4zm0 0a3 3 0 106 0V5a3 3 0 10-6 0v4zM5 10a7 7 0 0014 0M12 17v6m0 0H8m4 0h4" />
            </svg>
          </span>
          Iniciar Sessão
        </button>
      )}

      {isConnecting && (
        <button disabled className="flex items-center gap-2 px-6 py-3 font-semibold bg-secondary text-secondary-foreground rounded-full cursor-not-allowed">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Conectando...
        </button>
      )}

      {isListening && (
        <button
          onClick={onEnd}
          className="flex items-center gap-2 px-6 py-3 font-semibold bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80 transition-colors duration-200"
        >
          <span className="inline-flex w-5 h-5 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
            </svg>
          </span>
          Terminar Sessão
        </button>
      )}
    </div>
  );
};