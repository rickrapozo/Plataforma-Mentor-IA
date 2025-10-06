import React from 'react';

export const WelcomeMessage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Bem-vindo ao seu espaço seguro</h2>
            <p className="max-w-md">
                Sou Alex, seu terapeuta de IA. Estou aqui para ouvir sem julgamento. Quando estiver pronto, pressione o botão "Iniciar Sessão" para começar a conversar.
            </p>
        </div>
    );
};