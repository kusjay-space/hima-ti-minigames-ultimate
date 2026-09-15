import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'purple' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const variantStyles: Record<string, string> = {
    primary: 'bg-primary/10 text-primary border-primary/30',
    cyan: 'bg-info/10 text-info border-info/30',
    info: 'bg-info/10 text-info border-info/30',
    emerald: 'bg-success/10 text-success border-success/30',
    success: 'bg-success/10 text-success border-success/30',
    rose: 'bg-error/10 text-error border-error/30',
    error: 'bg-error/10 text-error border-error/30',
    amber: 'bg-warning/10 text-warning border-warning/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    purple: 'bg-accent text-accent-content border-default'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm tracking-wide ${variantStyles[variant] || variantStyles.primary} ${className}`}>
      {children}
    </span>
  );
};
