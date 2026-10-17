'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Award,
  Building2,
  Images,
  Settings,
  LogOut,
  Menu,
  X,
  UserRound,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/lib/types';
import { ToastProvider } from '@/components/ui/Toast';

const NAV = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Certificates', href: '/admin/certificates', icon: Award },
  { name: 'Institutes', href: '/admin/institutes', icon: Building2 },
  { name: 'Gallery', href: '/admin/gallery', icon: Images },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        // /auth/me returns the decoded token: { sub, email, name }
        const a = res.data.data.admin;
        setAdmin({ id: a.sub ?? a.id, email: a.email, displayName: a.name ?? a.displayName });
        setReady(true);
      })
      .catch(() => router.replace('/admin'));
  }, [router]);

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    router.replace('/admin');
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-canvas">
        {/* Sidebar */}
        {open && (
          <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />
        )}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-paper transition-transform lg:static lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 items-center border-b border-line px-5">
            <Logo href="/admin/dashboard" />
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                    active
                      ? 'bg-brand-tint text-brand-ink'
                      : 'text-ink-soft hover:bg-canvas hover:text-ink'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', active ? 'text-brand' : 'text-muted')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-line p-3">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-[color:var(--color-accent-red)]/5 hover:text-[color:var(--color-accent-red)]"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur sm:px-6">
            <button
              onClick={() => setOpen((v) => !v)}
              className="focusable rounded-[var(--radius-xs)] p-1.5 text-ink-soft lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-ink">{admin?.displayName}</p>
                <p className="text-[11px] text-muted">{admin?.email}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas text-ink-soft">
                <UserRound className="h-5 w-5" />
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
