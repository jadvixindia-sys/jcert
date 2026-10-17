import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 text-center">
      <Logo href="/" />
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 max-w-md text-[15px] text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist. To verify a certificate, head back to the
        home page and enter its Order ID.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-[var(--radius-sm)] bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-ink"
      >
        Go to verification home
      </Link>
    </div>
  );
}
