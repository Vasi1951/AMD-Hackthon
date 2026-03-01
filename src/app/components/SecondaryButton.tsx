import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'teal' | 'emerald' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export function SecondaryButton({
  children,
  onClick,
  variant = 'teal',
  size = 'md',
  className = '',
  fullWidth = false,
}: SecondaryButtonProps) {
  const variants = {
    teal: 'glass-card border-neon-teal text-neon-teal hover:bg-neon-teal/10',
    emerald: 'glass-card border-emerald text-emerald hover:bg-emerald/10',
    white: 'glass-card border-text-primary text-text-primary hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } rounded-[16px] font-medium transition-all duration-300 ${className}`}
    >
      {children}
    </motion.button>
  );
}
