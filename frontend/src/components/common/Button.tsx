import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold transition-all duration-150 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-sky-600 hover:bg-sky-500 text-white border-b-4 border-sky-800 hover:border-sky-700 active:border-b-0 active:translate-y-1 shadow-md',
    gold: 'bg-amber-400 hover:bg-amber-300 text-stone-950 border-b-4 border-amber-600 hover:border-amber-500 active:border-b-0 active:translate-y-1 shadow-md font-extrabold',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 border border-slate-700',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white border-b-4 border-rose-900 active:border-b-0 active:translate-y-1 shadow-md',
    ghost:
      'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent hover:border-slate-700',
  };

  const glowStyle =
    glow && variant === 'gold'
      ? 'shadow-[0_0_20px_rgba(251,191,36,0.5)]'
      : glow && variant === 'primary'
      ? 'shadow-[0_0_20px_rgba(56,189,248,0.5)]'
      : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${glowStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
