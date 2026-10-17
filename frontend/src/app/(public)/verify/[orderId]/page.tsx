import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { getCertificateByOrderId } from '@/lib/server-api';
import { CertificateCard } from '@/components/verify/CertificateCard';
import { VerifySearch } from '@/components/verify/VerifySearch';
import { formatDate } from '@/lib/format';
import { site } from '@/lib/site';

type Props = { params: Promise<{ orderId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params;
  const cert = await getCertificateByOrderId(orderId.toUpperCase());

  if (!cert) {
    return {
      title: `Certificate not found · ${orderId.toUpperCase()}`,
      robots: { index: false, follow: true },
    };
  }

  const title = `${cert.candidateName} — ${cert.courseName} · Verified`;
  const description = `Verified Jadvix certificate for ${cert.candidateName}: ${cert.courseName} (${cert.level}) at ${cert.institutionName}, completed ${formatDate(cert.completionDate)}.`;

  return {
    title,
    description,
    alternates: { canonical: `/verify/${cert.orderId}` },
    openGraph: { title, description, type: 'article', url: `${site.url}/verify/${cert.orderId}` },
    twitter: { card: 'summary', title, description },
    robots: { index: true, follow: true },
  };
}

export default async function VerifyPage({ params }: Props) {
  const { orderId } = await params;
  const normalized = orderId.toUpperCase();
  const cert = await getCertificateByOrderId(normalized);

  if (!cert) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-canvas text-muted">
          <SearchX className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-ink">No certificate found</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          We couldn&apos;t find a certificate for Order ID{' '}
          <span className="font-mono font-semibold text-ink">{normalized}</span>. Please check the ID
          and try again.
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <VerifySearch />
        </div>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-brand hover:text-brand-ink">
          ← Back to verification home
        </Link>
      </div>
    );
  }

  const credentialJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: cert.courseName,
    credentialCategory: cert.level,
    identifier: cert.orderId,
    dateCreated: cert.completionDate,
    recognizedBy: { '@type': 'Organization', name: site.company },
    about: { '@type': 'Person', name: cert.candidateName },
    offers: { '@type': 'Organization', name: cert.institutionName },
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(credentialJsonLd) }}
      />
      <div className="mb-6 print:hidden">
        <Link href="/" className="text-sm font-semibold text-brand hover:text-brand-ink">
          ← Verify another certificate
        </Link>
      </div>
      <CertificateCard cert={cert} />
    </div>
  );
}
