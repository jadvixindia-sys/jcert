'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn, ShieldCheck } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Field';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // If already authenticated, skip the form.
  useEffect(() => {
    api
      .get('/auth/me')
      .then(() => router.replace('/admin/dashboard'))
      .catch(() => setChecking(false));
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/login', { email, password });
      router.replace('/admin/dashboard');
    } catch (err) {
      setError(apiError(err, 'Invalid credentials'));
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="brandline h-[3px] w-full" />
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <div className="flex justify-center">
              <Logo href={null} />
            </div>
            <h1 className="mt-6 text-xl font-bold text-ink">Admin sign in</h1>
            <p className="mt-1 text-[13px] text-muted">Certificate management console</p>
          </div>

          <form
            onSubmit={submit}
            className="space-y-5 rounded-[var(--radius-md)] border border-line bg-paper p-6 shadow-sm"
          >
            <div>
              <Label>Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-[var(--radius-sm)] border border-[color:var(--color-accent-red)]/20 bg-[color:var(--color-accent-red)]/5 px-3 py-2 text-[13px] font-medium text-[color:var(--color-accent-red)]">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Protected area · authorised personnel only
          </p>
        </motion.div>
      </div>
    </div>
  );
}
