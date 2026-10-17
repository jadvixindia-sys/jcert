'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2, MapPin } from 'lucide-react';
import { api, apiError, unwrap } from '@/lib/api';
import type { Institute } from '@/lib/types';
import { assetUrl } from '@/lib/utils';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FieldGroup, Input } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';

type FormState = {
  name: string;
  address: string;
  logo: string;
  trainerName: string;
  founderName: string;
};
const empty: FormState = { name: '', address: '', logo: '', trainerName: '', founderName: '' };

export default function InstitutesPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Institute | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/institutes')
      .then((r) => setItems(unwrap<Institute[]>(r.data)))
      .catch((e) => notify(apiError(e), 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (i: Institute) => {
    setEditing(i);
    setForm({
      name: i.name,
      address: i.address,
      logo: i.logo || '',
      trainerName: i.trainerName || '',
      founderName: i.founderName || '',
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/admin/institutes/${editing._id}`, form);
      else await api.post('/admin/institutes', form);
      notify(editing ? 'Institute updated' : 'Institute added');
      setOpen(false);
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (i: Institute) => {
    if (!confirm(`Delete "${i.name}"? Certificates linked to it will keep their stored institution name.`)) return;
    try {
      await api.delete(`/admin/institutes/${i._id}`);
      notify('Institute deleted');
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  return (
    <div>
      <PageHeader title="Institutes" subtitle="Partner institutions and their branding.">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add institute
        </Button>
      </PageHeader>

      {loading ? (
        <p className="py-14 text-center text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="py-16 text-center text-muted">No institutes yet.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => {
            const logo = assetUrl(i.logo);
            return (
              <Card key={i._id} className="group p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-line bg-canvas">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={i.name} className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted" />
                    )}
                  </div>
                  <div className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(i)} className="focusable rounded-[var(--radius-xs)] p-1.5 text-muted hover:bg-brand-tint hover:text-brand" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(i)} className="focusable rounded-[var(--radius-xs)] p-1.5 text-muted hover:bg-[color:var(--color-accent-red)]/10 hover:text-[color:var(--color-accent-red)]" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{i.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {i.address}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit institute' : 'Add institute'}
        width="max-w-lg"
      >
        <form onSubmit={save} className="space-y-4 p-5">
          <FieldGroup label="Institute name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Institute name" />
          </FieldGroup>
          <FieldGroup label="Address / location">
            <Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="City, Country" />
          </FieldGroup>
          <FieldGroup label="Logo URL" hint="Paste a URL from the Gallery, or any image link.">
            <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="Paste an image URL from the Gallery" />
          </FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup label="Trainer name" hint="Optional — hidden on the certificate if blank.">
              <Input
                value={form.trainerName}
                onChange={(e) => setForm({ ...form, trainerName: e.target.value })}
                placeholder="Trainer / instructor name"
              />
            </FieldGroup>
            <FieldGroup label="Founder name" hint="Optional — hidden on the certificate if blank.">
              <Input
                value={form.founderName}
                onChange={(e) => setForm({ ...form, founderName: e.target.value })}
                placeholder="Founder / director name"
              />
            </FieldGroup>
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Add institute'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
