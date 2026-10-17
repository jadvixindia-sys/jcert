'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

export function VerifySearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (id) router.push(`/verify/${encodeURIComponent(id)}`);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex items-stretch overflow-hidden rounded-[var(--radius-md)] border border-line-strong bg-white shadow-sm focus-within:border-brand">
        <div className="flex items-center pl-4 text-muted">
          <Search className="h-5 w-5" />
        </div>
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="Enter Order ID  ·  e.g. JX-AB12-CD34"
          aria-label="Certificate Order ID"
          className="min-w-0 flex-1 bg-transparent px-3 py-4 text-[15px] font-medium tracking-wide text-ink placeholder:font-normal placeholder:tracking-normal placeholder:text-muted/70 focus:outline-none"
        />
        <button
          type="submit"
          className="focusable flex items-center gap-2 bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-ink"
        >
          Verify
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
