import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'mana' | 'emerald' | 'ruby' | 'slate';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'mana',
  icon,
  className = '',
}) => {
  const variantStyles = {
    gold: 'bg-amber-950/80 text-amber-300 border-amber-600/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    mana: 'bg-sky-950/80 text-sky-300 border-sky-600/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    ruby: 'bg-rose-950/80 text-rose-300 border-rose-600/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
