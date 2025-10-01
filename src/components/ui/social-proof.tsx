import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, TrendingUp, Award, Eye, Clock } from 'lucide-react';
import { AnimatedCounter } from './animated-counter';

interface SocialProofItem {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}

const socialProofData: SocialProofItem[] = [
  {
    icon: Users,
    value: 1247,
    label: "Membros Ativos",
    suffix: "+",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Star,
    value: 4.9,
    label: "Avaliação Média",
    suffix: "/5",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: TrendingUp,
    value: 97,
    label: "Taxa de Sucesso",
    suffix: "%",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Award,
    value: 892,
    label: "Transformações",
    suffix: "+",
    color: "from-purple-500 to-pink-500"
  }
];

const liveActivity = [
  "Maria S. acabou de se inscrever",
  "João P. completou o módulo 3",
  "Ana L. alcançou sua meta mensal",
  "Carlos M. desbloqueou novo nível",
  "Fernanda R. compartilhou seu progresso",
  "Ricardo T. iniciou sua jornada",
  "Juliana K. completou 30 dias",
  "Pedro H. atingiu 100% de foco"
];

export const SocialProof = () => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(127);

  useEffect(() => {
    const activityTimer = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % liveActivity.length);
    }, 3000);

    const onlineTimer = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);

    return () => {
      clearInterval(activityTimer);
      clearInterval(onlineTimer);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {socialProofData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 text-center hover:bg-white/10 transition-all duration-300"
          >
            <motion.div
              className={`bg-gradient-to-br ${item.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <item.icon className="w-6 h-6 text-white" />
            </motion.div>
            
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">
              <AnimatedCounter 
                from={0} 
                to={item.value} 
                duration={2000}
                decimals={item.value < 10 ? 1 : 0}
              />
              <span className="text-purple-400">{item.suffix}</span>
            </div>
            
            <p className="text-gray-400 text-sm">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Atividade em Tempo Real */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">
                {onlineUsers} pessoas online agora
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Atividade ao vivo</span>
          </div>
        </div>

        <motion.div
          key={currentActivity}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-white">
            {liveActivity[currentActivity]}
          </span>
          <span className="text-gray-400 text-sm ml-auto">
            agora mesmo
          </span>
        </motion.div>
      </motion.div>

      {/* Badges de Confiança */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="flex flex-wrap justify-center gap-6 mt-12"
      >
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <span className="text-white text-sm font-medium">Método Comprovado</span>
        </div>

        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">🔒</span>
          </div>
          <span className="text-white text-sm font-medium">100% Seguro</span>
        </div>

        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">⚡</span>
          </div>
          <span className="text-white text-sm font-medium">Acesso Imediato</span>
        </div>

        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">⭐</span>
          </div>
          <span className="text-white text-sm font-medium">Garantia 30 Dias</span>
        </div>
      </motion.div>
    </div>
  );
};