import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="brandline h-[3px] w-full" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="flex items-center gap-5 text-[13px] font-medium text-ink-soft">
          <Link href="/" className="hidden hover:text-ink sm:inline">
            Verify
          </Link>
          <a
            href="https://jadvix.uk"
            target="_blank"
            rel="noreferrer"
            className="hidden hover:text-ink sm:inline"
          >
            About Jadvix
          </a>
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border border-line-strong bg-canvas px-2 py-1 text-[11px] font-semibold text-ink-soft">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Secure Verification
          </span>
        </nav>
      </div>
    </header>
  );
}
