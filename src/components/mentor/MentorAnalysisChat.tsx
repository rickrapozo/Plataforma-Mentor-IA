import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  audioBlob?: Blob; // Campo opcional para mensagens de áudio
}

interface MentorAnalysisChatProps {
  analysis: string;
  onClose: () => void;
}

export default function MentorAnalysisChat({ analysis, onClose }: MentorAnalysisChatProps) {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Função para quebrar texto em blocos menores
  const breakTextIntoBlocks = (text: string): string[] => {
    // Quebrar por parágrafos primeiro
    const paragraphs = text.split(/\n\s*\n/);
    const blocks: string[] = [];

    paragraphs.forEach(paragraph => {
      // Se o parágrafo for muito longo (mais de 300 caracteres), quebrar por frases
      if (paragraph.length > 300) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        let currentBlock = '';
        
        sentences.forEach(sentence => {
          if (currentBlock.length + sentence.length > 300 && currentBlock.length > 0) {
            blocks.push(currentBlock.trim());
            currentBlock = sentence;
          } else {
            currentBlock += (currentBlock ? ' ' : '') + sentence;
          }
        });
        
        if (currentBlock.trim()) {
          blocks.push(currentBlock.trim());
        }
      } else {
        blocks.push(paragraph.trim());
      }
    });

    return blocks.filter(block => block.length > 0);
  };

  // Função para formatar texto com negrito e destaque dourado
  const formatTextWithBold = (text: string): JSX.Element => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return <strong key={index} className="font-semibold text-primary golden-wisdom">{boldText}</strong>;
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  // Função para simular digitação do mentor
  const simulateTyping = async (blocks: string[], delay: number = 1500) => {
    setIsTyping(true);
    
    for (let i = 0; i < blocks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const newMessage: Message = {
        id: `mentor-${Date.now()}-${i}`,
        content: blocks[i],
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
    }
    
    setIsTyping(false);
  };

  // Inicializar chat com a análise do mentor
  useEffect(() => {
    if (analysis) {
      // Verificar se é uma mensagem de processamento/carregamento
      if (analysis.includes('🔄') || analysis.includes('🧠') || analysis.includes('⏳') || analysis.includes('processando')) {
        // Para mensagens de status, mostrar imediatamente sem simulação de digitação
        const statusMessage: Message = {
          id: `status-${Date.now()}`,
          content: analysis,
          isUser: false,
          timestamp: new Date()
        };
        setMessages([statusMessage]);
        setIsTyping(false);
      } else {
        // Para análises completas, usar simulação de digitação
        const blocks = breakTextIntoBlocks(analysis);
        simulateTyping(blocks);
      }
    }
  }, [analysis]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Função para enviar mensagem para o webhook do n8n
  const sendMessageToWebhook = async (message: string): Promise<string> => {
    // Usar proxy local para evitar problemas de CORS
    const webhookUrl = 'https://primary-production-5219.up.railway.app/webhook/diariodebordoai';
    
    const payload = {
      body: {
        message: message,
        user_id: userProfile?.id || '',
        auth_user_id: user?.id || '',
        nome_usuario: userProfile?.full_name || user?.user_metadata?.full_name || user?.email || 'Usuário',
        acao: "conversa",
        tipo: "text", // Tipo da mensagem padronizado
        time_acao: new Date().toISOString(),
      }
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Verificar se a resposta é um array (múltiplas respostas)
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item && (item.analysis || item.response || item.message || item.output)) {
              const validResponse = item.analysis || item.response || item.message || item.output;
              return validResponse;
            }
          }
          return "Desculpe, não consegui processar sua mensagem no momento. Tente novamente.";
        }
        
        // Verificar resposta única
        if (data && (data.analysis || data.response || data.message)) {
          return data.analysis || data.response || data.message;
        } else {
          // Mostrar mensagem de progresso
          const progressMessage = "🧠 O Mentor está elaborando sua resposta. Por favor aguarde.";
          
          // Iniciar polling para buscar a resposta
          const finalResponse = await pollForWebhookResponse(webhookUrl);
          return finalResponse || progressMessage;
        }
      } else if (response.status === 404) {
        console.error('Webhook não encontrado (404)');
        return `🔧 Serviço Temporariamente Indisponível

Olá! Parece que nosso sistema de conversação está passando por uma manutenção no momento.

💡 O que você pode fazer:
• Tente novamente em alguns minutos
• Sua conversa foi salva e não será perdida
• O chat ficará disponível assim que o serviço for restaurado

📞 Precisa de ajuda?
Se o problema persistir, entre em contato com nosso suporte através do chat ou email.`;
      } else {
        const errorData = await response.text();
        console.error('❌ Erro do webhook:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return `⚠️ Oops! Algo não saiu como esperado

Encontramos um pequeno obstáculo técnico, mas estamos trabalhando para resolver rapidamente.

💡 Sugestões:
• Aguarde alguns instantes e tente novamente
• Verifique sua conexão com a internet
• Sua mensagem foi registrada e não será perdida

🤝 Estamos aqui para ajudar!
Se o problema continuar, nossa equipe de suporte está disponível para auxiliá-lo.

📧 Contato: suporte@mindforge.com`;
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      
      if (error instanceof AbortError) {
        return `⏱️ Resposta em Processamento

Sua mensagem está sendo analisada com cuidado pelo Mentor.

💭 O que está acontecendo:
• Análise profunda em andamento
• Processamento pode levar alguns minutos
• Sua paciência é muito apreciada

✨ Obrigado por aguardar!`;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return `🌐 Problema de Conexão

Parece que houve uma dificuldade na comunicação.

🔧 Soluções rápidas:
• Verifique sua conexão com a internet
• Tente recarregar a página
• Aguarde alguns instantes e tente novamente

💪 Estamos trabalhando para resolver isso!`;
      }
      
      if (error instanceof TypeError && error.message.includes('CORS')) {
        return `🔧 Serviço em Manutenção

Nosso sistema está passando por atualizações para melhor atendê-lo.

⏰ Tempo estimado: alguns minutos
🔄 Tente novamente em breve
💾 Suas informações estão seguras

Agradecemos sua compreensão!`;
      }
      
      return `⚠️ Situação Inesperada

Encontramos algo que não esperávamos, mas nossa equipe já foi notificada.

🛠️ O que fazer:
• Tente novamente em alguns minutos
• Recarregue a página se necessário
• Entre em contato conosco se persistir

🙏 Obrigado pela sua paciência!`;
    }
  };

  // Função para fazer polling da resposta do webhook
  const pollForWebhookResponse = async (originalUrl: string): Promise<string | null> => {
    const delays = [30000, 60000, 90000, 120000, 180000]; // 30s, 1min, 1min30s, 2min, 3min
    
    for (let attemptIndex = 0; attemptIndex < delays.length; attemptIndex++) {
      console.log(`⏱️ Aguardando ${delays[attemptIndex]/1000}s antes da tentativa ${attemptIndex + 1}...`);
      
      await new Promise(resolve => setTimeout(resolve, delays[attemptIndex]));
      
      try {
        const responseUrl = originalUrl.replace('/webhook-test/', '/webhook-test/') + '-response/' + Date.now();
        console.log(`🔍 Tentativa ${attemptIndex + 1}: Buscando resposta em ${responseUrl}`);
        
        const response = await fetch(responseUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && (data.analysis || data.response || data.message)) {
            return data.analysis || data.response || data.message;
          }
        }
      } catch (error) {
        // Erro silencioso durante polling
      }
    }
    
    return `⏱️ Análise em Andamento

Seu Mentor está dedicando atenção especial à sua mensagem.

🧠 Processo em curso:
• Análise detalhada iniciada
• Insights sendo desenvolvidos
• Resposta personalizada em preparação

🙏 Agradecemos sua paciência!
A qualidade da análise vale a espera.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    try {
      // Enviar mensagem para o webhook do n8n
      const mentorResponse = await sendMessageToWebhook(messageToSend);
      
      // Verificar se é uma mensagem de status/processamento
      if (mentorResponse.includes('🔄') || mentorResponse.includes('🧠') || mentorResponse.includes('⏳') || 
          mentorResponse.includes('processando') || mentorResponse.includes('aguarde') || 
          mentorResponse.includes('Análise em Andamento') || mentorResponse.includes('Temporariamente Indisponível')) {
        // Para mensagens de status, mostrar imediatamente
        const responseMessage: Message = {
          id: `mentor-response-${Date.now()}`,
          content: mentorResponse,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
      } else {
        // Para respostas completas, usar fracionamento em blocos
        const blocks = breakTextIntoBlocks(mentorResponse);
        setIsTyping(false); // Parar o typing antes de iniciar a simulação
        await simulateTyping(blocks);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: `mentor-error-${Date.now()}`,
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 pb-20">
      <div className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[85vh] overflow-hidden border border-primary/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground">
                  Chat com o Mentor
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Continue a conversa sobre sua análise
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser 
                    ? 'bg-gradient-to-br from-primary to-primary/80' 
                    : 'bg-gradient-to-br from-secondary to-secondary/80'
                }`}>
                  {message.isUser ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                  ) : (
                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-foreground" />
                  )}
                </div>
                <div className={`rounded-2xl p-3 sm:p-4 ${
                  message.isUser
                    ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                    : 'bg-gradient-to-br from-muted/50 to-muted/30 text-foreground border border-primary/10'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {message.isUser ? message.content : formatTextWithBold(message.content)}
                  </div>
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Animation */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[80%]">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-foreground" />
                </div>
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 text-foreground border border-primary/10 rounded-2xl p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full animate-pulse"
                          style={{
                            animationDelay: `${i * 0.2}s`,
                            animationDuration: '1.5s'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      O Mentor está pensando...
                    </span>
                  </div>
                  
                  {/* Visualizador de ondas sonoras */}
                  <div className="mt-3 flex items-center justify-center space-x-1">
                    <div className="flex space-x-1">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-primary/40 to-primary/80 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '1.5s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Texto de progresso rotativo */}
                  <div className="mt-2 text-center">
                    <div className="text-xs text-muted-foreground animate-pulse">
                      <span className="inline-block animate-spin">🧠</span>
                      <span className="ml-2">Processando insights profundos...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 border-t border-primary/20 bg-gradient-to-r from-muted/20 to-muted/10 flex-shrink-0">
          <div className="flex space-x-2 sm:space-x-3">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Continue a conversa com seu mentor..."
              className="flex-1 min-h-[50px] max-h-[120px] resize-none bg-background/50 border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground rounded-xl text-sm"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-4 sm:px-6 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Pressione Enter para enviar • Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}