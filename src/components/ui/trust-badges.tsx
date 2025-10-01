import { motion } from 'framer-motion';
import { Shield, Lock, Award, CheckCircle, Star, Users } from 'lucide-react';

export const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: "Pagamento Seguro",
      subtitle: "SSL 256-bit"
    },
    {
      icon: Lock,
      title: "Dados Protegidos",
      subtitle: "LGPD Compliant"
    },
    {
      icon: Award,
      title: "Garantia 30 Dias",
      subtitle: "100% do dinheiro de volta"
    },
    {
      icon: CheckCircle,
      title: "Acesso Imediato",
      subtitle: "Disponível 24/7"
    },
    {
      icon: Star,
      title: "4.9/5 Estrelas",
      subtitle: "Avaliação dos usuários"
    },
    {
      icon: Users,
      title: "1.247+ Membros",
      subtitle: "Comunidade ativa"
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 py-8">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
        >
          <badge.icon className="w-5 h-5 text-green-400" />
          <div>
            <div className="text-white text-sm font-medium">{badge.title}</div>
            <div className="text-gray-400 text-xs">{badge.subtitle}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};