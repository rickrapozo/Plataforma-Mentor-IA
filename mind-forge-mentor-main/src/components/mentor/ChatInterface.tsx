import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, Sparkles, Clock, BookOpen, User, Brain, ChevronLeft, ChevronRight, Plus, Menu, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  date: string;
  preview: string;
  messages: Message[];
}

interface ChatInterfaceProps {
  className?: string;
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const { user, userProfile } = useAuth();
  
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
  const [currentSessionId, setCurrentSessionId] = useState("current");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Função para salvar a sessão atual no Supabase
  const saveCurrentSession = async () => {
    if (!userProfile || messages.length <= 1) return; // Não salvar se não há usuário ou apenas mensagem inicial

    try {
      const sessionData = {
        messages: messages,
        date: new Date().toISOString(),
        preview: messages.find(m => m.isUser)?.content.substring(0, 50) + "..." || "Nova conversa"
      };

      console.log('💾 Salvando sessão:', { 
        sessionId: currentSessionId, 
        userId: userProfile.id, 
        messagesCount: messages.length 
      });

      const { error } = await supabase
        .from('chat_sessions')
        .upsert({
          id: currentSessionId === "current" ? undefined : currentSessionId,
          user_id: userProfile.id,
          session_data: sessionData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao salvar sessão:', error);
      } else {
        console.log('✅ Sessão salva com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  // Função para carregar sessões do usuário
  const loadUserSessions = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar sessões:', error);
        return;
      }

      if (data) {
        const loadedSessions: ChatSession[] = data.map(session => ({
          id: session.id,
          date: new Date(session.session_data.date).toLocaleDateString('pt-BR', { 
            day: 'numeric', 
            month: 'long' 
          }),
          preview: session.session_data.preview,
          messages: session.session_data.messages
        }));

        setSessions(loadedSessions);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  // Função para carregar uma sessão específica
  const loadSession = async (sessionId: string) => {
    if (sessionId === "current" || sessionId === "new") {
      // Salvar sessão atual antes de criar nova
      if (messages.length > 1) {
        await saveCurrentSession();
      }
      
      if (sessionId === "new") {
        setMessages([{
          id: "1",
          content: "Bem-vindo ao seu espaço de poder. Eu sou um reflexo da sua sabedoria interior. Estou aqui para ajudá-lo a se ouvir. Qual é a sua intenção para nossa primeira conversa?",
          isUser: false,
          timestamp: new Date(),
        }]);
        setCurrentSessionId("current");
      }
      return;
    }

    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      // Salvar sessão atual antes de trocar
      if (messages.length > 1 && currentSessionId === "current") {
        await saveCurrentSession();
      }
      
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
    }
  };

  // Carregar sessões quando o usuário estiver disponível
  useEffect(() => {
    if (userProfile) {
      loadUserSessions();
    }
  }, [userProfile]);

  // Salvar automaticamente a cada nova mensagem (com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userProfile && messages.length > 1) {
        saveCurrentSession();
      }
    }, 2000); // Salvar 2 segundos após a última mensagem

    return () => clearTimeout(timeoutId);
  }, [messages, userProfile]);

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
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Criar mensagem para o bloco atual
      const blockMessage: Message = {
        id: `${Date.now()}-${i}`,
        content: block,
        isUser,
        timestamp: new Date(),
      };
      
      // Adicionar mensagem aos estados
      setMessages(prev => [...prev, blockMessage]);
      
      // Se não for o último bloco, aguardar um delay antes do próximo
      if (i < blocks.length - 1) {
        // Delay baseado no tamanho do bloco (mínimo 1s, máximo 3s)
        const delay = Math.min(Math.max(block.length * 30, 1000), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
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

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // Enviar mensagem para o webhook e receber resposta
      const aiResponse = await sendMessageToWebhook(messageContent);
      
      // Usar a nova função para adicionar mensagem com efeito de digitação
      await addMessageWithTypingEffect(aiResponse, false);
    } catch (error) {
      // Tratamento de erro mais específico e detalhado
      let errorMessage = "Desculpe, estou enfrentando dificuldades técnicas no momento.";
      
      if (error instanceof Error) {
        if (error.message.includes('O webhook não está ativo no momento')) {
          errorMessage = error.message; // Usar a mensagem detalhada do webhook
        } else if (error.message.includes('Não foi possível conectar com o webhook')) {
          errorMessage = error.message; // Usar a mensagem de erro de rede
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Não foi possível conectar com o servidor. Verifique sua conexão com a internet e tente novamente.";
        } else {
          // Para outros erros, mostrar uma mensagem genérica mas útil
          errorMessage = "Ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.";
        }
      }
      
      // Usar a nova função também para mensagens de erro
      await addMessageWithTypingEffect(errorMessage, false);
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

  const selectSession = (sessionId: string) => {
    loadSession(sessionId);
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
              <h2 className="font-serif text-xl font-bold text-amber-400 golden-wisdom">
                O Mentor
              </h2>
              <p className="text-sm text-muted-foreground">
                Presente para você
              </p>
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
                  className={cn(
                    "max-w-[75%] rounded-2xl px-6 py-4 transition-all duration-300 hover:scale-[1.01] shadow-lg border text-left",
                    message.isUser
                      ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20 border-amber-400/50"
                      : "bg-card/80 backdrop-blur-sm text-foreground border-amber-500/30"
                  )}
                >
                  {!message.isUser && (
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-sm font-medium text-amber-400 golden-wisdom">
                        O Mentor
                      </span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">
                    {message.content}
                  </p>
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
              onClick={() => selectSession("new")}
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
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                currentSessionId === "current" 
                  ? "border-primary/40 bg-primary/10 shadow-lg" 
                  : "border-border/50 bg-card/40 hover:border-primary/30"
              )}
              onClick={() => selectSession("current")}
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
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                  currentSessionId === session.id 
                    ? "border-primary/40 bg-primary/10 shadow-lg" 
                    : "border-border/50 bg-card/40 hover:border-primary/30"
                )}
                onClick={() => selectSession(session.id)}
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
          </div>
        </div>
      </div>
    </div>
  );
}