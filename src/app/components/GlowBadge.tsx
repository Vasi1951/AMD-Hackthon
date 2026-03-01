import type { ReactNode } from 'react';

interface GlowBadgeProps {
  children: ReactNode;
  variant: 'teal' | 'emerald' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export function GlowBadge({ children, variant, size = 'md' }: GlowBadgeProps) {
  const variants = {
    teal: 'bg-neon-teal/20 text-neon-teal border-neon-teal glow-teal',
    emerald: 'bg-emerald/20 text-emerald border-emerald glow-emerald',
    amber: 'bg-amber/20 text-amber border-amber glow-amber',
    red: 'bg-soft-red/20 text-soft-red border-soft-red glow-red',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}