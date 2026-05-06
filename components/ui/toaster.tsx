"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

let addToastFn: ((toast: Omit<Toast, "id">) => void) | null = null;

export function toast(opts: Omit<Toast, "id">) {
  addToastFn?.(opts);
}

toast.success = (title: string, message?: string) =>
  toast({ type: "success", title, message });
toast.error = (title: string, message?: string) =>
  toast({ type: "error", title, message });
toast.info = (title: string, message?: string) =>
  toast({ type: "info", title, message });
toast.warning = (title: string, message?: string) =>
  toast({ type: "warning", title, message });

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
};

const COLORS: Record<ToastType, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-red-500/30 bg-red-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, opts.duration ?? 5000);
  }, []);

  useEffect(() => {
    addToastFn = add;
    return () => { addToastFn = null; };
  }, [add]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: 48 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto glass-dark border rounded-xl p-4 shadow-2xl flex gap-3 ${COLORS[t.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{ICONS[t.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.message && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {t.message}
                </p>
              )}
            </div>
            <button
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
