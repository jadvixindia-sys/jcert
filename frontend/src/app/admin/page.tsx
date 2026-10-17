'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn, ShieldCheck, Briefcase } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { Logo } from '@/components/Logo';

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
      <div className="flex min-h-screen items-center justify-center bg-[#234C3C]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#516C5B] border-t-[#F86F07]" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#234C3C]">
      {/* Dynamic ambient background glow using the palette */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #425E6A 0%, #516C5B 50%, transparent 80%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-10 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #F86F07 0%, #234C3C 70%, transparent 100%)',
        }}
      />

      {/* Brand accent ribbon in full palette colors */}
      <div
        className="h-[3px] w-full"
        style={{
          background: 'linear-gradient(90deg, #234C3C 0%, #516C5B 25%, #425E6A 50%, #DCDBBC 75%, #F86F07 100%)',
        }}
      />

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center">
              <Logo href={null} light={true} />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#516C5B] bg-[#516C5B]/40 px-3.5 py-1 text-xs font-semibold text-[#DCDBBC]">
              <Briefcase className="h-3.5 w-3.5 text-[#F86F07]" />
              <span>Freelance Portal Console</span>
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#DCDBBC]">Welcome Back</h1>
            <p className="mt-1 text-sm text-[#DCDBBC]/70">Sign in to manage certificates and verifications</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-[#516C5B]/40 bg-[#1c3d30]/90 p-8 shadow-2xl backdrop-blur-xl">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#DCDBBC]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#DCDBBC]/50" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-[#516C5B] bg-[#234C3C]/80 py-2.5 pl-10 pr-4 text-sm text-[#DCDBBC] placeholder-[#DCDBBC]/40 transition duration-150 focus:border-[#F86F07] focus:outline-none focus:ring-2 focus:ring-[#F86F07]/25"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#DCDBBC]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#DCDBBC]/50" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#516C5B] bg-[#234C3C]/80 py-2.5 pl-10 pr-4 text-sm text-[#DCDBBC] placeholder-[#DCDBBC]/40 transition duration-150 focus:border-[#F86F07] focus:outline-none focus:ring-2 focus:ring-[#F86F07]/25"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-[#F86F07]/40 bg-[#F86F07]/15 p-3 text-sm font-medium text-[#F86F07]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F86F07] py-3 text-sm font-bold text-white shadow-lg shadow-[#F86F07]/20 transition duration-150 hover:bg-[#e06304] hover:shadow-[#F86F07]/35 focus:outline-none focus:ring-2 focus:ring-[#F86F07] focus:ring-offset-2 focus:ring-offset-[#234C3C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer security note */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-[#DCDBBC]/60">
            <ShieldCheck className="h-4 w-4 text-[#F86F07]" />
            <span>Protected Area · Authorised Personnel Only</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
