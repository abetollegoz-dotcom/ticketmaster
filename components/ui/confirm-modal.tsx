"use client";
import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  loading = false,
  children,
}: ConfirmModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const colorMap = {
    danger:  { icon: "text-red-400",    btn: "bg-red-600 hover:bg-red-700 text-white" },
    warning: { icon: "text-amber-400",  btn: "bg-amber-600 hover:bg-amber-700 text-white" },
    default: { icon: "text-indigo-400", btn: "btn-primary" },
  };
  const colors = colorMap[variant];

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="card w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted" />
        </button>

        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 ${colors.icon}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-secondary text-sm mb-6">{description}</p>

        {children && <div className="mb-6">{children}</div>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-ghost py-2.5 px-5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`py-2.5 px-6 rounded-xl font-semibold text-sm transition-colors ${colors.btn} disabled:opacity-50`}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
