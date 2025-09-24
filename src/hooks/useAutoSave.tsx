import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  date: string;
  preview: string;
  messages: Message[];
}

interface UseAutoSaveOptions {
  debounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface UseAutoSaveReturn {
  saveSession: (session: ChatSession, userId?: string) => Promise<void>;
  loadSessions: (userId: string) => Promise<ChatSession[]>;
  loadSession: (sessionId: string, userId: string) => Promise<ChatSession | null>;
  createNewSession: (userId: string) => Promise<string>;
  deleteSession: (sessionId: string, userId: string) => Promise<void>;
  autoSaveLoading: boolean;
  saveError: string | null;
  lastSaveTime: Date | null;
}

export function useAutoSave(options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
  const {
    debounceMs = 1000,
    maxRetries = 3,
    retryDelayMs = 1000
  } = options;

  const [autoSaveLoading, setAutoSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const saveSession = useCallback(async (session: ChatSession, userId?: string) => {
    // Limpar timeout anterior se existir
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Configurar novo debounce
    debounceTimeoutRef.current = setTimeout(async () => {
      setAutoSaveLoading(true);
      setSaveError(null);
      
      let attempt = 0;
      
      while (attempt < maxRetries) {
        try {
          // Validar dados antes de salvar
          if (!session.id || !session.messages || session.messages.length === 0) {
            throw new Error('Dados da sessão inválidos');
          }

          if (!userId) {
            throw new Error('user_id é obrigatório para salvar sessão');
          }

          // Preparar dados para salvamento
          const sessionData = {
            id: session.id,
            date: session.date || new Date().toISOString(),
            preview: session.preview || (session.messages.length > 0 ? 
              session.messages.find(m => m.isUser)?.content.substring(0, 100) + '...' || 
              'Nova conversa' : 'Nova conversa'),
            messages: session.messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
            }))
          };

          // Salvar no Supabase com user_id
          const { error } = await supabase
            .from('chat_sessions')
            .upsert({
              id: session.id,
              user_id: userId,
              session_data: sessionData,
              updated_at: new Date().toISOString()
            });

          if (error) {
            throw error;
          }

          setLastSaveTime(new Date());
          retryCountRef.current = 0;
          break;

        } catch (error) {
          attempt++;
          console.error(`Erro ao salvar sessão (tentativa ${attempt}/${maxRetries}):`, error);
          
          if (attempt >= maxRetries) {
            setSaveError(error instanceof Error ? error.message : 'Erro desconhecido');
            break;
          }
          
          // Aguardar antes da próxima tentativa
          await delay(retryDelayMs * attempt);
        }
      }
      
      setAutoSaveLoading(false);
    }, debounceMs);
  }, [debounceMs, maxRetries, retryDelayMs]);

  const loadSessions = useCallback(async (userId: string): Promise<ChatSession[]> => {
    try {
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(session => {
        const sessionData = session.session_data;
        return {
          id: sessionData.id,
          date: sessionData.date,
          preview: sessionData.preview,
          messages: sessionData.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        };
      });

    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro ao carregar sessões');
      return [];
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string, userId: string): Promise<ChatSession | null> => {
    try {
      if (!sessionId || !userId) {
        throw new Error('ID da sessão e do usuário são obrigatórios');
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Sessão não encontrada
          return null;
        }
        throw error;
      }

      const sessionData = data.session_data;
      return {
        id: sessionData.id,
        date: sessionData.date,
        preview: sessionData.preview,
        messages: sessionData.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };

    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro ao carregar sessão');
      return null;
    }
  }, []);

  const createNewSession = useCallback(async (userId: string): Promise<string> => {
    try {
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }

      const sessionId = crypto.randomUUID();
      const initialSession: ChatSession = {
        id: sessionId,
        date: new Date().toISOString(),
        preview: 'Nova conversa',
        messages: []
      };

      await saveSession(initialSession, userId);
      return sessionId;

    } catch (error) {
      console.error('Erro ao criar nova sessão:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro ao criar sessão');
      throw error;
    }
  }, [saveSession]);

  const deleteSession = useCallback(async (sessionId: string, userId: string): Promise<void> => {
    try {
      if (!sessionId || !userId) {
        throw new Error('ID da sessão e do usuário são obrigatórios');
      }

      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro ao deletar sessão');
      throw error;
    }
  }, []);

  return {
    saveSession,
    loadSessions,
    loadSession,
    createNewSession,
    deleteSession,
    autoSaveLoading,
    saveError,
    lastSaveTime
  };
}