'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-ink border border-brand-ink/10 shadow-sm',
  secondary: 'bg-paper text-ink border border-line-strong hover:bg-canvas',
  ghost: 'bg-transparent text-ink-soft hover:bg-canvas border border-transparent',
  danger: 'bg-white text-[color:var(--color-accent-red)] border border-[color:var(--color-accent-red)]/25 hover:bg-[color:var(--color-accent-red)]/5',
};

const sizes: Record<Size, string> = {
  sm: 'text-[13px] px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-sm)] font-semibold transition-colors',
        'focusable disabled:opacity-55 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
