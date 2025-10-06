
import React from 'react';
import type { SessionStatus } from '../types';

interface StatusIndicatorProps {
  status: SessionStatus;
}

const statusConfig = {
    IDLE: { text: 'Inativo', color: 'bg-slate-500' },
    CONNECTING: { text: 'Conectando...', color: 'bg-yellow-500 animate-pulse' },
    LISTENING: { text: 'Ouvindo', color: 'bg-green-500 animate-pulse' },
    ERROR: { text: 'Erro', color: 'bg-red-500' },
    CLOSED: { text: 'Encerrado', color: 'bg-slate-500' },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const { text, color } = statusConfig[status];

    return (
        <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
                <span className={`absolute inline-flex h-full w-full rounded-full ${color}`}></span>
            </span>
            <span className="text-sm font-medium text-slate-300">{text}</span>
        </div>
    );
};
