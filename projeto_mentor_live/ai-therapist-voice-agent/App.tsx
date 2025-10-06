
import React, { useState, useCallback, useRef } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import type { SessionStatus, TranscriptEntry } from './types';
import { Transcript } from './components/Transcript';
import { ControlPanel } from './components/ControlPanel';
import { StatusIndicator } from './components/StatusIndicator';
import { WelcomeMessage } from './components/WelcomeMessage';

const App: React.FC = () => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  
  const interimUserTranscriptRef = useRef<string>('');
  const interimModelTranscriptRef = useRef<string>('');

  const handleMessage = useCallback((message: any) => {
    if (message.serverContent?.inputTranscription) {
      interimUserTranscriptRef.current += message.serverContent.inputTranscription.text;
      // Force a re-render to show interim results
      setTranscript(prev => [...prev]);
    }
    
    if (message.serverContent?.outputTranscription) {
      interimModelTranscriptRef.current += message.serverContent.outputTranscription.text;
      // Force a re-render to show interim results
      setTranscript(prev => [...prev]);
    }

    if (message.serverContent?.turnComplete) {
      const finalUserInput = interimUserTranscriptRef.current.trim();
      const finalModelOutput = interimModelTranscriptRef.current.trim();

      setTranscript(prev => {
        const newTranscript = [...prev];
        if (finalUserInput) {
          newTranscript.push({ speaker: 'user', text: finalUserInput });
        }
        if (finalModelOutput) {
          newTranscript.push({ speaker: 'ai', text: finalModelOutput });
        }
        return newTranscript;
      });

      interimUserTranscriptRef.current = '';
      interimModelTranscriptRef.current = '';
    }
  }, []);

  const { startSession, endSession } = useGeminiLive({
    onStatusChange: setStatus,
    onMessage: handleMessage,
  });

  const handleStart = useCallback(() => {
    setTranscript([]);
    interimUserTranscriptRef.current = '';
    interimModelTranscriptRef.current = '';
    startSession();
  }, [startSession]);

  const handleEnd = useCallback(() => {
    endSession();
  }, [endSession]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 font-sans text-white p-4">
      <div className="w-full max-w-3xl h-[90vh] flex flex-col bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <header className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-200">Terapeuta IA</h1>
          </div>
          <StatusIndicator status={status} />
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {transcript.length === 0 && status === 'IDLE' && <WelcomeMessage />}
          <Transcript 
            entries={transcript}
            interimUserTranscript={interimUserTranscriptRef.current}
            interimModelTranscript={interimModelTranscriptRef.current}
          />
        </main>

        <footer className="p-4 border-t border-slate-700 bg-slate-800/80 backdrop-blur-sm">
          <ControlPanel status={status} onStart={handleStart} onEnd={handleEnd} />
        </footer>
      </div>
    </div>
  );
};

export default App;
