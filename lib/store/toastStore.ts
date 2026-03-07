import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message, type = "success") => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    // Auto-dismiss sau 3s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Shorthand helpers để gọi từ bất kỳ đâu mà không cần hook
export const toast = {
  success: (msg: string) => useToastStore.getState().show(msg, "success"),
  error:   (msg: string) => useToastStore.getState().show(msg, "error"),
  info:    (msg: string) => useToastStore.getState().show(msg, "info"),
};
