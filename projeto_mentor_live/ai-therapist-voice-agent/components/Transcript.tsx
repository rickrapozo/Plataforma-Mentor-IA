
import React, { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '../types';

interface TranscriptProps {
  entries: TranscriptEntry[];
  interimUserTranscript: string;
  interimModelTranscript: string;
}

const ChatBubble: React.FC<{ entry: TranscriptEntry }> = ({ entry }) => {
  const isUser = entry.speaker === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-prose px-4 py-3 rounded-2xl ${isUser ? 'bg-blue-600 rounded-br-lg' : 'bg-slate-700 rounded-bl-lg'}`}>
        <p className="text-slate-100">{entry.text}</p>
      </div>
    </div>
  );
};

const InterimBubble: React.FC<{ text: string, isUser: boolean }> = ({ text, isUser }) => {
    if (!text) return null;
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-prose px-4 py-3 rounded-2xl opacity-70 ${isUser ? 'bg-blue-600 rounded-br-lg' : 'bg-slate-700 rounded-bl-lg'}`}>
                <p className="text-slate-300 italic">{text}</p>
            </div>
        </div>
    );
};


export const Transcript: React.FC<TranscriptProps> = ({ entries, interimUserTranscript, interimModelTranscript }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, interimUserTranscript, interimModelTranscript]);
  
  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <ChatBubble key={index} entry={entry} />
      ))}
      <InterimBubble text={interimUserTranscript} isUser={true} />
      <InterimBubble text={interimModelTranscript} isUser={false} />
      <div ref={endOfMessagesRef} />
    </div>
  );
};
