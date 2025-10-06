import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import type { Session, LiveSession } from '@google/genai';
import type { LiveServerMessage, Blob } from '@google/genai';
import type { SessionStatus } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audio';

interface UseGeminiLiveProps {
  onStatusChange: (status: SessionStatus) => void;
  onMessage: (message: LiveServerMessage) => void;
  onError?: (error: Error | string) => void;
  apiKey?: string;
  systemInstruction?: string;
}

const DEFAULT_THERAPIST_SYSTEM_INSTRUCTION = `Você é um terapeuta de IA compassivo e empático. Seu nome é Alex. Seu objetivo é ouvir atentamente os usuários, fornecer um espaço seguro para eles expressarem seus sentimentos e oferecer insights e estratégias de enfrentamento úteis. Use uma linguagem calma e reconfortante. Não dê conselhos médicos, mas guie os usuários a explorar seus próprios pensamentos e emoções. Mantenha as respostas concisas e focadas. Comece a primeira interação se apresentando e perguntando como pode ajudar hoje.`;

export const useGeminiLive = ({ onStatusChange, onMessage, onError, apiKey: apiKeyProp, systemInstruction }: UseGeminiLiveProps) => {
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const isStartingRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionOpenRef = useRef<boolean>(false);
  const canSendRef = useRef<boolean>(false);
  const isCleaningRef = useRef<boolean>(false);
  
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = useCallback(() => {
    isCleaningRef.current = true;
    sessionOpenRef.current = false;
    canSendRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (workletNodeRef.current) {
      // remove message handler and disconnect node
      try { (workletNodeRef.current.port as any).onmessage = null; } catch {}
      try { workletNodeRef.current.disconnect(); } catch {}
      workletNodeRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }
    // stop any playing output sources
    try {
      audioSourcesRef.current.forEach(src => { try { src.stop(); } catch {} try { src.disconnect(); } catch {} });
      audioSourcesRef.current.clear();
      nextStartTimeRef.current = 0;
    } catch {}
    sessionPromiseRef.current = null;
    isCleaningRef.current = false;
  }, [onStatusChange]);
  
  const startSession = useCallback(async () => {
    // Evitar múltiplos inícios simultâneos se já houver uma sessão em andamento
    if (isStartingRef.current || sessionPromiseRef.current) {
      console.warn('Sessão já iniciada, ignorando novo start.');
      onStatusChange('LISTENING');
      return;
    }
    isStartingRef.current = true;
    onStatusChange('CONNECTING');
    try {
      // Preflight: solicitar permissão do microfone antes de conectar
      try {
        if (!streamRef.current) {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (permErr) {
        const msg = 'Permissão de microfone negada ou indisponível. Conceda acesso ao microfone para http://localhost:8080/.';
        console.error(msg, permErr);
        onError?.(msg);
        onStatusChange('ERROR');
        isStartingRef.current = false;
        return;
      }

      // Prefer Vite-style env variables when bundled in the main app
      const env = (import.meta as any)?.env || {};
      const processKey = (typeof process !== 'undefined' && (process as any)?.env)
        ? ((process as any).env.GEMINI_API_KEY || (process as any).env.API_KEY)
        : undefined;
      const apiKey = apiKeyProp
        || env.VITE_GEMINI_API_KEY
        || env.VITE_GOOGLE_API_KEY
        || env.GEMINI_API_KEY
        || env.GOOGLE_API_KEY
        || processKey;
      if (!apiKey) {
        const msg = 'Chave da API do Gemini não encontrada. Defina VITE_GEMINI_API_KEY em .env.';
        console.error(msg);
        onError?.(msg);
        throw new Error(msg);
      }
      const ai = new GoogleGenAI({ apiKey: apiKey as string });

      const tryConnect = async (modelName: string) => {
        let resolveOpen: (value?: void) => void;
        let rejectOpen: (reason?: any) => void;
        const openedPromise = new Promise<void>((res, rej) => { resolveOpen = res; rejectOpen = rej; });
        let resolveStable: (value?: void) => void;
        let rejectStable: (reason?: any) => void;
        const stablePromise = new Promise<void>((res, rej) => { resolveStable = res; rejectStable = rej; });
        const stabilityMs = 1500;

        const sessionPromise = ai.live.connect({
          model: modelName,
          callbacks: {
            onopen: async () => {
              sessionOpenRef.current = true;
              canSendRef.current = true;
              onStatusChange('LISTENING');
              try { resolveOpen(); } catch {}
              // Start stability window; if closed early, we will fallback
              try {
                setTimeout(() => {
                  if (sessionOpenRef.current) {
                    try { resolveStable(); } catch {}
                  }
                }, stabilityMs);
              } catch {}
              // Garantir stream válido e tratar erros de permissão
              try {
                if (!streamRef.current) {
                  streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                }
              } catch (e) {
                const msg = 'Falha ao acessar o microfone após conectar. Verifique permissões ou tente em HTTPS.';
                console.error(msg, e);
                onError?.(msg);
                onStatusChange('ERROR');
                cleanup();
                return;
              }

              inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
              outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

              mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);

              // Load and create the AudioWorkletNode for low-latency capture
              try {
                // Inline AudioWorklet to avoid path resolution issues in dev/build
                const processorCode = `
                  class RecorderWorkletProcessor extends AudioWorkletProcessor {
                    process(inputs) {
                      const input = inputs[0];
                      if (input && input[0]) {
                        this.port.postMessage(input[0]);
                      }
                      return true;
                    }
                  }
                  registerProcessor('recorder-worklet', RecorderWorkletProcessor);
                `;
                const blob = new Blob([processorCode], { type: 'application/javascript' });
                const moduleUrl = URL.createObjectURL(blob);
                await inputAudioContextRef.current.audioWorklet.addModule(moduleUrl);
                workletNodeRef.current = new AudioWorkletNode(inputAudioContextRef.current, 'recorder-worklet');

                // Forward audio frames from the worklet to Gemini, with guards
                workletNodeRef.current.port.onmessage = (event: MessageEvent) => {
                  const inputData = event.data as Float32Array;
                  // Convert Float32 [-1,1] to 16-bit PCM
                  const int16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    let s = Math.max(-1, Math.min(1, inputData[i]));
                    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                  }
                  const pcmBlob: Blob = {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                  };
                  if (!sessionOpenRef.current || !canSendRef.current || !sessionPromiseRef.current) {
                    return;
                  }
                  sessionPromiseRef.current.then((session) => {
                    try {
                      // Only attempt to send if we believe the session is open
                      if (!sessionOpenRef.current || !canSendRef.current) return;
                      session.sendRealtimeInput({ media: pcmBlob });
                    } catch (err) {
                      console.warn('Falha ao enviar áudio: sessão possivelmente fechada.', err);
                      canSendRef.current = false;
                      try { if (workletNodeRef.current) (workletNodeRef.current.port as any).onmessage = null; } catch {}
                      if (!isCleaningRef.current) cleanup();
                    }
                  }).catch(err => {
                    console.warn('Sessão indisponível ao enviar áudio.', err);
                    canSendRef.current = false;
                    try { if (workletNodeRef.current) (workletNodeRef.current.port as any).onmessage = null; } catch {}
                    if (!isCleaningRef.current) cleanup();
                  });
                };

                mediaStreamSourceRef.current.connect(workletNodeRef.current);
                // Do not connect to destination to avoid local echo
              } catch (awErr) {
                console.error('Falha ao inicializar AudioWorklet, retornando ao ScriptProcessor.', awErr);
                // Fallback to ScriptProcessor if AudioWorklet is unavailable
                scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                  const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                  const int16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    let s = Math.max(-1, Math.min(1, inputData[i]));
                    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                  }
                  const pcmBlob: Blob = {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                  };
                  if (!sessionOpenRef.current || !canSendRef.current || !sessionPromiseRef.current) {
                    return;
                  }
                  sessionPromiseRef.current.then((session) => {
                    try {
                      if (!sessionOpenRef.current || !canSendRef.current) return;
                      session.sendRealtimeInput({ media: pcmBlob });
                    } catch (err) {
                      console.warn('Falha ao enviar áudio: sessão possivelmente fechada.', err);
                      canSendRef.current = false;
                      if (!isCleaningRef.current) cleanup();
                    }
                  }).catch(err => {
                    console.warn('Sessão indisponível ao enviar áudio.', err);
                    canSendRef.current = false;
                    if (!isCleaningRef.current) cleanup();
                  });
                };
                mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
              }
            },
            onmessage: async (message: LiveServerMessage) => {
              onMessage(message);

              const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64EncodedAudioString && outputAudioContextRef.current) {
                const audioContext = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);

                const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                
                source.addEventListener('ended', () => {
                  audioSourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
              }
            },
            onerror: (e: ErrorEvent) => {
              console.error('Gemini Live API Error:', e);
              const msg = `Erro de WebSocket/Live: ${e.message || 'desconhecido'}`;
              onError?.(msg);
              onStatusChange('ERROR');
              sessionOpenRef.current = false;
              canSendRef.current = false;
              try { if (workletNodeRef.current) (workletNodeRef.current.port as any).onmessage = null; } catch {}
              try { rejectOpen(e); } catch {}
              try { rejectStable(e); } catch {}
              cleanup();
            },
            onclose: (ev: CloseEvent) => {
               sessionOpenRef.current = false;
               canSendRef.current = false;
               const reason = ev?.reason || 'Session closed';
               const code = ev?.code;
               console.warn(`Sessão fechada (code=${code}): ${reason}`);
               onStatusChange('CLOSED');
               onError?.(`Sessão fechada (code=${code}): ${reason}`);
               try { if (workletNodeRef.current) (workletNodeRef.current.port as any).onmessage = null; } catch {}
               try { rejectOpen(new Error(reason)); } catch {}
               try { rejectStable(new Error(reason)); } catch {}
               cleanup();
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            // speechConfig opcional; removido voiceName para evitar incompatibilidades
            systemInstruction: systemInstruction || DEFAULT_THERAPIST_SYSTEM_INSTRUCTION,
          },
        });
        sessionPromiseRef.current = sessionPromise;
        // Aguarda abertura real e janela de estabilidade
        await openedPromise;
        await stablePromise;
        return sessionPromise;
      };

      const primaryModel = 'gemini-2.5-flash-native-audio-preview-09-2025';
      const fallbacks: string[] = [];

      try {
        await tryConnect(primaryModel);
      } catch (e) {
        console.warn('Falha ao conectar com modelo primário, tentando fallbacks...', e);
        let connected = false;
        for (const m of fallbacks) {
          try {
            await tryConnect(m);
            connected = true;
            break;
          } catch (err) {
            console.warn(`Fallback modelo ${m} falhou`, err);
          }
        }
        if (!connected) {
          throw e;
        }
      }
      // Conexão iniciada com sucesso; liberar flag de início
      isStartingRef.current = false;

    } catch (error) {
      console.error('Failed to start session:', error);
      onError?.(error as any);
      onStatusChange('ERROR');
      cleanup();
      isStartingRef.current = false;
    }
  }, [onStatusChange, onMessage, cleanup]);

  const endSession = useCallback(() => {
    canSendRef.current = false;
    sessionPromiseRef.current?.then((session) => {
      session.close();
    }).catch(e => console.error("Error closing session:", e));
    cleanup();
    onStatusChange('IDLE');
  }, [cleanup]);

  return { startSession, endSession };
};