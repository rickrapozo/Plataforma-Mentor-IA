import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Shield, 
  Users, 
  Clock, 
  Award,
  Smartphone,
  HeadphonesIcon,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Benefit {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const benefits: Benefit[] = [
  {
    icon: Brain,
    title: "Mindset Vencedor",
    description: "Desenvolva uma mentalidade imparável que te levará ao próximo nível em todas as áreas da vida",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Target,
    title: "Foco Laser",
    description: "Elimine distrações e desenvolva um foco inabalável para alcançar seus objetivos mais rapidamente",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: TrendingUp,
    title: "Crescimento Acelerado",
    description: "Acelere seu desenvolvimento pessoal e profissional com técnicas comprovadas cientificamente",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "Alta Performance",
    description: "Técnicas exclusivas para maximizar sua produtividade e alcançar resultados extraordinários",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Users,
    title: "Comunidade Exclusiva",
    description: "Conecte-se com pessoas que compartilham os mesmos objetivos e acelere seu crescimento",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte 24/7",
    description: "Suporte prioritário via WhatsApp para tirar dúvidas e manter você no caminho certo",
    color: "from-pink-500 to-red-500"
  },
  {
    icon: BookOpen,
    title: "Arsenal Mental Completo",
    description: "Mais de 200 vídeos com estratégias práticas para transformar sua mente e sua vida",
    color: "from-teal-500 to-blue-500"
  },
  {
    icon: Smartphone,
    title: "Acesso Mobile",
    description: "Aprenda onde e quando quiser com nosso app mobile otimizado para seu crescimento",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: BarChart3,
    title: "Relatórios de Progresso",
    description: "Acompanhe sua evolução com relatórios detalhados e métricas de desenvolvimento",
    color: "from-cyan-500 to-teal-500"
  }
];

// Componente BenefitCard memoizado
const BenefitCard = memo(({ benefit, index }: { benefit: Benefit; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 h-full group-hover:border-white/20">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              className={`bg-gradient-to-br ${benefit.color} w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <benefit.icon className="w-8 h-8 text-white" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
              {benefit.title}
            </h3>
            
            <p className="text-gray-300 leading-relaxed text-sm">
              {benefit.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

BenefitCard.displayName = "BenefitCard";

export const BenefitsGrid = memo(() => {
  const renderedBenefits = useMemo(() => {
    return benefits.map((benefit, index) => (
      <BenefitCard key={index} benefit={benefit} index={index} />
    ));
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {renderedBenefits}
    </div>
  );
});

BenefitsGrid.displayName = "BenefitsGrid";