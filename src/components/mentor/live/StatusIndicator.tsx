import React from "react";

export type SessionStatus = "IDLE" | "CONNECTING" | "LISTENING" | "ERROR" | "CLOSED";

interface StatusIndicatorProps {
  status: SessionStatus;
}

const statusConfig: Record<SessionStatus, { text: string; dotClass: string }> = {
  IDLE: { text: "Inativo", dotClass: "bg-muted" },
  CONNECTING: { text: "Conectando...", dotClass: "bg-secondary animate-pulse" },
  LISTENING: { text: "Ouvindo", dotClass: "bg-green-500 animate-pulse" },
  ERROR: { text: "Erro", dotClass: "bg-destructive" },
  CLOSED: { text: "Encerrado", dotClass: "bg-muted" },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const { text, dotClass } = statusConfig[status];
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className={`absolute inline-flex h-full w-full rounded-full ${dotClass}`} />
      </span>
      <span className="text-sm font-medium text-muted-foreground">{text}</span>
    </div>
  );
};