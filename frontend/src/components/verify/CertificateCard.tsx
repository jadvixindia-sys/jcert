import {
  GraduationCap,
  Building2,
  Briefcase,
  Clock,
  CalendarDays,
  CalendarX,
  Layers,
  Hash,
  BadgeCheck,
  UserRound,
  ImageOff,
  ShieldCheck,
} from 'lucide-react';
import { isExpired, type Certificate, type Institute } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { assetUrl } from '@/lib/utils';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { CertificateActions } from './CertificateActions';

function instituteOf(cert: Certificate): Institute | null {
  return cert.institute && typeof cert.institute === 'object' ? (cert.institute as Institute) : null;
}

export function CertificateCard({ cert }: { cert: Certificate }) {
  const institute = instituteOf(cert);
  const logo = assetUrl(institute?.logo);
  const photo = assetUrl(cert.photoUrl);
  const expired = isExpired(cert);

  return (
    <article className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-paper shadow-sm">
      {/* Verified banner */}
      <div className="flex flex-col gap-3 border-b border-line bg-[color:var(--color-ok-tint)]/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-ok)] text-white">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[color:var(--color-ok)]">Certificate Verified</p>
            <p className="text-xs text-ink-soft">This credential exists in the official Jadvix registry.</p>
          </div>
        </div>
        <CertificateActions cert={cert} />
      </div>

      {/* Body */}
      <div className="cert-guilloche relative px-6 py-8 sm:px-9 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            {/* Candidate photo — or an explicit "No Photo" placeholder */}
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={cert.candidateName}
                className="h-24 w-24 shrink-0 rounded-[var(--radius-sm)] border border-line object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border border-dashed border-line-strong bg-canvas text-muted">
                <ImageOff className="h-6 w-6" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">No Photo</span>
              </div>
            )}

            <div className="min-w-0">
              <p className="eyebrow">Certified professional</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {cert.candidateName}
              </h1>
              <p className="mt-2 text-[15px] text-ink-soft">
                {cert.designation} · {cert.courseName}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge status={cert.status} />
                {/* Validity sits alongside the status — it never replaces it. */}
                {cert.expiryDate &&
                  (expired ? (
                    <Badge tone="expired">Expired</Badge>
                  ) : (
                    <Badge tone="ok">
                      <ShieldCheck className="h-3 w-3" /> Valid
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={cert.institutionName}
              className="h-16 w-auto max-w-[160px] shrink-0 object-contain"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-canvas text-brand">
              <GraduationCap className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Detail grid */}
        <dl className="mt-9 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
          <Detail icon={GraduationCap} label="Course / Programme" value={cert.courseName} />
          <Detail icon={Building2} label="Institution" value={cert.institutionName} />
          <Detail icon={Briefcase} label="Designation" value={cert.designation} />
          <Detail icon={Clock} label="Duration" value={cert.duration} />
          <Detail icon={CalendarDays} label="Completion date" value={formatDate(cert.completionDate)} />
          <Detail icon={Layers} label="Certification level" value={cert.level} />
          {/* Optional fields — rendered only when present */}
          {cert.expiryDate && (
            <Detail icon={CalendarX} label="Expiry date" value={formatDate(cert.expiryDate)} />
          )}
          {cert.gender && <Detail icon={UserRound} label="Gender" value={cert.gender} />}
          {institute?.trainerName && (
            <Detail icon={UserRound} label="Trainer" value={institute.trainerName} />
          )}
          {institute?.founderName && (
            <Detail icon={UserRound} label="Founder" value={institute.founderName} />
          )}
        </dl>

        {/* Footer codes */}
        <div className="mt-9 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <CodeItem icon={Hash} label="Order ID" value={cert.orderId} />
          <CodeItem label="Roll number" value={cert.rollNumber} />
        </div>
      </div>

      <div className="brandline h-[3px] w-full" />
    </article>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-brand/15 bg-brand-tint text-brand">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="eyebrow">{label}</dt>
        <dd className="mt-0.5 text-[15px] font-semibold text-ink">{value}</dd>
      </div>
    </div>
  );
}

function CodeItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted" />}
      <span className="eyebrow">{label}:</span>
      <span className="font-mono text-[13px] font-semibold text-ink">{value}</span>
    </div>
  );
}
