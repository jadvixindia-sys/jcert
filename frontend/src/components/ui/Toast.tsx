'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type Toast = { id: number; message: string; tone: 'success' | 'error' };
const ToastCtx = createContext<{ notify: (message: string, tone?: 'success' | 'error') => void }>({
  notify: () => {},
});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed bottom-5 right-5 z-[100] flex w-[320px] flex-col gap-2">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line bg-paper px-3.5 py-3 shadow-lg"
                >
                  {t.tone === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-ok)]" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-accent-red)]" />
                  )}
                  <p className="flex-1 text-[13px] text-ink">{t.message}</p>
                  <button
                    onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
                    className="text-muted hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastCtx.Provider>
  );
}
