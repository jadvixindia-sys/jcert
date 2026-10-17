/** Canonical site metadata for SEO — single source of truth. */
export const site = {
  name: 'Jadvix Certificate Portal',
  shortName: 'Jadvix Certificates',
  company: 'JADVIX LTD',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  description:
    'Verify the authenticity of professional certifications issued by Jadvix. Enter a certificate Order ID to instantly confirm the holder, course, and completion details.',
  ukprn: '10099758',
  registration:
    'JADVIX LTD (UKPRN: 10099758) is a UK Register of Learning Providers (UKRLP) registered provider.',
  organizationJsonLd() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.company,
      alternateName: 'Jadvix',
      url: this.url,
      logo: `${this.url}/jadvix-logo.svg`,
      identifier: `UKPRN:${this.ukprn}`,
    };
  },
};
