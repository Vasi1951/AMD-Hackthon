import { motion } from 'motion/react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: 'teal' | 'emerald' | 'amber' | 'red';
  label?: string;
  value?: string;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = 'teal',
  label,
  value,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    teal: '#00E5C4',
    emerald: '#1FD28E',
    amber: '#F59E0B',
    red: '#EF4444',
  };

  const glowColors = {
    teal: 'rgba(0, 229, 196, 0.3)',
    emerald: 'rgba(31, 210, 142, 0.3)',
    amber: 'rgba(245, 158, 11, 0.3)',
    red: 'rgba(239, 68, 68, 0.3)',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 8px ${glowColors[color]})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {value && <p className="text-2xl font-bold text-text-primary">{value}</p>}
        {label && <p className="text-xs text-text-secondary mt-1">{label}</p>}
      </div>
    </div>
  );
}
