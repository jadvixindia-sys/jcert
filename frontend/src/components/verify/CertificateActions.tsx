'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Printer,
  Link2,
  Check,
  Share2,
  Linkedin,
  BadgePlus,
  MessageCircle,
  Facebook,
  Mail,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Certificate } from '@/lib/types';

/** X (Twitter) has no lucide glyph — small inline mark. */
function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function CertificateActions({ cert }: { cert: Certificate }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(window.location.href);
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Close the menu on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const title = `${cert.candidateName} — ${cert.courseName}`;
  const summary = `Verified certificate: ${title} (${cert.level}) issued by ${cert.institutionName}. Order ID ${cert.orderId}.`;
  const e = encodeURIComponent;

  const completion = cert.completionDate ? new Date(cert.completionDate) : null;
  const expiry = cert.expiryDate ? new Date(cert.expiryDate) : null;

  /**
   * LinkedIn "Add to profile" — pre-fills the credential into the visitor's
   * Licenses & Certifications section.
   */
  const addToProfileUrl = (() => {
    const p = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: cert.courseName,
      organizationName: cert.institutionName,
      certUrl: url,
      certId: cert.orderId,
    });
    if (completion && !Number.isNaN(completion.getTime())) {
      p.set('issueYear', String(completion.getFullYear()));
      p.set('issueMonth', String(completion.getMonth() + 1));
    }
    if (expiry && !Number.isNaN(expiry.getTime())) {
      p.set('expirationYear', String(expiry.getFullYear()));
      p.set('expirationMonth', String(expiry.getMonth() + 1));
    }
    return `https://www.linkedin.com/profile/add?${p.toString()}`;
  })();

  const targets = [
    {
      label: 'Share on LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
    },
    {
      label: 'Add to LinkedIn profile',
      icon: BadgePlus,
      href: addToProfileUrl,
      highlight: true,
    },
    {
      label: 'Share on X',
      icon: XMark,
      href: `https://twitter.com/intent/tweet?text=${e(summary)}&url=${e(url)}`,
    },
    {
      label: 'Share on WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${e(`${summary} ${url}`)}`,
    },
    {
      label: 'Share on Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
    },
    {
      label: 'Share via email',
      icon: Mail,
      href: `mailto:?subject=${e(`Verified certificate — ${title}`)}&body=${e(`${summary}\n\nVerify here: ${url}`)}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: summary, url });
      setOpen(false);
    } catch {
      /* user dismissed */
    }
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <div className="relative" ref={menuRef}>
        <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>

        {open && (
          <div
            role="menu"
            /* Anchors left while the banner is stacked, right once it's a row —
               otherwise the menu overflows the viewport edge. */
            className="absolute left-0 z-50 mt-1.5 w-60 overflow-hidden rounded-[var(--radius-md)] border border-line bg-paper shadow-lg sm:left-auto sm:right-0"
          >
            {canNativeShare && (
              <MenuItem icon={Smartphone} label="Share…" onClick={nativeShare} />
            )}
            {targets.map((t) => (
              <a
                key={t.label}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors hover:bg-canvas ${
                  t.highlight ? 'font-semibold text-brand-ink' : 'text-ink-soft'
                }`}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                {t.label}
              </a>
            ))}
            <div className="border-t border-line">
              <MenuItem
                icon={copied ? Check : Link2}
                label={copied ? 'Link copied' : 'Copy link'}
                onClick={copy}
              />
            </div>
          </div>
        )}
      </div>

      <Button variant="secondary" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Print / PDF
      </Button>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-canvas"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}
