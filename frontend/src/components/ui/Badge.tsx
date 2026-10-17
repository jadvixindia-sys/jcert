import { cn } from '@/lib/utils';

type Tone = 'ok' | 'warn' | 'info' | 'neutral' | 'expired';

const tones: Record<Tone, string> = {
  ok: 'bg-[color:var(--color-ok-tint)] text-[color:var(--color-ok)] border-[color:var(--color-ok)]/20',
  warn: 'bg-[color:var(--color-warn-tint)] text-[color:var(--color-warn)] border-[color:var(--color-warn)]/20',
  info: 'bg-brand-tint text-brand-ink border-brand/20',
  neutral: 'bg-canvas text-ink-soft border-line-strong',
  expired:
    'bg-[color:var(--color-accent-red)]/8 text-[color:var(--color-accent-red)] border-[color:var(--color-accent-red)]/25',
};

export function StatusBadge({ status }: { status: string }) {
  const tone: Tone =
    status === 'Completed' ? 'ok' : status === 'On Process' ? 'info' : status === 'Incomplete' ? 'warn' : 'neutral';
  return <Badge tone={tone}>{status}</Badge>;
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
