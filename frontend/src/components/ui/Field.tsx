import { cn } from '@/lib/utils';

const base =
  'w-full rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink ' +
  'placeholder:text-muted/70 transition-colors focus:border-brand focusable';

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn('eyebrow mb-1.5 block', className)}>{children}</label>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(base, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(base, 'appearance-none bg-no-repeat', props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(base, 'resize-none', props.className)} />;
}

export function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
