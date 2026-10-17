'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Copy, Check, ImageIcon } from 'lucide-react';
import { api, apiError, unwrap } from '@/lib/api';
import type { GalleryItem } from '@/lib/types';
import { assetUrl } from '@/lib/utils';
import { formatBytes } from '@/lib/format';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function GalleryPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/gallery')
      .then((r) => setItems(unwrap<GalleryItem[]>(r.data)))
      .catch((e) => notify(apiError(e), 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/admin/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('Asset uploaded');
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (item: GalleryItem) => {
    if (!confirm('Delete this asset permanently?')) return;
    try {
      await api.delete(`/admin/gallery/${item._id}`);
      notify('Asset deleted');
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  const copy = (item: GalleryItem) => {
    navigator.clipboard.writeText(assetUrl(item.url) || item.url);
    setCopied(item._id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div>
      <PageHeader title="Media gallery" subtitle="Upload logos and branding assets. Copy a URL to reuse it elsewhere.">
        <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
        <Button loading={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Upload asset
        </Button>
      </PageHeader>

      {loading ? (
        <p className="py-14 text-center text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-muted">
          <ImageIcon className="h-8 w-8 opacity-40" />
          No assets yet. Upload your first logo.
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
          {items.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <div className="flex aspect-square items-center justify-center border-b border-line bg-[repeating-conic-gradient(#f2f3f4_0%_25%,#fff_0%_50%)] bg-[length:12px_12px] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrl(item.url)} alt={item.fileName} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="p-2">
                <p className="truncate text-[11px] font-medium text-ink" title={item.fileName}>
                  {item.fileName}
                </p>
                <p className="mt-0.5 text-[10px] text-muted">
                  {item.mimeType.split('/')[1]?.toUpperCase()} · {formatBytes(item.size)}
                </p>
                <div className="mt-1.5 flex gap-1">
                  <Button size="sm" variant="secondary" className="flex-1 px-1.5 py-1 text-[11px]" onClick={() => copy(item)}>
                    {copied === item._id ? <Check className="h-3 w-3 text-[color:var(--color-ok)]" /> : <Copy className="h-3 w-3" />}
                    {copied === item._id ? 'Copied' : 'URL'}
                  </Button>
                  <Button size="sm" variant="danger" className="px-1.5 py-1" onClick={() => remove(item)} aria-label="Delete">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
