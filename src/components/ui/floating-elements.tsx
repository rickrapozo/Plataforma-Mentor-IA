import { motion } from 'framer-motion';
import { Brain, Zap, Target, Trophy, Star, Sparkles } from 'lucide-react';

const floatingIcons = [
  { Icon: Brain, color: 'text-purple-400', size: 'w-8 h-8' },
  { Icon: Zap, color: 'text-yellow-400', size: 'w-6 h-6' },
  { Icon: Target, color: 'text-blue-400', size: 'w-7 h-7' },
  { Icon: Trophy, color: 'text-orange-400', size: 'w-6 h-6' },
  { Icon: Star, color: 'text-pink-400', size: 'w-5 h-5' },
  { Icon: Sparkles, color: 'text-cyan-400', size: 'w-6 h-6' },
];

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map((item, index) => {
        const { Icon, color, size } = item;
        return (
          <motion.div
            key={index}
            className={`absolute ${color} ${size} opacity-20`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: 360,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          >
            <Icon className="w-full h-full" />
          </motion.div>
        );
      })}
    </div>
  );
};