import React, { useEffect, useRef } from "react";

export interface TranscriptEntry {
  speaker: "user" | "ai";
  text: string;
}

interface TranscriptProps {
  entries: TranscriptEntry[];
  interimUserTranscript: string;
  interimModelTranscript: string;
}

const Bubble: React.FC<{ text: string; isUser: boolean; interim?: boolean }> = ({ text, isUser, interim }) => {
  if (!text) return null;
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={
          `max-w-prose px-4 py-3 rounded-2xl ` +
          (isUser
            ? "bg-primary text-primary-foreground rounded-br-lg"
            : "bg-card border border-primary/10 text-foreground rounded-bl-lg") +
          (interim ? " opacity-70 italic" : "")
        }
      >
        <p>{text}</p>
      </div>
    </div>
  );
};

export const Transcript: React.FC<TranscriptProps> = ({ entries, interimUserTranscript, interimModelTranscript }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, interimUserTranscript, interimModelTranscript]);

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <Bubble key={i} text={entry.text} isUser={entry.speaker === "user"} />
      ))}
      <Bubble text={interimUserTranscript} isUser={true} interim />
      <Bubble text={interimModelTranscript} isUser={false} interim />
      <div ref={endRef} />
    </div>
  );
};