import type { ReactNode, MouseEventHandler } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'teal' | 'emerald' | 'amber' | 'red' | 'none';
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function GlassCard({ children, className = '', hover = false, glow = 'none', onClick }: GlassCardProps) {
  const glowClasses = {
    teal: 'glow-teal',
    emerald: 'glow-emerald',
    amber: 'glow-amber',
    red: 'glow-red',
    none: '',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-[20px] p-6 transition-all duration-300 ${hover ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : ''
        } ${glowClasses[glow]} ${className}`}
    >
      {children}
    </div>
  );
}
