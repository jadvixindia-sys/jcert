import type { Metadata } from 'next';
import { ShieldCheck, BadgeCheck, Search, Building2 } from 'lucide-react';
import { VerifySearch } from '@/components/verify/VerifySearch';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Verify a Jadvix Certificate',
  description: site.description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              'radial-gradient(60% 55% at 50% -10%, var(--color-brand-tint) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:py-24">
          <span className="fade-up inline-flex items-center gap-2 rounded-[var(--radius-xs)] border border-line-strong bg-canvas px-3 py-1 text-[12px] font-semibold text-ink-soft">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Official credential verification
          </span>

          <h1 className="fade-up mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Verify a Jadvix
            <br />
            professional certificate
          </h1>
          <p className="fade-up mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Enter the unique Order ID printed on the certificate to instantly confirm the holder,
            course, institution and completion status — straight from the official Jadvix registry.
          </p>

          <div className="fade-up mx-auto mt-9 max-w-xl">
            <VerifySearch autoFocus />
            <p className="mt-3 text-xs text-muted">
              Every Jadvix certificate carries a non-sequential Order ID in the format{' '}
              <span className="font-mono font-semibold text-ink-soft">JX-XXXX-XXXX</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Trust points */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-3">
          <Feature
            icon={Search}
            title="Instant lookup"
            body="Results are pulled live from the Jadvix registry — no waiting, no third parties."
          />
          <Feature
            icon={BadgeCheck}
            title="Tamper-evident"
            body="Each record is issued with a unique code that cannot be guessed or forged."
          />
          <Feature
            icon={Building2}
            title="UKRLP registered"
            body={`Issued under ${site.company} (UKPRN ${site.ukprn}), a UK registered learning provider.`}
          />
        </div>
      </section>
    </>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-paper p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-brand/15 bg-brand-tint text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}
