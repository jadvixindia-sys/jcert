'use client';

import { useEffect, useState } from 'react';
import { UserCog, Lock, Palette, Save } from 'lucide-react';
import { api, apiError, unwrap } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FieldGroup, Input, Textarea } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { notify } = useToast();

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Branding
  const [settings, setSettings] = useState<SiteSettings>({
    _id: 'default',
    headerLogoUrl: '',
    faviconUrl: '',
    ukrlpLogoUrl: '',
    footerLogoUrl: '',
    footerText: '',
  });
  const [savingBrand, setSavingBrand] = useState(false);

  useEffect(() => {
    api.get('/site-settings').then((r) => {
      const s = unwrap<SiteSettings>(r.data);
      setSettings({
        _id: s._id,
        headerLogoUrl: s.headerLogoUrl || '',
        faviconUrl: s.faviconUrl || '',
        ukrlpLogoUrl: s.ukrlpLogoUrl || '',
        footerLogoUrl: s.footerLogoUrl || '',
        footerText: s.footerText || '',
      });
    });
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirm) {
      notify('New passwords do not match', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const body: Record<string, string> = {};
      if (displayName) body.displayName = displayName;
      if (newPassword) {
        body.oldPassword = oldPassword;
        body.newPassword = newPassword;
      }
      await api.patch('/auth/profile', body);
      notify('Profile updated');
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBrand(true);
    try {
      await api.put('/admin/settings/site', settings);
      notify('Branding updated');
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSavingBrand(false);
    }
  };

  const setField = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSettings((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your admin profile and the public site branding." />

      <div className="space-y-6">
        {/* Profile */}
        <form onSubmit={saveProfile}>
          <Card>
            <CardHeader
              title={<span className="flex items-center gap-2"><UserCog className="h-4 w-4 text-brand" /> Profile</span>}
              description="Update your display name."
            />
            <div className="p-5">
              <FieldGroup label="Display name">
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" />
              </FieldGroup>
            </div>
            <div className="border-t border-line px-5 py-4">
              <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-ink">
                <Lock className="h-4 w-4 text-[color:var(--color-warn)]" /> Change password
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FieldGroup label="Current password">
                  <Input type="password" autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="New password">
                  <Input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Confirm new">
                  <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </FieldGroup>
              </div>
            </div>
            <div className="flex justify-end border-t border-line px-5 py-4">
              <Button type="submit" loading={savingProfile}>
                <Save className="h-4 w-4" /> Save profile
              </Button>
            </div>
          </Card>
        </form>

        {/* Branding */}
        <form onSubmit={saveBrand}>
          <Card>
            <CardHeader
              title={<span className="flex items-center gap-2"><Palette className="h-4 w-4 text-brand" /> Site branding</span>}
              description="Logos and footer shown on the public verification site."
            />
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <FieldGroup label="Header logo URL" hint="Optional square mark shown in the header.">
                <Input value={settings.headerLogoUrl ?? ''} onChange={setField('headerLogoUrl')} placeholder="Paste an image URL from the Gallery" />
              </FieldGroup>
              <FieldGroup label="Favicon URL" hint="Browser tab icon.">
                <Input value={settings.faviconUrl ?? ''} onChange={setField('faviconUrl')} placeholder="Paste a favicon URL from the Gallery" />
              </FieldGroup>
              <FieldGroup label="UKRLP logo URL">
                <Input value={settings.ukrlpLogoUrl ?? ''} onChange={setField('ukrlpLogoUrl')} placeholder="Paste the UKRLP logo URL" />
              </FieldGroup>
              <FieldGroup label="Footer logo URL">
                <Input value={settings.footerLogoUrl ?? ''} onChange={setField('footerLogoUrl')} placeholder="Paste the footer logo URL" />
              </FieldGroup>
              <div className="sm:col-span-2">
                <FieldGroup label="Footer legal text">
                  <Textarea rows={3} value={settings.footerText ?? ''} onChange={setField('footerText')} placeholder="Registration details…" />
                </FieldGroup>
              </div>
            </div>
            <div className="flex justify-end border-t border-line px-5 py-4">
              <Button type="submit" loading={savingBrand}>
                <Save className="h-4 w-4" /> Save branding
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
