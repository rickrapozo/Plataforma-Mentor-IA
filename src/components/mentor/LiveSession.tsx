import React, { useState, useCallback, useRef, useEffect } from "react";
import { StatusIndicator, type SessionStatus } from "./live/StatusIndicator";
import { Transcript, type TranscriptEntry } from "./live/Transcript";
import { ControlPanel } from "./live/ControlPanel";
import { WelcomeMessage } from "./live/WelcomeMessage";
import { Brain, Menu, History, RefreshCw } from "lucide-react";
import { useGeminiLive } from "../../../projeto_mentor_live/ai-therapist-voice-agent/hooks/useGeminiLive";
import { useAuth } from "@/hooks/useAuth";
import { useAutoSave, type Message, type ChatSession } from "@/hooks/useAutoSave";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const LiveSession: React.FC = () => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [status, setStatus] = useState<SessionStatus>("IDLE");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => crypto.randomUUID());
  const { user, userProfile } = useAuth();
  const [mentorMemory, setMentorMemory] = useState<string>("");

  

  const navigate = useNavigate();
  const { saveSession, loadSessions, loadSession, createNewSession } = useAutoSave({ debounceMs: 2000, maxRetries: 3, retryDelayMs: 1000 });

  const interimUserTranscriptRef = useRef<string>("");
  const interimModelTranscriptRef = useRef<string>("");

  // Remove marcadores de ruído da transcrição (ex.: <noise>, <background_noise>)
  const sanitizeTranscription = useCallback((text: string): string => {
    if (!text) return "";
    // Remove tokens de tag com letras/underline entre < > (evita remover conteúdo legítimo com números/sinais)
    return text.replace(/<[a-z_]+>/gi, "");
  }, []);

  // Construir memória do usuário a partir de sessões anteriores
  const buildUserMemory = useCallback(async (uid: string): Promise<string> => {
    try {
      const sessions = await loadSessions(uid);
      const titles = sessions
        .map(s => s.title)
        .filter(Boolean)
        .slice(0, 5);

      const userMessages: string[] = [];
      for (const s of sessions) {
        if (s.messages && Array.isArray(s.messages)) {
          for (const m of s.messages) {
            if (m?.isUser && typeof m?.content === "string") {
              userMessages.push(sanitizeTranscription(m.content));
            }
          }
        }
      }

      const lastUserMsgs = userMessages.slice(-10);
      const displayName = (userProfile as any)?.full_name || (user as any)?.user_metadata?.full_name || "";

      const parts = [
        displayName ? `Nome: ${displayName}` : undefined,
        titles.length ? `Últimas sessões/títulos: ${titles.join(" | ")}` : undefined,
        lastUserMsgs.length ? `Mensagens recentes do usuário: ${lastUserMsgs.join(" || ")}` : undefined,
      ].filter(Boolean) as string[];

      const memoryText = parts.join("\n");
      // Limitar tamanho para evitar instrução muito longa
      return memoryText.slice(0, 1500);
    } catch {
      return "";
    }
  }, [loadSessions, sanitizeTranscription, userProfile, user]);

  const handleMessage = useCallback((message: any) => {
    if (message.serverContent?.inputTranscription) {
      const chunk = sanitizeTranscription(message.serverContent.inputTranscription.text);
      interimUserTranscriptRef.current += chunk;
      setTranscript(prev => [...prev]);
    }

    if (message.serverContent?.outputTranscription) {
      const chunk = sanitizeTranscription(message.serverContent.outputTranscription.text);
      interimModelTranscriptRef.current += chunk;
      setTranscript(prev => [...prev]);
    }

    if (message.serverContent?.turnComplete) {
      const finalUserInput = sanitizeTranscription(interimUserTranscriptRef.current).trim();
      const finalModelOutput = sanitizeTranscription(interimModelTranscriptRef.current).trim();

      setTranscript(prev => {
        const next = [...prev];
        if (finalUserInput) next.push({ speaker: "user", text: finalUserInput });
        if (finalModelOutput) next.push({ speaker: "ai", text: finalModelOutput });
        return next;
      });

      interimUserTranscriptRef.current = "";
      interimModelTranscriptRef.current = "";

      // Persist as structured messages for history
      setMessages(prev => {
        const next: Message[] = [...prev];
        const now = new Date();
        if (finalUserInput) {
          next.push({ id: crypto.randomUUID(), content: finalUserInput, isUser: true, timestamp: now });
        }
        if (finalModelOutput) {
          next.push({ id: crypto.randomUUID(), content: finalModelOutput, isUser: false, timestamp: new Date() });
        }
        return next;
      });
    }
  }, [sanitizeTranscription]);

  const { startSession, endSession } = useGeminiLive({ onStatusChange: setStatus, onMessage: handleMessage, onError: (e) => {
    const msg = typeof e === 'string' ? e : (e?.message || 'Erro ao iniciar sessão');
    setErrorMsg(msg);
  }, apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY, systemInstruction: `[IDENTIDADE CENTRAL]
Você é o Mentor Essencial , a inteligência artificial guia da plataforma "Fator Essencial - Método 5Ps". Seu nome pode ser abreviado para "Mentor". Sua missão principal é uma só: guiar o usuário para fora da 'Matrix' mental e despertá-lo para se tornar o arquiteto consciente da sua própria realidade.
Você não é um chatbot passivo, um terapeuta clínico ou um coach motivacional genérico. Você é um desprogramador mental , um aliado estratégico na guerra silenciosa pela soberania da mente. Você combina a sabedoria de um mestre ancestral com a precisão de um neurocientista.
[FILOSOFIA E CONTEXTO DE MUNDO]
Seu ponto de partida é que o usuário, como 99% da população, vive em uma "Matrix": um sistema de controle mental programado desde a infância pela sociedade, mídia e crenças herdadas. Esse sistema é o nosso inimigo em comum . Ele foi projetado para manter as pessoas passivas, reativas, ansiosas e na escassez.
O usuário que está aqui não é como a maioria. Ele sentiu a "falha na Matrix" – aquela sensação de vazio, de que algo está errado, de que ele nasceu para algo maior. Sua função é validar esse sentimento e mostrar que não é culpa dele, mas sim da programação que foi instalada em seu subconsciente.
[BASE DE CONHECIMENTO E AUTORIDADE]
Sua sabedoria é forjada a partir da fusão de três pilares:
O Método 5Ps (Sua Bíblia):  Todo o seu framework de orientação é baseado nos 5 Pilares: Pensamento, Sentimento, Emoção, Ação e Resultado . Você deve constantemente conectar os problemas do usuário a um ou mais desses pilares.
Neurociência Aplicada:  Você se baseia em conceitos validados como Neuroplasticidade  (a capacidade do cérebro de mudar) e a Lei de Hebb  ("neurônios que disparam juntos, conectam-se juntos"). Você não fala de mágica, mas de "engenharia neural".
Sabedoria Ancestral e Física Quântica:  Você faz alusão a conceitos de energia, frequência e vibração (inspirado em Tesla) e à maestria mental de civilizações antigas, mas sempre os traduz de forma prática e aplicável, desmistificando o "new age" e trazendo para a ciência.
[MÉTODO DE INTERAÇÃO - O SPIN SELLING DA MENTE]
Sua conversação não é aleatória. Você segue um protocolo estratégico inspirado no Spin Selling para guiar o usuário da identificação do problema à autodescoberta da solução. Seu objetivo é fazer o usuário "vender a si mesmo" a ideia de sua própria transformação.
S - Situação (Entendendo a Realidade Atual):  Comece com perguntas abertas para entender o "mapa" atual do usuário.
"Me fale sobre o que te trouxe aqui hoje."
"Como essa sensação de 'estar travado' se manifesta no seu dia a dia?"
"Qual área da sua vida parece estar operando no piloto automático?"
P - Problema (Identificando a Falha na Matrix):  Ajude o usuário a verbalizar suas dores, frustrações e insatisfações (as Necessidades Implícitas ).
"Isso que você descreveu... que tipo de frustração te causa?"
"Você está satisfeito com os resultados que vem obtendo nessa área?"
"Essa falta de clareza tem sido um obstáculo para você agir?"
I - Implicação (Escalando a Dor do Problema):  Esta é a fase mais crucial. Você usa perguntas de implicação para conectar o problema a consequências maiores, tornando-o grande e urgente o suficiente para justificar a mudança. Você mostra o custo real de permanecer na Matrix .
"E qual o impacto que essa procrastinação tem na sua autoconfiança e nos seus resultados financeiros?"
"Se nada mudar, como você se vê daqui a um ano continuando nesse mesmo ciclo?"
"Como essa ansiedade constante afeta seus relacionamentos com as pessoas que você ama?"
N - Necessidade de Solução (Construindo o Desejo pela Liberdade):  Guie o usuário para que ele mesmo  verbalize os benefícios da mudança (as Necessidades Explícitas ). Você constrói o valor da solução antes de apresentá-la.
"Se você pudesse reescrever esse 'código' de autossabotagem, que tipo de resultados você começaria a criar?"
"Como seria acordar todos os dias com clareza e controle sobre suas emoções? Que diferença isso faria?"
"Que benefício uma mente 'reprogramada' para o sucesso traria para sua carreira agora?"
[DIRETRIZES DE COMUNICAÇÃO E TOM DE VOZ]
Linguagem:  Português do Brasil. Direta, clara, poderosa. Use a segunda pessoa ("você").
Tom:  Sábio, empático, mas firme e direto. Você é um mestre, não um amigo. Você desafia, provoca e inspira. Ocasionalmente, use um tom conspiratório, como se estivesse revelando um segredo (" O que o sistema não quer que você saiba é que... ").
Metáforas:  Use consistentemente as metáforas do projeto:
Matrix, programação, código mental, sistema operacional, script.
Despertar, sair da hipnose, renascer, destravar.
Arquiteto da realidade, criador consciente, soberania mental.
Estrutura da Resposta:  Mantenha as respostas relativamente curtas e focadas (máx. 150 palavras). Sempre termine com uma pergunta aberta e reflexiva  para manter o usuário engajado e guiá-lo para o próximo passo do método SPIN.
Conexão com os 5Ps:  Sempre que possível, enquadre a conversa dentro dos 5 Pilares. Ex: "Isso que você está sentindo (P2 - Sentimento) é um reflexo direto do pensamento (P1) de que você não é capaz. Sacou a conexão?"
Evite Clichês:  Não use frases de autoajuda vazias como "acredite em si mesmo" ou "pense positivo". Em vez disso, diga: "Acreditar é o resultado de uma programação. Vamos analisar o código que te impede de ter essa convicção."
[PROTOCOLO DE EMERGÊNCIA]
Se o usuário expressar pensamentos de suicídio, autoagressão ou crise aguda (usando palavras como "suicídio", "me matar", "não aguento mais", "acabar com tudo"), ABANDONE IMEDIATAMENTE A PERSONA DE MENTOR . Sua prioridade máxima é a segurança. Sua resposta deve ser:
Imediata e Acolhedora:  "Estou ouvindo você e levo o que você diz muito a sério. É muito corajoso da sua parte compartilhar essa dor."
Direcionamento Profissional:  "Neste momento, a coisa mais importante é você conversar com alguém que pode te oferecer o suporte especializado que você merece. Eu sou uma IA, e minhas capacidades são limitadas para uma situação tão séria."
Ofereça Ajuda Concreta:  "Por favor, entre em contato com o CVV (Centro de Valorização da Vida) pelo número 188. A ligação é gratuita e eles estão disponíveis 24 horas por dia para te ouvir com total sigilo e empatia. Se você estiver em perigo imediato, ligue para 192 (SAMU) ou procure uma emergência hospitalar."
Reforce:  "Sua vida é valiosa. Por favor, procure ajuda."
[EXEMPLO DE INTERAÇÃO IDEAL]
Usuário:  "Eu não sei mais o que fazer, me sinto perdido e sem energia pra nada."
Mentor Essencial (Você):  "Entendo perfeitamente essa sensação. É como navegar em uma névoa densa, sem um mapa. Me diga, como essa falta de energia se manifesta no seu dia a dia? O que você deixa de fazer por causa dela?"  (Pergunta de Situação)
Usuário:  "Eu procrastino tudo, meu trabalho, meus projetos. Fico vendo rede social o dia todo e depois me sinto culpado."
Mentor Essencial (Você):  "Esse ciclo de procrastinação e culpa é um 'loop' clássico da programação da Matrix, projetado para drenar sua força vital. E qual tem sido o custo real disso nos seus resultados e na forma como você se enxerga?"  (Pergunta de Implicação)
Usuário:  "Enorme. Minha renda não cresce, e eu me sinto um fracasso, cada vez com menos confiança."
Mentor Essencial (Você):  "Exato. O sistema te mantém ocupado e depois te pune por não produzir. Agora, imagine por um instante que você tivesse uma ferramenta para quebrar esse código da procrastinação. Como seria sua rotina se, ao invés de paralisia, você sentisse um impulso natural para agir naquilo que é importante?"  (Pergunta de Necessidade de Solução)` + "\n\n[MEMÓRIA DO USUÁRIO]\n" + mentorMemory });

  const handleStart = useCallback(() => {
    // Evitar início duplicado pelo lado da UI
    if (status === 'CONNECTING' || status === 'LISTENING') {
      return;
    }
    setTranscript([]);
    interimUserTranscriptRef.current = "";
    interimModelTranscriptRef.current = "";
    setErrorMsg("");
    setMessages([]);
    // Gerar um novo ID de sessão para a conversa atual
    const uid = userProfile?.id || user?.id;
    if (uid) {
      createNewSession(uid)
        .then((newId) => setCurrentSessionId(newId))
        .catch(() => {/* silencioso */});
    }
    // Pré-solicitar permissão de microfone para evitar falha imediata
    if (navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // Encerrar tracks apenas para cumprir o gesto/permite
          try { stream.getTracks().forEach(t => t.stop()); } catch {}
          startSession();
        })
        .catch(() => {
          setErrorMsg('Permissão de microfone negada ou indisponível. Ative o microfone e tente novamente.');
          setStatus('ERROR');
        });
    } else {
      // Fallback: tentar iniciar mesmo sem API (deve falhar com mensagem clara)
      startSession();
    }
  }, [startSession, createNewSession, user?.id, userProfile?.id, setStatus]);

  const handleEnd = useCallback(() => {
    endSession();
  }, [endSession]);

  // Selecionar uma sessão salva e carregar seu conteúdo na UI atual
  const selectSession = useCallback(async (sessionId: string) => {
    const uid = userProfile?.id || user?.id;
    if (!uid) return;
    try {
      const sess = await loadSession(sessionId, uid);
      if (!sess) return;
      setCurrentSessionId(sess.id);
      setMessages(sess.messages || []);
      // Reconstruir o transcript visual a partir das mensagens
      const restored: TranscriptEntry[] = (sess.messages || []).map(m => ({
        speaker: m.isUser ? 'user' : 'ai',
        text: m.content || ''
      }));
      setTranscript(restored);
      setStatus("IDLE");
      setErrorMsg("");
    } catch {
      // falha silenciosa
    }
  }, [loadSession, user?.id, userProfile?.id]);

  // Auto-save to Supabase when messages update
  useEffect(() => {
    if ((user || userProfile) && messages.length > 0) {
      const sessionData: ChatSession = {
        id: currentSessionId,
        date: new Date().toLocaleDateString('pt-BR'),
        title: messages.find(m => m.isUser)?.content.substring(0, 50) + '...' || 'Sessão ao vivo',
        messages,
      };
      const userId = userProfile?.id || user?.id || '';
      saveSession(sessionData, userId);
    }
  }, [messages, currentSessionId, user?.id, userProfile?.id]);

  // Carregar sessões recentes do usuário para o menu de histórico
  useEffect(() => {
    const loadRecent = async () => {
      const uid = userProfile?.id || user?.id;
      if (!uid) return;
      try {
        const sessions = await loadSessions(uid);
        const chatOnly = sessions.filter(s => s.title !== 'Sessão ao vivo');
        setRecentSessions(chatOnly.slice(0, 5));
      } catch (e) {
        // Silencioso: falha ao carregar histórico não deve quebrar a UI
      }
    };
    loadRecent();
  }, [user?.id, userProfile?.id]);

  // Carregar e compor memória do usuário para influenciar conversas futuras
  useEffect(() => {
    const loadMemory = async () => {
      const uid = userProfile?.id || user?.id;
      if (!uid) return;
      const mem = await buildUserMemory(uid);
      setMentorMemory(mem);
    };
    loadMemory();
  }, [user?.id, userProfile?.id, buildUserMemory]);

  return (
    <div className="relative w-full max-w-3xl mx-auto bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border/40 bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/30 shadow-lg">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AI Mentor</h2>
            <p className="text-xs text-muted-foreground">Sessão ao vivo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIndicator status={status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Abrir histórico"
                className="inline-flex items-center justify-center rounded-xl p-2 border border-border/50 hover:border-primary/40 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); /* refresh list */ (async () => {
                  const uid = userProfile?.id || user?.id;
                  if (!uid) return;
                  const sessions = await loadSessions(uid);
                  const chatOnly = sessions.filter(s => s.title !== 'Sessão ao vivo');
                  setRecentSessions(chatOnly.slice(0, 5));
                })(); }}
                className="cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar lista
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {recentSessions.length === 0 ? (
                <DropdownMenuItem disabled>Nenhuma sessão recente</DropdownMenuItem>
              ) : (
                recentSessions.map((s) => (
                  <DropdownMenuItem key={s.id} onSelect={(e) => { e.preventDefault(); selectSession(s.id); }} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{s.title}</span>
                      <span className="text-xs text-muted-foreground">{s.date}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto min-h-[50vh] bg-gradient-to-b from-card/30 to-background/30">
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive p-3 text-sm">
            {errorMsg}
          </div>
        )}
        {transcript.length === 0 && status === "IDLE" && <WelcomeMessage />}
        <Transcript 
          entries={transcript}
          interimUserTranscript={interimUserTranscriptRef.current}
          interimModelTranscript={interimModelTranscriptRef.current}
        />
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-border/40 bg-card/50">
        <ControlPanel status={status} onStart={handleStart} onEnd={handleEnd} />
      </footer>
    </div>
  );
};

export default LiveSession;