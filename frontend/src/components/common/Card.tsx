import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'stone' | 'glow' | 'parchment';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'stone',
  className = '',
  onClick,
}) => {
  const variantStyles = {
    stone: 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm',
    glow: 'bg-slate-900/95 border border-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.15)] backdrop-blur-md',
    parchment: 'bg-amber-950/20 border border-amber-600/40 shadow-xl backdrop-blur-sm',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:border-slate-600 transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
