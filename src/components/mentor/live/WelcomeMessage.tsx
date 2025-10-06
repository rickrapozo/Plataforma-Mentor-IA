import React from "react";

export const WelcomeMessage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
      <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo ao Mentor AI</h2>
      <p className="max-w-md">
        Este é seu espaço de clareza. Quando estiver pronto, pressione "Iniciar Sessão" para começar uma conversa ao vivo.
      </p>
    </div>
  );
};