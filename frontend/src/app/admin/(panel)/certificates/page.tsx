'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Upload, Download, Pencil, Trash2, ImageOff } from 'lucide-react';
import { api, apiError, unwrap } from '@/lib/api';
import {
  CERTIFICATE_LEVELS,
  CERTIFICATE_STATUSES,
  GENDERS,
  isExpired,
  type Certificate,
  type Institute,
} from '@/lib/types';
import { formatDate } from '@/lib/format';
import { assetUrl } from '@/lib/utils';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FieldGroup, Input, Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { parseCertificateCsv, toCsv } from '@/lib/csv';

type FormState = {
  orderId: string;
  candidateName: string;
  courseName: string;
  designation: string;
  completionDate: string;
  expiryDate: string;
  level: string;
  rollNumber: string;
  photoUrl: string;
  gender: string;
  institutionName: string;
  duration: string;
  status: string;
  instituteId: string;
};

const empty: FormState = {
  orderId: '',
  candidateName: '',
  courseName: '',
  designation: '',
  completionDate: new Date().toISOString().slice(0, 10),
  expiryDate: '',
  level: 'Professional',
  rollNumber: '',
  photoUrl: '',
  gender: '',
  institutionName: 'Jadvix Academy',
  duration: '',
  status: 'Completed',
  instituteId: '',
};

export default function CertificatesPage() {
  const { notify } = useToast();
  const [rows, setRows] = useState<Certificate[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/certificates').then((r) => unwrap<Certificate[]>(r.data)),
      api.get('/admin/institutes').then((r) => unwrap<Institute[]>(r.data)),
    ])
      .then(([c, i]) => {
        setRows(c);
        setInstitutes(i);
      })
      .catch((e) => notify(apiError(e), 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (c) =>
        c.candidateName.toLowerCase().includes(q) ||
        c.orderId.toLowerCase().includes(q) ||
        c.rollNumber.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (c: Certificate) => {
    setEditing(c);
    setForm({
      orderId: c.orderId,
      candidateName: c.candidateName,
      courseName: c.courseName,
      designation: c.designation,
      completionDate: c.completionDate.slice(0, 10),
      expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : '',
      level: c.level,
      rollNumber: c.rollNumber,
      photoUrl: c.photoUrl ?? '',
      gender: c.gender ?? '',
      institutionName: c.institutionName || 'Jadvix Academy',
      duration: c.duration || '',
      status: c.status,
      instituteId: typeof c.institute === 'object' && c.institute ? c.institute._id : '',
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      instituteId: form.instituteId || null,
      expiryDate: form.expiryDate || null,
      photoUrl: form.photoUrl || null,
      gender: form.gender || null,
      // Blank Order ID on create means "generate one".
      orderId: form.orderId.trim() || undefined,
    };
    try {
      if (editing) {
        await api.put(`/admin/certificates/${editing._id}`, payload);
        notify('Certificate updated');
      } else {
        await api.post('/admin/certificates', payload);
        notify('Certificate issued');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Certificate) => {
    if (!confirm(`Delete certificate for ${c.candidateName}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/certificates/${c._id}`);
      notify('Certificate deleted');
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const certificates = parseCertificateCsv(text);
      if (!certificates.length) throw new Error('No valid rows found in CSV');
      const res = await api.post('/admin/certificates/bulk', { certificates });
      notify(`Imported ${unwrap<{ count: number }>(res.data).count} certificate(s) with new Order IDs`);
      load();
    } catch (err) {
      notify(apiError(err, err instanceof Error ? err.message : undefined), 'error');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const exportCsv = () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `jadvix-certificates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <PageHeader title="Certificates" subtitle={`${rows.length} record(s) in the registry.`}>
        <input ref={fileRef} type="file" accept=".csv" onChange={onImport} className="hidden" />
        <Button variant="secondary" loading={importing} onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
        <Button variant="secondary" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Issue certificate
        </Button>
      </PageHeader>

      <div className="mb-4 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Search name, course, Order ID or roll number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-bold">Candidate</th>
                <th className="px-5 py-3 font-bold">Order ID</th>
                <th className="px-5 py-3 font-bold">Completed</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-14 text-center text-muted">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-14 text-center text-muted">No matching certificates.</td></tr>
              ) : (
                filtered.map((c) => {
                  const photo = assetUrl(c.photoUrl);
                  return (
                    <tr key={c._id} className="group hover:bg-canvas/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo} alt="" className="h-9 w-9 shrink-0 rounded-[var(--radius-xs)] border border-line object-cover" />
                          ) : (
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border border-line bg-canvas text-muted" title="No photo">
                              <ImageOff className="h-4 w-4" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-ink">{c.candidateName}</div>
                            <div className="text-[12.5px] text-muted">
                              {c.courseName} · <span className="text-ink-soft">{c.institutionName}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-mono text-[12px] text-brand">{c.orderId}</div>
                        <div className="font-mono text-[11.5px] text-muted">{c.rollNumber}</div>
                      </td>
                      <td className="px-5 py-3 text-ink-soft">
                        <div>{formatDate(c.completionDate, 'dd MMM yyyy')}</div>
                        {c.expiryDate && (
                          <div className="text-[11.5px] text-muted">
                            exp. {formatDate(c.expiryDate, 'dd MMM yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={c.status} />
                          {c.expiryDate &&
                            (isExpired(c) ? (
                              <Badge tone="expired">Expired</Badge>
                            ) : (
                              <Badge tone="ok">Valid</Badge>
                            ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                          <button onClick={() => openEdit(c)} className="focusable rounded-[var(--radius-xs)] p-1.5 text-muted hover:bg-brand-tint hover:text-brand" aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => remove(c)} className="focusable rounded-[var(--radius-xs)] p-1.5 text-muted hover:bg-[color:var(--color-accent-red)]/10 hover:text-[color:var(--color-accent-red)]" aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Update certificate' : 'Issue certificate'}
        description={
          editing
            ? 'The Order ID can be changed — it must stay unique.'
            : 'Leave the Order ID blank to generate one automatically.'
        }
      >
        <form onSubmit={save} className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup
              label="Order ID"
              hint={editing ? 'Editable — must remain unique.' : 'Optional — auto-generated if blank.'}
            >
              <Input
                value={form.orderId}
                onChange={set('orderId')}
                placeholder="JX-AB12-CD34"
                className="font-mono"
              />
            </FieldGroup>
            <FieldGroup label="Roll number">
              <Input required value={form.rollNumber} onChange={set('rollNumber')} placeholder="Unique roll number" />
            </FieldGroup>

            <FieldGroup label="Candidate full name">
              <Input required value={form.candidateName} onChange={set('candidateName')} placeholder="Full name" />
            </FieldGroup>
            <FieldGroup label="Gender" hint="Optional.">
              <Select value={form.gender} onChange={set('gender')}>
                <option value="">Not specified</option>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </Select>
            </FieldGroup>

            <div className="sm:col-span-2">
              <FieldGroup label="Candidate photo URL" hint="Optional — upload in Gallery, then paste its URL here. Shows “No Photo” when blank.">
                <Input value={form.photoUrl} onChange={set('photoUrl')} placeholder="Paste an image URL from the Gallery" />
              </FieldGroup>
            </div>

            <FieldGroup label="Course / programme">
              <Input required value={form.courseName} onChange={set('courseName')} placeholder="Programme name" />
            </FieldGroup>
            <FieldGroup label="Designation">
              <Input required value={form.designation} onChange={set('designation')} placeholder="Role or designation" />
            </FieldGroup>

            <FieldGroup label="Completion date">
              <Input required type="date" value={form.completionDate} onChange={set('completionDate')} />
            </FieldGroup>
            <FieldGroup label="Expiry date" hint="Optional — leave blank if it never expires.">
              <Input type="date" value={form.expiryDate} onChange={set('expiryDate')} />
            </FieldGroup>

            <FieldGroup label="Level">
              <Select value={form.level} onChange={set('level')}>
                {CERTIFICATE_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </Select>
            </FieldGroup>
            <FieldGroup label="Status">
              <Select value={form.status} onChange={set('status')}>
                {CERTIFICATE_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </FieldGroup>

            <FieldGroup label="Institution">
              <Select
                value={form.instituteId}
                onChange={(e) => {
                  const inst = institutes.find((i) => i._id === e.target.value);
                  setForm((f) => ({
                    ...f,
                    instituteId: e.target.value,
                    institutionName: inst ? inst.name : 'Jadvix Academy',
                  }));
                }}
              >
                <option value="">Manual entry</option>
                {institutes.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
              </Select>
            </FieldGroup>
            {form.instituteId === '' && (
              <FieldGroup label="Institution name">
                <Input value={form.institutionName} onChange={set('institutionName')} placeholder="Institution name" />
              </FieldGroup>
            )}

            <FieldGroup label="Duration">
              <Input required value={form.duration} onChange={set('duration')} placeholder="e.g. 3 Months" />
            </FieldGroup>
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Issue certificate'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
