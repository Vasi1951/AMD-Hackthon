import { FC, ReactNode } from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
    icon: string;
    title: string;
    subtitle: string;
    action?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, subtitle, action }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
        <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-4"
        >
            {icon}
        </motion.div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-text-secondary text-sm mb-6 max-w-xs">{subtitle}</p>
        {action && action}
    </motion.div>
);

interface SkeletonProps { className?: string; }

export const Skeleton: FC<SkeletonProps> = ({ className = '' }) => (
    <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

export const SkeletonCard: FC = () => (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
    </div>
);
