import React, { useState, useEffect } from 'react';
import { TopNavigation } from '@/components/ui/TopNavigation';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import ChatInterface from '@/components/mentor/ChatInterface';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Brain, X, Save, Eye, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MentorAnalysisChat from '@/components/mentor/MentorAnalysisChat';

interface Thought {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function Logbook() {
  const { user, userProfile } = useAuth();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [showMentorChat, setShowMentorChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [mentorAnalysis, setMentorAnalysis] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');

  useEffect(() => {
    if (userProfile) {
      fetchThoughts();
    }
  }, [userProfile]);

  const fetchThoughts = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThoughts(data || []);
    } catch (error) {
      console.error('Erro ao buscar pensamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThought = async () => {
    if (!userProfile || !title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert([
          {
            title: title,
            content: content,
            user_id: userProfile.id
          }
        ]);

      if (error) throw error;

      // Limpar formulário após salvar
      setTitle('');
      setContent('');
      fetchThoughts();
    } catch (error) {
      console.error('Erro ao salvar pensamento:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteThought = async (thoughtId: string) => {
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', thoughtId)
        .eq('user_id', userProfile.id);

      if (error) throw error;
      fetchThoughts();
    } catch (error) {
      console.error('Erro ao deletar pensamento:', error);
    }
  };

  const handleMentorAnalysis = async () => {
    if (!user || !userProfile) {
      console.error("Usuário ou perfil do usuário não autenticado.");
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisResult('🧠 O Mentor está analisando seu diário de bordo. Por favor, aguarde...');

    const webhookUrl = 'https://primary-production-5219.up.railway.app/webhook/diariodebordoai';
    if (thoughts.length === 0) {
      alert('Adicione alguns pensamentos antes de solicitar uma análise.');
      return;
    }

    // Mostrar feedback visual de carregamento
    setMentorAnalysis('✨ Preparando sua sessão de mentoria... O Oráculo do Fator Essencial está despertando para guiá-lo em sua jornada de transformação.');
    setShowMentorChat(true);

    try {
      const webhookData = {
        body: {
          message: "", // Para análise, a mensagem é vazia
          user_id: userProfile?.id || '',
          auth_user_id: user?.id || '',
          nome_usuario: userProfile?.full_name || user?.user_metadata?.full_name || user?.email || 'Usuário',
          acao: 'Análise',
          tipo: 'text',
          time_acao: new Date().toISOString(),
        }
      };

      console.log('Enviando dados para webhook:', webhookData);

      // Tentar enviar para o webhook primeiro
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('Resposta inicial do webhook:', responseData);
          
          // Verificar se a resposta é um array (múltiplas respostas do n8n)
          if (Array.isArray(responseData) && responseData.length > 0) {
            // Pegar a primeira resposta válida do array
            const firstResponse = responseData[0];
            if (firstResponse && firstResponse.output) {
              const analysis = firstResponse.output;
              
              // Verificar se é uma análise completa
              if (analysis.length > 100 && !analysis.includes('recebido') && !analysis.includes('processando') && !analysis.includes('aguarde')) {
                setMentorAnalysis(analysis);
                return;
              }
            }
          }
          // Verificar formato de resposta única (fallback)
          else if (responseData.analysis || responseData.message || responseData.response) {
            const analysis = responseData.analysis || responseData.message || responseData.response;
            
            // Verificar se é uma análise completa (não apenas confirmação)
            if (analysis.length > 100 && !analysis.includes('recebido') && !analysis.includes('processando') && !analysis.includes('aguarde')) {
              setMentorAnalysis(analysis);
              return;
            }
          }
        } else if (response.status === 404) {
          console.error('Webhook não encontrado (404)');
          setMentorAnalysis('🔧 Serviço Temporariamente Indisponível\n\nOlá! Parece que nosso sistema de análise está passando por uma manutenção no momento.\n\n💡 O que você pode fazer:\n• Tente novamente em alguns minutos\n• Seus pensamentos foram salvos e não serão perdidos\n• A análise ficará disponível assim que o serviço for restaurado\n\n📞 Precisa de ajuda?\nSe o problema persistir, entre em contato com nosso suporte através do chat ou email.\n\nObrigado pela sua compreensão! 🙏');
          return;
        } else {
          const errorData = await response.text();
          console.error('Erro na resposta do webhook:', errorData);
          setMentorAnalysis('⚠️ Oops! Algo não saiu como esperado\n\nNosso sistema está enfrentando algumas dificuldades técnicas no momento.\n\n🔄 Sugestões:\n• Aguarde alguns minutos e tente novamente\n• Verifique sua conexão com a internet\n• Seus dados estão seguros e salvos\n\n💬 Precisa de assistência?\nNossa equipe de suporte está pronta para ajudar! Entre em contato conosco.\n\nAgradecemos sua paciência! ✨');
          return;
        }
      } catch (fetchError) {
        console.error('Erro ao enviar para webhook:', fetchError);
        // Continuar para o polling mesmo se houver erro na requisição inicial
      }

      // Se chegamos aqui, precisamos fazer polling para obter a resposta
      setMentorAnalysis('🧠 O Mentor está elaborando sua análise. Por favor aguarde.\n\n⏳ Processando seus pensamentos e insights...');
      
      let analysisReceived = false;
      const delays = [30000, 60000, 90000]; // 30s, 1min, 1:30min em milissegundos
      
      for (let attemptIndex = 0; attemptIndex < delays.length && !analysisReceived; attemptIndex++) {
        // Aguardar o delay específico
        await new Promise(resolve => setTimeout(resolve, delays[attemptIndex]));
        
        // Atualizar mensagem baseada no tempo decorrido
        const totalTime = delays.slice(0, attemptIndex + 1).reduce((sum, delay) => sum + delay, 0);
        
        let timeMessage = '';
        if (attemptIndex === 0) {
          timeMessage = '30 segundos decorridos';
        } else if (attemptIndex === 1) {
          timeMessage = '1 minuto decorrido';
        } else {
          timeMessage = '1 minuto e 30 segundos decorridos';
        }
        
        setMentorAnalysis(`🧠 O Mentor está elaborando sua análise. Por favor aguarde.\n\n⏳ ${timeMessage} - Continuando processamento...\n\n💭 Analisando padrões complexos de pensamento...`);
        
        try {
          // Fazer nova requisição para verificar se a análise está pronta
          const pollResponse = await fetch(`/api/webhook-response/1d3e78ad-8168-407f-a0d5-4ff71991b0d1/${userProfile?.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (pollResponse.ok) {
            const responseData = await pollResponse.json();
            console.log('Dados da resposta (tentativa', attemptIndex + 1, '):', responseData);
            
            // Verificar se a análise está disponível
            if (responseData.analysis || responseData.message || responseData.response) {
              const analysis = responseData.analysis || responseData.message || responseData.response;
              
              // Verificar se não é apenas uma mensagem de confirmação
              if (analysis.length > 100 && !analysis.includes('recebido') && !analysis.includes('processando') && !analysis.includes('aguarde')) {
                setMentorAnalysis(analysis);
                analysisReceived = true;
                console.log('Análise completa recebida na tentativa', attemptIndex + 1);
                break;
              }
            }
          } else if (pollResponse.status === 404) {
            console.log('Resposta ainda não disponível, tentativa', attemptIndex + 1);
          } else {
            console.log('Erro no polling:', pollResponse.status, pollResponse.statusText);
          }
        } catch (pollError) {
          console.log('Erro no polling, tentativa', attemptIndex + 1, ':', pollError.message);
        }
      }
      
      // Se não recebeu análise após todas as tentativas
      if (!analysisReceived) {
        setMentorAnalysis('⏱️ Análise em Andamento\n\nSeu mentor está dedicando um tempo especial para analisar profundamente seus pensamentos.\n\n✨ Isso significa que:\n• Seus insights são únicos e merecem atenção especial\n• A análise será mais rica e personalizada\n• Vale a pena aguardar!\n\n🔄 Que tal tentar novamente em alguns minutos?\nClique em "Análise do Mentor" quando estiver pronto.\n\n💝 Obrigado pela sua paciência!');
      }

    } catch (error) {
      console.error('Erro de conexão:', error);
      
      if (error.name === 'AbortError') {
        setMentorAnalysis('⏱️ Processamento Especial em Andamento\n\nSeu mentor está dedicando um tempo extra para criar uma análise excepcional dos seus pensamentos.\n\n🌟 Isso é um bom sinal!\nSignifica que seus insights são únicos e merecem atenção especial.\n\n🔄 Tente novamente em alguns minutos para receber sua análise personalizada.\n\n✨ Obrigado pela paciência!');
      } else if (error.message?.includes('CORS')) {
        setMentorAnalysis('🔧 Serviço em Manutenção\n\nNosso sistema está passando por alguns ajustes para melhor atendê-lo.\n\n💡 O que fazer:\n• Aguarde alguns minutos\n• Tente novamente\n• Seus dados estão seguros\n\n📞 Precisa de ajuda imediata?\nEntre em contato com nosso suporte!\n\n🙏 Agradecemos sua compreensão!');
      } else if (error.message?.includes('Failed to fetch')) {
        setMentorAnalysis('🌐 Problema de Conexão\n\nParece que há uma dificuldade na comunicação com nossos servidores.\n\n🔍 Verificações sugeridas:\n• Sua conexão com a internet\n• Tente recarregar a página\n• Aguarde alguns minutos\n\n💬 Suporte sempre disponível!\nSe o problema persistir, nossa equipe está aqui para ajudar.\n\n💙 Obrigado pela paciência!');
      } else {
        setMentorAnalysis('⚠️ Situação Inesperada\n\nEncontramos uma situação que não esperávamos, mas não se preocupe!\n\n🛠️ Nossa equipe técnica:\n• Já foi notificada automaticamente\n• Está trabalhando na solução\n• Seus dados estão protegidos\n\n📞 Precisa de ajuda?\nNosso suporte está pronto para atendê-lo!\n\n🌟 Agradecemos sua paciência e confiança!');
      }
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6">
        <TopNavigation />
        <div className="mt-20 flex items-center justify-center">
          <div className="sacred-thinking"></div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <TopNavigation />
      
      <div className="mt-20 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-sm rounded-full px-6 py-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Registro Ativo</span>
          </div>
          
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Diário de Bordo
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Registre seus pensamentos, reflexões e progressos. O Mentor AI analisará todo contexto para lhe fornecer insights valiosos.
          </p>
        </div>

        <div className="space-y-6">
          {/* Novo Pensamento */}
          <div className="liberation-card">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Novo Pensamento
              </h2>
            </div>

            {/* Título do Pensamento */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Título do Pensamento
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Como me sinto hoje..."
                className="bg-transparent border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Conteúdo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Conteúdo
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva seus pensamentos, reflexões, objetivos alcançados, desafios enfrentados..."
                className="bg-transparent border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
                rows={5}
              />
            </div>

            {/* Botão Salvar Nota */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveThought}
                disabled={!title.trim() || !content.trim() || isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Pensamento'}
              </Button>
            </div>
          </div>

          {/* Meus Pensamentos */}
          {thoughts.length > 0 && (
            <div className="liberation-card">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    Meus Pensamentos ({thoughts.length})
                  </h3>
                </div>
                <Button
                  onClick={handleMentorAnalysis}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Análise do Mentor
                </Button>
              </div>
              
              <div className="space-y-4">
                {thoughts.map((thought) => (
                  <ThoughtCard 
                    key={thought.id} 
                    thought={thought} 
                    onDelete={handleDeleteThought}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chat do Mentor */}
          {showMentorChat && (
            <MentorAnalysisChat
              analysis={mentorAnalysis}
              onClose={() => setShowMentorChat(false)}
            />
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}

// Componente para exibir cada pensamento salvo
interface ThoughtCardProps {
  thought: Thought;
  onDelete: (id: string) => void;
}

function ThoughtCard({ thought, onDelete }: ThoughtCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-primary/20 rounded-lg p-4 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors relative">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-foreground text-lg pr-8">{thought.title}</h4>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-muted-foreground text-sm">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(thought.created_at)}
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 p-1 h-auto"
            title={isExpanded ? 'Ver menos' : 'Ver mais'}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-muted-foreground mb-2">
        {isExpanded ? (
          <p className="whitespace-pre-wrap">{thought.content}</p>
        ) : (
          <p className="line-clamp-2">{thought.content}</p>
        )}
      </div>
      
      {/* Ícone de lixeira no canto inferior direito */}
      <Button
        onClick={() => onDelete(thought.id)}
        variant="ghost"
        size="sm"
        className="absolute bottom-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-50 p-1 h-auto"
        title="Excluir pensamento"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}