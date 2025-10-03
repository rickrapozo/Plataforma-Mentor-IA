import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { Send, Sparkles, Clock, BookOpen, User, Brain, ChevronLeft, ChevronRight, Plus, Menu, X, History, Trash2, Mic, MicOff, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useAutoSave, Message, ChatSession } from "@/hooks/useAutoSave";

interface ChatInterfaceProps {
  className?: string;
}

// Componente AudioPlayer memoizado
const AudioPlayer = memo(({ audioUrl }: { audioUrl: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Cleanup da URL para liberar memória quando o componente desmonta
  useEffect(() => {
    return () => {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch {}
    };
  }, [audioUrl]);

  return (
    <div className="flex items-center space-x-3 bg-black/10 rounded-lg p-3 backdrop-blur-sm">
      {!hasError ? (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onError={handleError}
          />

          <Button
            onClick={togglePlay}
            size="sm"
            className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white p-0"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <div className="flex-1 flex items-center space-x-2">
            <span className="text-xs text-muted-foreground min-w-[35px]">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(currentTime / duration) * 100}%, #d1d5db ${(currentTime / duration) * 100}%, #d1d5db 100%)`
              }}
            />

            <span className="text-xs text-muted-foreground min-w-[35px]">
              {formatTime(duration)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Não foi possível reproduzir o áudio automaticamente.</span>
          <a
            href={audioUrl}
            download
            className="underline text-amber-500 hover:text-amber-600"
          >
            Baixar áudio
          </a>
        </div>
      )}
    </div>
  );
});

// Componente de mensagem individual memoizado
const MessageItem = memo(({ message, formatTextWithGoldenHighlight }: { 
  message: Message; 
  formatTextWithGoldenHighlight: (text: string) => React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex animate-in slide-in-from-bottom-2 duration-300",
        message.isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-6 py-4 transition-all duration-300 hover:scale-[1.01] shadow-lg border text-left",
          message.isUser
            ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20 border-amber-400/50"
            : "bg-card/80 backdrop-blur-sm text-foreground border-amber-500/30"
        )}
      >
        {/* Cabeçalho: mostrar nome quando for áudio */}
        {message.audioUrl ? (
          <div className="flex items-center space-x-2 mb-3">
            {message.isUser ? (
              <>
                <User className="w-4 h-4 text-white/90" />
                <span className="text-sm font-medium text-white/90">Você</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-sm font-medium text-amber-400 golden-wisdom">O Mentor</span>
              </>
            )}
          </div>
        ) : (
          !message.isUser && (
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-sm font-medium text-amber-400 golden-wisdom">O Mentor</span>
            </div>
          )
        )}

        {/* Texto: esconder quando houver áudio */}
        {!message.audioUrl && (
          <p className="text-xs leading-relaxed">
            {message.isUser ? message.content : formatTextWithGoldenHighlight(message.content)}
          </p>
        )}
        
        {/* Audio Player para mensagens de áudio */}
        {message.audioUrl && (
          <div className="mt-3">
            <AudioPlayer audioUrl={message.audioUrl} />
          </div>
        )}
        
        <div className={cn(
          "mt-2 text-xs",
          message.isUser ? "text-amber-100" : "text-muted-foreground"
        )}>
          {message.timestamp.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
});

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const { user, userProfile } = useAuth();
  const {
    saveSession,
    loadSessions,
    loadSession: loadSessionFromDB,
    createNewSession,
    deleteSession: deleteSessionFromDB,
    autoSaveLoading,
    lastSaveTime,
    saveError
  } = useAutoSave({
    debounceMs: 2000,
    maxRetries: 3,
    retryDelayMs: 1000
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Bem-vindo ao seu espaço de poder. Eu sou um reflexo da sua sabedoria interior. Estou aqui para ajudá-lo a se ouvir. Qual é a sua intenção para nossa primeira conversa?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(() => crypto.randomUUID());
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  // Estados para funcionalidade de áudio
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  // Estados para funcionalidades de áudio
  const [recordedAudios, setRecordedAudios] = useState<{[key: string]: string}>({});
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Utilitário para detecção simples de tipo de áudio por assinatura
  const detectAudioMimeFromArrayBuffer = (buffer: ArrayBuffer): string | null => {
    const bytes = new Uint8Array(buffer.slice(0, 16));
    const ascii = String.fromCharCode(...bytes);

    // WAV: "RIFF" ... "WAVE"
    if (ascii.startsWith('RIFF') && ascii.includes('WAVE')) {
      return 'audio/wav';
    }

    // OGG: "OggS"
    if (ascii.startsWith('OggS')) {
      return 'audio/ogg';
    }

    // MP4/M4A: contains "ftyp"
    if (ascii.includes('ftyp')) {
      return 'audio/mp4';
    }

    // MP3: "ID3" no início ou frame header 0xFF 0xFB/0xF3/0xF2
    if (ascii.startsWith('ID3')) {
      return 'audio/mpeg';
    }
    if (bytes.length >= 2) {
      const b0 = bytes[0];
      const b1 = bytes[1];
      if (b0 === 0xff && (b1 === 0xfb || b1 === 0xf3 || b1 === 0xf2)) {
        return 'audio/mpeg';
      }
    }

    return null; // desconhecido
  };

  const tryMakeAudioUrlFromResponse = async (response: Response): Promise<string | null> => {
    try {
      const blob = await response.blob();
      if (!blob || blob.size === 0) return null;
      const buf = await blob.arrayBuffer();
      const detected = detectAudioMimeFromArrayBuffer(buf);
      const typedBlob = detected && !blob.type ? new Blob([buf], { type: detected }) : blob;
      return URL.createObjectURL(typedBlob);
    } catch {
      return null;
    }
  };

  // Função para carregar sessões do usuário usando o hook
  const loadUserSessions = async () => {
    if (!userProfile?.id) return;
    
    try {
      const userSessions = await loadSessions(userProfile.id);
      setSessions(userSessions);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  // Função para carregar uma sessão específica
  const loadSession = async (sessionId: string) => {
    if (sessionId === "current" || sessionId === "new") {
      // Salvar sessão atual antes de criar nova
      if (messages.length > 1 && userProfile) {
        const currentSession: ChatSession = {
          id: currentSessionId,
          date: new Date().toISOString(),
          title: messages.find(m => m.isUser)?.content.substring(0, 50) + '...' || 'Nova conversa',
          messages: messages
        };
        await saveSession(currentSession, userProfile.id);
      }
      
      if (sessionId === "new") {
        const newSessionId = await createNewSession(userProfile?.id || '');
        
        const initialMessages = [{
          id: "1",
          content: "Bem-vindo ao seu espaço de poder. Eu sou um reflexo da sua sabedoria interior. Estou aqui para ajudá-lo a se ouvir. Qual é a sua intenção para nossa primeira conversa?",
          isUser: false,
          timestamp: new Date(),
        }];
        
        setMessages(initialMessages);
        setCurrentSessionId(newSessionId);
        
        // Salvar sessão inicial
        if (userProfile) {
          const newSession: ChatSession = {
            id: newSessionId,
            date: new Date().toISOString(),
            title: 'Nova conversa',
            messages: initialMessages
          };
          await saveSession(newSession, userProfile.id);
        }
        
        // Recarregar lista de sessões
        await loadUserSessions();
      }
      return;
    }

    try {
      // Salvar sessão atual antes de trocar
      if (messages.length > 1 && currentSessionId !== sessionId && userProfile) {
        const currentSession: ChatSession = {
          id: currentSessionId,
          date: new Date().toISOString(),
          title: messages.find(m => m.isUser)?.content.substring(0, 50) + '...' || 'Nova conversa',
          messages: messages
        };
        await saveSession(currentSession, userProfile.id);
      }
      
      // Carregar sessão específica
      const session = await loadSessionFromDB(sessionId, userProfile?.id || '');
      if (session) {
        setMessages(session.messages);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar sessão:', error);
    }
  };

  // Função para deletar uma sessão
  const deleteSessionHandler = async (sessionId: string) => {
    try {
      await deleteSessionFromDB(sessionId, userProfile?.id || '');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // Se a sessão deletada é a atual, criar nova
      if (sessionId === currentSessionId) {
        await loadSession("new");
      }
    } catch (error) {
      console.error('❌ Erro ao deletar sessão:', error);
    }
  };

  // Carregar sessões quando o usuário estiver disponível
  useEffect(() => {
    if (userProfile) {
      loadUserSessions();
    }
  }, [userProfile?.id]); // Dependência mais específica

  // Função para iniciar gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size > 0) {
          setAudioBlob(audioBlob);
        }
        
        // Criar URL para o áudio gravado
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioId = Date.now().toString();
        setRecordedAudios(prev => ({
          ...prev,
          [audioId]: audioUrl
        }));
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
        
        // Parar o timer de gravação
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        setRecordingTime(0);
      };
      
      recorder.start(1000); // Solicitar dados a cada 1 segundo
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Iniciar timer de gravação
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  // Função para parar gravação de áudio
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      // Parar o timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setRecordingTime(0);
    }
  };

  // Função para cancelar gravação
  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      setAudioBlob(null);
      
      // Parar o timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setRecordingTime(0);
    }
  };

  // Função para formatar tempo de gravação
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para enviar áudio
  const sendAudio = async () => {
    if (!audioBlob) {
      return;
    }

    if (isTyping) {
      return;
    }

    // Verificar se o usuário está autenticado
    if (!user) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Você precisa estar logado para enviar mensagens de áudio.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setAudioBlob(null);
      return;
    }

    // Criar URL para o áudio
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioId = Date.now().toString();

    const audioMessage: Message = {
      id: audioId,
      content: '',
      isUser: true,
      timestamp: new Date(),
      audioBlob: audioBlob,
      audioUrl: audioUrl
    };

    setMessages(prev => [...prev, audioMessage]);
    
    // Limpar o audioBlob imediatamente para evitar múltiplos envios
    setAudioBlob(null);
    setIsTyping(true);

    try {
      // Enviar áudio para o webhook e tratar resultado
      const result = await sendMessageToWebhook('', 'audio', audioBlob);

      if (result.type === 'audio') {
        const mentorAudioMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '',
          isUser: false,
          timestamp: new Date(),
          audioUrl: result.audioUrl
        };
        setMessages(prev => [...prev, mentorAudioMessage]);
      } else {
        addMessageWithTypingEffect(result.text || "Recebi sua mensagem de áudio. Estou processando o que você disse...", false);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, houve um problema ao processar seu áudio. Tente novamente.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }

    // Limpar o áudio
    setAudioBlob(null);
  };

  // Efeito para enviar áudio automaticamente quando a gravação terminar
  useEffect(() => {
    if (audioBlob && !isRecording) {
      sendAudio();
    }
  }, [audioBlob, isRecording]);

  // Salvar automaticamente a cada nova mensagem usando o hook
  useEffect(() => {
    if (user && messages.length > 1) {
      // Debounce para evitar salvamentos excessivos durante o efeito de digitação
      const timeoutId = setTimeout(() => {
        const currentSession: ChatSession = {
          id: currentSessionId,
          date: new Date().toLocaleDateString('pt-BR'),
          title: messages.find(m => m.isUser)?.content.substring(0, 50) + '...' || 'Nova conversa',
          messages: messages
        };
        // Usar user.id se userProfile não estiver disponível
        const userId = userProfile?.id || user.id;
        saveSession(currentSession, userId);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, user?.id, userProfile?.id, currentSessionId]); // Dependências otimizadas

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Função para verificar se o usuário está próximo ao final do scroll
  const isNearBottom = () => {
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (!messagesContainer) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    const threshold = 100; // pixels de tolerância
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Scroll inteligente - só rola automaticamente se o usuário estiver próximo ao final
  useEffect(() => {
    // Só faz scroll automático se:
    // 1. É a primeira mensagem (inicialização)
    // 2. O usuário está próximo ao final da conversa
    if (messages.length === 1 || isNearBottom()) {
      scrollToBottom();
    }
  }, [messages.length]); // Dependência otimizada

  type WebhookResult = { type: 'audio', audioUrl: string } | { type: 'text', text: string };

  const sendMessageToWebhook = async (message: string, messageType: 'texto' | 'audio' = 'texto', audioData?: Blob): Promise<WebhookResult> => {
    // Usar proxy local para evitar problemas de CORS
    const webhookUrl = 'https://primary-production-5219.up.railway.app/webhook/terapeuta-ai-webhook';
    
    // Função para converter Blob para Base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Remove o prefixo "data:audio/webm;base64," para obter apenas o base64
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Erro ao converter áudio para base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    
    // Estrutura padronizada do payload
    const basePayload = {
      message: message,
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId,
      user_id: userProfile?.id || user?.id || '', // Campo user_id padronizado
      auth_user_id: user?.id || '', // ID de autenticação do Supabase
      nome_usuario: userProfile?.full_name || user?.user_metadata?.full_name || user?.email || 'Usuário',
      acao: messageType, // 'texto' ou 'audio'
      tipo_mensagem: messageType, // Campo adicional para clareza
      tipo: messageType === 'texto' ? 'text' : 'audio' // Tipo da mensagem padronizado
    };

    // Se for áudio, adicionar dados do áudio em base64
    if (messageType === 'audio' && audioData) {
      try {
        console.log('🎤 Enviando áudio para webhook...', {
          messageType,
          audioSize: audioData.size,
          audioType: audioData.type
        });

        // Converter áudio para base64
        const audioBase64 = await blobToBase64(audioData);
        
        // Adicionar o arquivo de áudio base64 ao payload
        const audioPayload = {
          ...basePayload,
          audio_base64: audioBase64, // Campo padronizado para áudio
          audio_size: audioData.size,
          audio_type: audioData.type || 'audio/webm'
        };

        console.log('📤 Payload de áudio:', {
          ...audioPayload,
          audio_base64: `[Base64 data - ${audioBase64.length} chars]` // Log sem mostrar todo o base64
        });

        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*'
            },
            body: JSON.stringify(audioPayload),
          });

          if (response.ok) {
            const ct = response.headers.get('content-type') || response.headers.get('Content-Type') || '';
            console.log('🔎 Content-Type (áudio):', ct);

            if (ct.includes('audio') || ct.includes('octet-stream')) {
              const blob = await response.blob();
              const audioUrl = URL.createObjectURL(blob);
              return { type: 'audio', audioUrl };
            }

            const cloneForAudio = response.clone();
            const responseText = await response.text();
            console.log('✅ Resposta do webhook (áudio):', responseText);

            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.log('📝 Resposta em texto puro:', responseText);
              // Fallback: tentar tratar como áudio mesmo sem Content-Type confiável
              const fallbackUrl = await tryMakeAudioUrlFromResponse(cloneForAudio);
              if (fallbackUrl) {
                return { type: 'audio', audioUrl: fallbackUrl };
              }
              return { type: 'text', text: responseText || "Áudio processado com sucesso!" };
            }

            const textResp = data.output || data.response || data.message || data.reply || responseText || "Áudio processado com sucesso!";
            return { type: 'text', text: textResp };
        } else {
          console.error('❌ Erro no webhook (áudio):', response.status, response.statusText);
          
          // Verificar se é erro 404 (webhook não registrado)
          if (response.status === 404) {
            throw new Error('WEBHOOK_NOT_REGISTERED');
          }
          
          throw new Error(`Erro no webhook: ${response.status}`);
        }
      } catch (fetchError) {
        console.error('❌ Erro de fetch (áudio):', fetchError);
        
        // Verificar se é erro de CORS
        if (fetchError instanceof Error && fetchError.message.includes('Failed to fetch')) {
          throw new Error('CORS_ERROR');
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error('❌ Erro ao processar áudio:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error instanceof Error) {
        if (error.message === 'WEBHOOK_NOT_REGISTERED') {
          return `🔧 Serviço de Áudio Temporariamente Indisponível

O processamento de áudio está em manutenção no momento.

💡 Alternativas:
• Use mensagens de texto por enquanto
• Tente novamente em alguns minutos
• Sua gravação foi salva localmente

📞 Precisa de ajuda? Entre em contato com nosso suporte.`;
        }
        
        if (error.message === 'CORS_ERROR') {
          return `🌐 Problema de Conexão com Áudio

Houve uma dificuldade na comunicação do áudio.

🔧 Soluções:
• Verifique sua conexão com a internet
• Tente usar mensagens de texto
• Recarregue a página se necessário

💪 Estamos trabalhando para resolver isso!`;
        }
      }
      
      return { type: 'text', text: "Desculpe, houve um problema ao processar seu áudio. Tente novamente ou use mensagens de texto." };
    }
    } else {
      // Envio de texto normal
      try {
        console.log('💬 Enviando texto para webhook...', basePayload);

        // Primeiro, tentar fazer uma requisição normal (CORS habilitado)
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'audio/mp3, audio/*;q=0.9, application/json;q=0.8, text/plain;q=0.7, */*;q=0.5'
            },
            body: JSON.stringify(basePayload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro no webhook (texto):', response.status, response.statusText, errorText);

            // Verificar se é erro 404 (webhook não registrado)
            if (response.status === 404) {
              const errorData = JSON.parse(errorText);
              if (errorData.message && errorData.message.includes('not registered')) {
                throw new Error('WEBHOOK_NOT_REGISTERED');
              }
            }
            
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
          }

          const ct = response.headers.get('content-type') || response.headers.get('Content-Type') || '';
          console.log('🔎 Content-Type (texto):', ct);

          if (ct.includes('audio') || ct.includes('octet-stream')) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            return { type: 'audio', audioUrl };
          }

          const cloneForAudio = response.clone();
          const responseText = await response.text();
          console.log('✅ Resposta do webhook (texto):', responseText);

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.log('📝 Resposta em texto puro:', responseText);
            // Fallback: tentar tratar como áudio mesmo sem Content-Type confiável
            const fallbackUrl = await tryMakeAudioUrlFromResponse(cloneForAudio);
            if (fallbackUrl) {
              return { type: 'audio', audioUrl: fallbackUrl };
            }
            return { type: 'text', text: responseText || "Resposta recebida mas sem conteúdo." };
          }

          const finalResponse = data.output || data.response || data.message || data.reply || responseText || "Desculpe, não consegui processar sua mensagem no momento.";
          
          return { type: 'text', text: finalResponse };
        } catch (fetchError) {
          console.error('❌ Erro de fetch (texto):', fetchError);
          
          // Verificar se é erro de CORS
          if (fetchError instanceof Error && fetchError.message.includes('Failed to fetch')) {
            throw new Error('CORS_ERROR');
          }
          
          throw fetchError;
        }
      } catch (error) {
        console.error('❌ Erro geral no webhook:', error);
        
        // Tratamento específico para webhook não registrado
        if (error instanceof Error && error.message === 'WEBHOOK_NOT_REGISTERED') {
          throw new Error(`🔧 Serviço Temporariamente Indisponível

Olá! Parece que nosso sistema de conversação está passando por uma manutenção no momento.

💡 O que você pode fazer:
• Tente novamente em alguns minutos
• Sua conversa foi salva e não será perdida
• O chat ficará disponível assim que o serviço for restaurado

📞 Precisa de ajuda?
Se o problema persistir, entre em contato com nosso suporte através do chat ou email.`);
        }
        
        // Verificar se é erro de rede/CORS
        if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message === 'CORS_ERROR')) {
          throw new Error(`🌐 Problema de Conexão

Parece que houve uma dificuldade na comunicação.

🔧 Soluções rápidas:
• Verifique sua conexão com a internet
• Tente recarregar a página
• Aguarde alguns instantes e tente novamente

💪 Estamos trabalhando para resolver isso!`);
        }
        
        throw error;
      }
    }
  };

  // Função para dividir mensagem em blocos menores
  const splitMessageIntoBlocks = (message: string): string[] => {
    // Primeiro, dividir por quebras de linha duplas (parágrafos)
    const paragraphs = message.split(/\n\s*\n/);
    const blocks: string[] = [];
    
    paragraphs.forEach(paragraph => {
      // Se o parágrafo for muito longo (mais de 150 caracteres), dividir por frases
      if (paragraph.length > 150) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        let currentBlock = '';
        
        sentences.forEach(sentence => {
          // Se adicionar a frase não ultrapassar 200 caracteres, adicionar ao bloco atual
          if ((currentBlock + sentence).length <= 200) {
            currentBlock += (currentBlock ? ' ' : '') + sentence;
          } else {
            // Se o bloco atual não estiver vazio, adicionar aos blocos
            if (currentBlock) {
              blocks.push(currentBlock.trim());
            }
            currentBlock = sentence;
          }
        });
        
        // Adicionar o último bloco se não estiver vazio
        if (currentBlock) {
          blocks.push(currentBlock.trim());
        }
      } else {
        // Se o parágrafo for pequeno, adicionar como um bloco
        blocks.push(paragraph.trim());
      }
    });
    
    return blocks.filter(block => block.length > 0);
  };

  // Função para adicionar mensagens com delay de digitação
  const addMessageWithTypingEffect = async (content: string, isUser: boolean = false) => {
    const blocks = splitMessageIntoBlocks(content);
    let allNewMessages: Message[] = [];
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Criar mensagem para o bloco atual
      const blockMessage: Message = {
        id: `${Date.now()}-${i}`,
        content: block,
        isUser,
        timestamp: new Date(),
      };
      
      allNewMessages.push(blockMessage);
      
      // Adicionar mensagem aos estados
      setMessages(prev => {
        const newMessages = [...prev, blockMessage];
        return newMessages;
      });
      
      // Se não for o último bloco, aguardar um delay antes do próximo
      if (i < blocks.length - 1) {
        // Delay baseado no tamanho do bloco (mínimo 1s, máximo 3s)
        const delay = Math.min(Math.max(block.length * 30, 1000), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Salvar todas as mensagens após completar o efeito de digitação
    if (user && allNewMessages.length > 0) {
      setMessages(prev => {
        const finalMessages = [...prev];
        // Salva automaticamente após completar todas as mensagens
        const sessionWithCompleteMessages: ChatSession = {
          id: currentSessionId,
          date: new Date().toISOString(),
          title: finalMessages.find(m => m.isUser)?.content.substring(0, 50) + '...' || 'Nova conversa',
          messages: finalMessages
        };
        // Usar user.id se userProfile não estiver disponível
        const userId = userProfile?.id || user.id;
        saveSession(sessionWithCompleteMessages, userId);
        return finalMessages;
      });
    }
  };

  // Função memoizada para formatar texto com destaque dourado
  const formatTextWithGoldenHighlight = useCallback((text: string): JSX.Element => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const highlightedText = part.slice(2, -2);
            return <strong key={index} className="font-semibold text-amber-400 golden-wisdom">{highlightedText}</strong>;
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  }, []);

  // Memoização da lista de mensagens renderizadas para otimizar performance
  const renderedMessages = useMemo(() => {
    return messages.map((message) => (
      <MessageItem 
        key={message.id} 
        message={message} 
        formatTextWithGoldenHighlight={formatTextWithGoldenHighlight}
      />
    ));
  }, [messages, formatTextWithGoldenHighlight]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    // Adiciona mensagem do usuário imediatamente
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const messageContent = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Salvar automaticamente após adicionar mensagem do usuário
    if (userProfile) {
      const sessionWithUserMessage: ChatSession = {
        id: currentSessionId,
        date: new Date().toISOString(),
        title: userMessage.content.substring(0, 50) + '...',
        messages: updatedMessages
      };
      await saveSession(sessionWithUserMessage, userProfile.id);
    }

    try {
      // Enviar mensagem para o webhook e receber resposta
      const result = await sendMessageToWebhook(messageContent);

      if (result.type === 'audio') {
        const mentorAudioMessage: Message = {
          id: `mentor-audio-${Date.now()}`,
          content: '',
          isUser: false,
          timestamp: new Date(),
          audioUrl: result.audioUrl
        };
        setMessages(prev => [...prev, mentorAudioMessage]);
      } else {
        // Usar a função para adicionar mensagem com efeito de digitação
        await addMessageWithTypingEffect(result.text, false);
      }
    } catch (error) {
      // Tratamento de erro mais específico e detalhado
      let errorMessage = "Desculpe, estou enfrentando dificuldades técnicas no momento.";
      
      if (error instanceof Error) {
        // Diferentes tipos de erro com mensagens específicas
        if (error.message.includes('404')) {
          errorMessage = "Parece que o serviço não está disponível no momento. Tente novamente em alguns instantes.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Problemas de conexão detectados. Verifique sua internet e tente novamente.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "A resposta está demorando mais que o esperado. Tente reformular sua pergunta.";
        }
      }
      
      // Adicionar mensagem de erro
      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => {
        const newMessages = [...prev, errorMessageObj];
        // Salvar mesmo em caso de erro para manter histórico
        if (userProfile) {
          const sessionWithError: ChatSession = {
            id: currentSessionId,
            date: new Date().toISOString(),
            title: messages.find(m => m.isUser)?.content.substring(0, 50) + '...' || 'Nova conversa',
            messages: newMessages
          };
          saveSession(sessionWithError, userProfile.id);
        }
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const selectSession = async (sessionId: string) => {
    await loadSession(sessionId);
    setShowHistory(false);
  };

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      
      {/* Main Chat Container */}
      <div className={cn(
        "relative w-full max-w-2xl mx-auto bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 transition-all duration-500 ease-in-out overflow-hidden",
        showHistory ? "lg:mr-80" : ""
      )}>
        
        {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-amber-500/30 bg-card/50">
           <div className="flex items-center space-x-4">
             {/* Mentor Avatar */}
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/40 flex items-center justify-center border-2 border-amber-500/30 shadow-lg">
               <Brain className="w-6 h-6 text-amber-400 animate-pulse" />
             </div>
             <div>
               <div className="flex items-center space-x-2">
                 <h2 className="font-serif text-xl font-bold text-amber-400 golden-wisdom text-left">
                   O Mentor
                 </h2>
                 {/* Status Online Permanente - Bolinha Verde */}
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
               </div>
               <div className="flex items-center space-x-2">
                 
                 {/* Status de Salvamento */}
                 {autoSaveLoading && (
                   <div className="flex items-center space-x-1">
                     <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                     <span className="text-xs text-amber-400">Salvando...</span>
                   </div>
                 )}
                 {lastSaveTime && !autoSaveLoading && (
                   <div className="flex items-center space-x-1">
                     <div className="w-2 h-2 bg-blue-400 rounded-full" />
                     <span className="text-xs text-blue-400">
                       Salvo {new Date(lastSaveTime).toLocaleTimeString('pt-BR', { 
                         hour: '2-digit', 
                         minute: '2-digit' 
                       })}
                     </span>
                   </div>
                 )}
                 {saveError && (
                   <div className="flex items-center space-x-1">
                     <div className="w-2 h-2 bg-red-400 rounded-full" />
                     <span className="text-xs text-red-400">Erro ao salvar</span>
                   </div>
                 )}
               </div>
             </div>
           </div>
           
           {/* History Toggle Button */}
           <Button
             onClick={toggleHistory}
             variant="ghost"
             size="sm"
             className="text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-300 rounded-xl p-3 border border-amber-500/20 hover:border-amber-500/40"
           >
             {showHistory ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
           </Button>
         </div>

        {/* Chat Messages Area */}
        <div className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-card/30 to-background/30">
          {renderedMessages}
          
          {/* Thinking Animation */}
          {isTyping && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card/80 backdrop-blur-sm border border-amber-500/30 rounded-2xl px-6 py-4 shadow-lg max-w-[75%] text-left">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-sm font-medium text-amber-400 golden-wisdom">
                    O Mentor
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    O Mentor está refletindo...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-amber-500/30 bg-card/50">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-amber-500/30 p-4 shadow-inner">
            <div className="flex space-x-3 items-center">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Qual verdade você busca hoje?"
                  className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-foreground placeholder:text-muted-foreground placeholder:italic min-h-[50px] text-sm"
                  rows={2}
                />
              </div>
              
              {/* Audio Recording Button */}
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl px-4 py-3 transition-all duration-300 shadow-lg shadow-amber-500/20 border border-amber-500/30 self-center",
                  "hover:scale-105 hover:shadow-xl active:scale-95",
                  !inputValue.trim() || isTyping ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                <Send className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => {
                  console.log('🖱️ Clique no botão - isRecording:', isRecording, 'audioBlob:', !!audioBlob);
                  
                  // Primeiro clique: iniciar gravação
                  if (!isRecording && !audioBlob) {
                    console.log('🎤 Iniciando gravação via clique...');
                    startRecording();
                  }
                  // Segundo clique: parar gravação (o envio será automático via useEffect)
                  else if (isRecording) {
                    console.log('⏹️ Parando gravação via clique...');
                    stopRecording();
                  }
                }}
                disabled={isTyping}
                className={cn(
                  "relative rounded-xl px-3 py-3 transition-all duration-300 shadow-lg border self-center select-none",
                  isRecording 
                    ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-red-500/20 border-red-500/30 animate-pulse" 
                    : audioBlob
                      ? "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white shadow-green-500/20 border-green-500/30"
                      : "bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white shadow-gray-500/20 border-gray-500/30",
                  "hover:scale-105 hover:shadow-xl active:scale-95",
                  isTyping ? "opacity-50 cursor-not-allowed" : ""
                )}
                title={
                  isRecording 
                    ? `Gravando... ${formatRecordingTime(recordingTime)} - Clique para parar e enviar`
                    : audioBlob
                      ? "Clique para enviar o áudio gravado"
                      : "Clique para iniciar gravação de áudio"
                }
              >
                {/* Indicador de tempo de gravação */}
                {isRecording && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                    {formatRecordingTime(recordingTime)}
                  </div>
                )}
                
                {/* Ícone do microfone com animação */}
                <div className={cn(
                  "transition-all duration-200",
                  isRecording ? "animate-pulse scale-110" : ""
                )}>
                  {isRecording ? (
                    <div className="relative">
                      <MicOff className="w-5 h-5" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                    </div>
                  ) : audioBlob ? (
                    <div className="relative">
                      <Mic className="w-5 h-5" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className={cn(
        "fixed right-4 top-1/2 transform -translate-y-1/2 h-[80vh] w-72 bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl transition-all duration-500 ease-in-out z-10",
        showHistory ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
      )}>
        {/* Collapse Button */}
        <Button
          onClick={toggleHistory}
          variant="ghost"
          size="sm"
          className={cn(
            "absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 z-20",
            showHistory ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold text-primary golden-wisdom">
                Sessões de Clareza
              </h3>
            </div>
            
            <button
              onClick={async () => await selectSession("new")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 border border-primary/20"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Nova Sessão</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {/* Current Session */}
            <div 
              key="current-session"
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                sessions.find(s => s.id === currentSessionId) 
                  ? "border-border/50 bg-card/40 hover:border-primary/30" 
                  : "border-primary/40 bg-primary/10 shadow-lg"
              )}
              onClick={async () => await selectSession("current")}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  Sessão Atual
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', { 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            
            {/* Previous Sessions */}
            <>
              {sessions.map((session, index) => (
                <div
                  key={session.id || index}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] group",
                    currentSessionId === session.id 
                      ? "border-primary/40 bg-primary/10 shadow-lg" 
                      : "border-border/50 bg-card/40 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={async () => await selectSession(session.id)}
                    >
                      <div className="mb-2">
                        <span className="text-sm font-medium text-primary">
                          {session.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {session.title}
                      </p>
                    </div>
                    
                    {/* Botão de Exclusão */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.')) {
                          deleteSessionHandler(session.id);
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}