import type { Metadata } from 'next';
import './globals.css';
import { site } from '@/lib/site';
import { getSiteSettings } from '@/lib/server-api';
import { assetUrl } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const favicon = assetUrl(settings?.faviconUrl) || '/icon.svg';

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — Verify Professional Certifications`,
      template: `%s · ${site.shortName}`,
    },
    description: site.description,
    applicationName: site.name,
    keywords: ['Jadvix', 'certificate verification', 'UKRLP', 'professional certification', 'verify certificate'],
    authors: [{ name: site.company }],
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: `${site.name} — Verify Professional Certifications`,
      description: site.description,
      url: site.url,
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description: site.description,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(site.organizationJsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}
