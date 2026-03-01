import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import React from "react";
import type { ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'teal' | 'emerald' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
}

export function PrimaryButton({
  children,
  onClick,
  variant = 'teal',
  size = 'md',
  className = '',
  type = 'button',
  fullWidth = false,
}: PrimaryButtonProps) {
  const variants = {
    teal: 'bg-gradient-to-r from-neon-teal to-electric-cyan text-midnight glow-teal hover:shadow-xl',
    emerald: 'bg-gradient-to-r from-emerald to-lime-highlight text-midnight glow-emerald hover:shadow-xl',
    amber: 'bg-gradient-to-r from-amber to-yellow-500 text-midnight glow-amber hover:shadow-xl',
    red: 'bg-gradient-to-r from-soft-red to-red-600 text-white glow-red hover:shadow-xl',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
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