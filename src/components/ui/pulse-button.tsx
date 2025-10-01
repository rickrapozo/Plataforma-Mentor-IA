import { motion } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PulseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export const PulseButton = ({ 
  children, 
  onClick, 
  className, 
  size = 'lg',
  variant = 'default',
  disabled = false 
}: PulseButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-75"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.75, 0.5, 0.75],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <Button
        onClick={onClick}
        size={size}
        variant={variant}
        disabled={disabled}
        className={cn(
          "relative z-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300",
          className
        )}
      >
        {children}
      </Button>
    </motion.div>
  );
};