import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { site } from '@/lib/site';
import { assetUrl } from '@/lib/utils';
import type { SiteSettings } from '@/lib/types';

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const ukrlp = assetUrl(settings?.ukrlpLogoUrl);
  const footerText = settings?.footerText || site.registration;

  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 text-[13px] leading-relaxed text-muted">{footerText}</p>
          </div>

          <div className="flex items-center gap-8">
            {ukrlp && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ukrlp} alt="UKRLP Registered" className="h-14 w-auto object-contain" />
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.company}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>UKPRN: {site.ukprn}</span>
            <Link href="/admin" className="font-semibold text-ink-soft hover:text-brand">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
