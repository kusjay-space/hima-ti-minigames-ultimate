import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'rose' | 'amber' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'cyan', className = '' }) => {
  const variantStyles = {
    cyan: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-cyan-900/30',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-emerald-900/30',
    rose: 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-rose-900/30',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-amber-900/30',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-purple-900/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm tracking-wide ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
