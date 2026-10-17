'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Building2, Clock, CheckCircle2, ArrowUpRight, Plus } from 'lucide-react';
import { api, unwrap } from '@/lib/api';
import type { Certificate, DashboardStats } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard/stats').then((r) => unwrap<DashboardStats>(r.data)),
      api.get('/admin/certificates').then((r) => unwrap<Certificate[]>(r.data)),
    ])
      .then(([s, c]) => {
        setStats(s);
        setCerts(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total certificates', value: stats?.totalCertificates ?? '—', icon: Award, tint: 'text-brand bg-brand-tint' },
    { label: 'Institutions', value: stats?.totalInstitutions ?? '—', icon: Building2, tint: 'text-[color:var(--color-ok)] bg-[color:var(--color-ok-tint)]' },
    { label: 'Completed', value: stats?.completedCertificates ?? '—', icon: CheckCircle2, tint: 'text-[color:var(--color-ok)] bg-[color:var(--color-ok-tint)]' },
    { label: 'In process', value: stats?.pendingCertificates ?? '—', icon: Clock, tint: 'text-[color:var(--color-warn)] bg-[color:var(--color-warn-tint)]' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of issued certifications and registry activity.">
        <Link href="/admin/certificates">
          <Button>
            <Plus className="h-4 w-4" /> Issue certificate
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] ${c.tint}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-[12px] font-medium text-muted">{c.label}</p>
            <p className="mt-0.5 text-2xl font-bold text-ink">{c.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">Recent certificates</h2>
          <Link href="/admin/certificates" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-ink">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-bold">Candidate</th>
                <th className="px-5 py-3 font-bold">Course</th>
                <th className="px-5 py-3 font-bold">Order ID</th>
                <th className="px-5 py-3 font-bold">Completed</th>
                <th className="px-5 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted">Loading…</td></tr>
              ) : certs.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted">No certificates yet.</td></tr>
              ) : (
                certs.slice(0, 6).map((c) => (
                  <tr key={c._id} className="hover:bg-canvas/60">
                    <td className="px-5 py-3 font-semibold text-ink">{c.candidateName}</td>
                    <td className="px-5 py-3 text-ink-soft">{c.courseName}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-brand">{c.orderId}</td>
                    <td className="px-5 py-3 text-ink-soft">{formatDate(c.completionDate, 'dd MMM yyyy')}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
