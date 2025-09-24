import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, Sparkles, Clock, BookOpen, User, Brain, ChevronLeft, ChevronRight, Plus, Menu, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useAutoSave, Message, ChatSession } from "@/hooks/useAutoSave";

interface ChatInterfaceProps {
  className?: string;
}

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Função para carregar sessões do usuário usando o hook
  const loadUserSessions = async () => {
    if (!userProfile) return;
    
    try {
      const loadedSessions = await loadSessions(userProfile.id);
      setSessions(loadedSessions);
      console.log('📥 Sessões carregadas via hook:', loadedSessions.length);
    } catch (error) {
      console.error('❌ Erro ao carregar sessões via hook:', error);
    }
  };

  // Função para carregar uma sessão específica
  const loadSession = async (sessionId: string) => {
    if (sessionId === "current" || sessionId === "new") {
      // Salvar sessão atual antes de criar nova
      if (messages.length > 1 && userProfile) {
        console.log('💾 Salvando sessão atual antes de criar nova...');
        const currentSession: ChatSession = {
          id: currentSessionId,
          date: new Date().toISOString(),
          preview: messages.find(m => m.isUser)?.content.substring(0, 100) + '...' || 'Nova conversa',
          messages: messages
        };
        await saveSession(currentSession, userProfile.id);
      }
      
      if (sessionId === "new") {
        console.log('🆕 Criando nova sessão...');
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
            preview: 'Nova conversa',
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
        console.log('💾 Salvando sessão atual antes de trocar...');
        const currentSession: ChatSession = {
          id: currentSessionId,
          date: new Date().toISOString(),
          preview: messages.find(m => m.isUser)?.content.substring(0, 100) + '...' || 'Nova conversa',
          messages: messages
        };
        await saveSession(currentSession, userProfile.id);
      }
      
      // Carregar sessão específica
      const session = await loadSessionFromDB(sessionId, userProfile?.id || '');
      if (session) {
        console.log('📥 Carregando sessão:', sessionId);
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
      // Salvar sessão inicial se ainda não foi salva
      if (messages.length > 0) {
        const currentSession: ChatSession = {
          id: currentSessionId,
          date: new Date().toLocaleDateString('pt-BR'),
          preview: messages.find(m => m.isUser)?.content.substring(0, 100) + '...' || 'Nova conversa',
          messages: messages
        };
        saveSession(currentSession, userProfile.id);
      }
    }
  }, [userProfile]);

  // Salvar automaticamente a cada nova mensagem usando o hook
  useEffect(() => {
    if (userProfile && messages.length > 1) {
      console.log('🔄 Salvamento automático acionado - mensagens:', messages.length);
      // Debounce para evitar salvamentos excessivos durante o efeito de digitação
      const timeoutId = setTimeout(() => {
        const currentSession: ChatSession = {
          id: currentSessionId,
          date: new Date().toLocaleDateString('pt-BR'),
          preview: messages.find(m => m.isUser)?.content.substring(0, 100) + '...' || 'Nova conversa',
          messages: messages
        };
        saveSession(currentSession, userProfile.id);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, userProfile, currentSessionId, saveSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToWebhook = async (message: string): Promise<string> => {
    const webhookUrl = 'https://primary-production-33a76.up.railway.app/webhook/terapeuta-ai-webhook';
    
    // Debug: Verificar se user e userProfile estão disponíveis
    console.log('🔍 Debug - Dados do usuário:', {
      user: user,
      userProfile: userProfile,
      userId: user?.id,
      userProfileId: userProfile?.id,
      userName: userProfile?.full_name
    });
    
    const payload = {
      message: message,
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId,
      userId: user?.id, // Adiciona o ID do usuário autenticado
      userProfileId: userProfile?.id, // Adiciona o ID do perfil do usuário
      userName: userProfile?.full_name // Adiciona o nome completo do usuário
    };

    console.log('🚀 Enviando mensagem para webhook:', {
      url: webhookUrl,
      payload: payload,
      method: 'POST'
    });

    try {
      // Primeiro, tentar fazer uma requisição normal (CORS habilitado)
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Resposta do webhook recebida:', {
        status: response.status,
        statusText: response.statusText,
        type: response.type,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP do webhook:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        // Verificar se é erro 404 (webhook não registrado)
        if (response.status === 404) {
          const errorData = JSON.parse(errorText);
          if (errorData.message && errorData.message.includes('not registered')) {
            throw new Error('WEBHOOK_NOT_REGISTERED');
          }
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📝 Texto bruto da resposta:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ JSON parseado com sucesso:', data);
      } catch (parseError) {
        console.warn('⚠️ Resposta não é JSON válido, usando como texto:', responseText);
        return responseText || "Resposta recebida mas sem conteúdo.";
      }

      const finalResponse = data.output || data.response || data.message || data.reply || responseText || "Desculpe, não consegui processar sua mensagem no momento.";
      console.log('🎯 Resposta final processada:', finalResponse);
      
      return finalResponse;
    } catch (error) {
      console.error('💥 Erro completo ao conectar com o webhook:', {
        error: error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Tratamento específico para webhook não registrado
      if (error instanceof Error && error.message === 'WEBHOOK_NOT_REGISTERED') {
        throw new Error('O webhook não está ativo no momento. Para ativar o webhook:\n\n1. Acesse o canvas do workflow\n2. Clique no botão "Execute workflow"\n3. Tente enviar a mensagem novamente\n\nNota: No modo de teste, o webhook funciona apenas para uma chamada após a ativação.');
      }
      
      // Verificar se é erro de rede
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('Não foi possível conectar com o webhook. Verifique sua conexão com a internet e se o webhook está disponível.');
      }
      
      throw error;
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
    if (userProfile && allNewMessages.length > 0) {
      setMessages(prev => {
        const finalMessages = [...prev];
        // Salva automaticamente após completar todas as mensagens
        const sessionWithCompleteMessages: ChatSession = {
          id: currentSessionId,
          date: new Date().toISOString(),
          preview: finalMessages.find(m => m.isUser)?.content.substring(0, 100) + '...' || 'Nova conversa',
          messages: finalMessages
        };
        saveSession(sessionWithCompleteMessages, userProfile.id);
        return finalMessages;
      });
    }
  };

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
        preview: userMessage.content.substring(0, 100) + '...',
        messages: updatedMessages
      };
      await saveSession(sessionWithUserMessage, userProfile.id);
    }

    try {
      // Enviar mensagem para o webhook e receber resposta
      const aiResponse = await sendMessageToWebhook(messageContent);
      
      // Usar a nova função para adicionar mensagem com efeito de digitação
      await addMessageWithTypingEffect(aiResponse, false);
    } catch (error) {
      // Tratamento de erro mais específico e detalhado
      let errorMessage = "Desculpe, estou enfrentando dificuldades técnicas no momento.";
      
      if (error instanceof Error) {
        console.error('Erro detalhado:', error.message);
        
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
            preview: messages.find(m => m.isUser)?.content.substring(0, 100) + '...' || 'Nova conversa',
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
               <h2 className="font-serif text-xl font-bold text-amber-400 golden-wisdom text-left">
                 O Mentor
               </h2>
               <div className="flex items-center space-x-2">
                 <p className="text-sm text-muted-foreground">
                   Presente para você
                 </p>
                 {/* Status de Salvamento */}
                 {autoSaveLoading && (
                   <div className="flex items-center space-x-1">
                     <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                     <span className="text-xs text-amber-400">Salvando...</span>
                   </div>
                 )}
                 {lastSaveTime && !autoSaveLoading && (
                   <div className="flex items-center space-x-1">
                     <div className="w-2 h-2 bg-green-400 rounded-full" />
                     <span className="text-xs text-green-400">
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex animate-in slide-in-from-bottom-2 duration-300",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                key={`message-content-${message.id}`}
                  className={cn(
                    "max-w-[75%] rounded-2xl px-6 py-4 transition-all duration-300 hover:scale-[1.01] shadow-lg border text-left",
                    message.isUser
                      ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20 border-amber-400/50"
                      : "bg-card/80 backdrop-blur-sm text-foreground border-amber-500/30"
                  )}
                >
                  {!message.isUser && (
                    <div key={`mentor-header-${message.id}`} className="flex items-center space-x-2 mb-3">
                      <Sparkles key={`sparkles-${message.id}`} className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span key={`mentor-title-${message.id}`} className="text-sm font-medium text-amber-400 golden-wisdom">
                        O Mentor
                      </span>
                    </div>
                  )}
                  <p key={`message-text-${message.id}`} className="text-sm leading-relaxed">
                    {message.content}
                  </p>
                  <div key={`message-timestamp-${message.id}`} className={cn(
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
          ))}
          
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
            </div>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className={cn(
        "fixed right-4 top-1/2 transform -translate-y-1/2 h-[80vh] w-72 bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl transition-all duration-500 ease-in-out z-10",
        showHistory ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
      )}>
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
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                    currentSessionId === session.id 
                      ? "border-primary/40 bg-primary/10 shadow-lg" 
                      : "border-border/50 bg-card/40 hover:border-primary/30"
                  )}
                  onClick={async () => await selectSession(session.id)}
                >
                  <div className="mb-2">
                    <span className="text-sm font-medium text-primary">
                      {session.date}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {session.preview}
                  </p>
                </div>
              ))}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}