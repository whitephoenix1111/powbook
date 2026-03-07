"use client";

import { useToastStore, type Toast } from "@/lib/store/toastStore";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const [visible, setVisible] = useState(false);

  // Mount animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const icon = {
    success: <Check size={14} strokeWidth={2.5} />,
    error:   <AlertCircle size={14} strokeWidth={2} />,
    info:    <Info size={14} strokeWidth={2} />,
  }[toast.type];

  const colors = {
    success: "bg-ink text-white",
    error:   "bg-red-600 text-white",
    info:    "bg-brand text-white",
  }[toast.type];

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-2.5
        px-4 py-2.5 rounded-xl shadow-lg
        font-sans text-[13px] font-medium
        transition-all duration-300 ease-out
        ${colors}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
      style={{ minWidth: 200, maxWidth: 360 }}
    >
      <span className="flex-shrink-0 opacity-90">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => dismiss(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}
