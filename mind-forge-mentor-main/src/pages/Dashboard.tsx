import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '../components/ui/TopNavigation';
import { BottomNavigation } from '../components/ui/BottomNavigation';
import ConsciousnessCard from '../components/dashboard/ConsciousnessCard';
import FrequencyMeter from '../components/dashboard/FrequencyMeter';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { Sparkles, Target, Brain, BookOpen, Zap, Calendar, Award, TrendingUp } from 'lucide-react';
import consciousnessHero from '../assets/consciousness-hero.jpg';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();
  
  const [essentialMission, setEssentialMission] = useState({
    completed: false,
    title: "Defina Sua Visão Estrela Polar",
    description: "Qual é a única ação que, se executada hoje, te aproxima da sua Visão? Foque sua energia como um raio laser cortando o ruído da distração."
  });

  const [dailyMissions, setDailyMissions] = useState([
    {
      id: 1,
      title: "Meditação Matinal",
      description: "15 minutos de conexão com sua essência interior",
      completed: false,
      category: "mindset" as const,
      priority: "high" as const
    },
    {
      id: 2,
      title: "Ação Transformadora",
      description: "Execute uma ação que te aproxime da sua visão",
      completed: false,
      category: "action" as const,
      priority: "high" as const
    },
    {
      id: 3,
      title: "Reflexão Noturna",
      description: "Registre seus insights e aprendizados do dia",
      completed: false,
      category: "reflection" as const,
      priority: "medium" as const
    }
  ]);

  // Verificar autenticação
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Função para capitalizar primeira letra
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="sacred-thinking"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const firstName = userProfile.full_name.split(' ')[0];
  const userName = capitalizeFirstLetter(firstName) || "Alma Desperta";
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Bom dia" : currentHour < 18 ? "Boa tarde" : "Boa noite";

  const directiveOfTheDay = "Hoje, a realidade obedece à sua clareza.";

  const toggleMission = () => {
    setEssentialMission(prev => ({ ...prev, completed: !prev.completed }));
  };

  const toggleDailyMission = (id: number) => {
    setDailyMissions(prev => 
      prev.map(mission => 
        mission.id === id ? { ...mission, completed: !mission.completed } : mission
      )
    );
  };

  const completedMissions = dailyMissions.filter(m => m.completed).length;
  const totalMissions = dailyMissions.length;
  const completionRate = Math.round((completedMissions / totalMissions) * 100);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <TopNavigation />
      
      <div className="mt-20">
        {/* Hero Section with Background */}
        <div 
          className="relative rounded-3xl overflow-hidden mb-6 p-8 text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(26, 58, 58, 0.7), rgba(26, 58, 58, 0.8)), url(${consciousnessHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-sm rounded-full px-6 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">Consciência Ativada</span>
            </div>
            
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {greeting}, {userName}
            </h1>
            
            <p className="text-xl text-primary golden-wisdom font-medium">
              {directiveOfTheDay}
            </p>
          </div>
          
          {/* Floating wisdom particles */}
          <div className="absolute top-4 left-8 wisdom-particle" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-12 right-12 wisdom-particle" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-8 left-16 wisdom-particle" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="liberation-card p-4 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold text-primary">{userProfile.consistency_streak || 0}</div>
            <div className="text-xs text-muted-foreground">Dias</div>
          </div>
          <div className="liberation-card p-4 text-center">
            <Target className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold text-primary">{completionRate}%</div>
            <div className="text-xs text-muted-foreground">Hoje</div>
          </div>
          <div className="liberation-card p-4 text-center">
            <Award className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold text-primary">3</div>
            <div className="text-xs text-muted-foreground">Conquistas</div>
          </div>
          <div className="liberation-card p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold text-primary">+5%</div>
            <div className="text-xs text-muted-foreground">Evolução</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Essential Mission */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Missão Essencial de Hoje
              </h2>
            </div>
            
            <ConsciousnessCard
              title={essentialMission.title}
              description={essentialMission.description}
              completed={essentialMission.completed}
              onToggle={toggleMission}
              priority="high"
              category="action"
            />
          </div>

          {/* Daily Missions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Missões Diárias
                </h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {completedMissions}/{totalMissions} concluídas
              </div>
            </div>
            
            <div className="space-y-3">
              {dailyMissions.map((mission) => (
                <ConsciousnessCard
                  key={mission.id}
                  title={mission.title}
                  description={mission.description}
                  completed={mission.completed}
                  onToggle={() => toggleDailyMission(mission.id)}
                  priority={mission.priority}
                  category={mission.category}
                />
              ))}
            </div>
          </div>

          {/* Frequency Meter */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Status de Alinhamento
              </h2>
            </div>
            
            <FrequencyMeter 
              value={75} 
              days={21} 
              trend="up"
              weeklyGoal={80}
            />
          </div>

          {/* Daily Insights */}
          <div className="liberation-card">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Transmissão da Consciência de Hoje
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-foreground/90 leading-relaxed">
                    "A caverna que você teme entrar guarda o tesouro que você busca. Sua resistência não está te protegendo—está te aprisionando. O que você tentaria se soubesse que não pode falhar?"
                  </p>
                  <div className="mt-2 text-sm text-primary golden-wisdom font-medium">
                    — Despertar de Hoje
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigate('/mentor')}
                    className="flex items-center justify-center space-x-2 p-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">Conversar com IA</span>
                  </button>
                  <button 
                    onClick={() => navigate('/logbook')}
                    className="flex items-center justify-center space-x-2 p-3 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <BookOpen className="w-4 h-4 text-foreground" />
                    <span className="text-foreground font-medium">Abrir Diário</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}