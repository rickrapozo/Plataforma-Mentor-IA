
export type SessionStatus = 'IDLE' | 'CONNECTING' | 'LISTENING' | 'ERROR' | 'CLOSED';

export interface TranscriptEntry {
  speaker: 'user' | 'ai';
  text: string;
}
