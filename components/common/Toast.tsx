'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Unique ID counter for reliable toast identification
let toastIdCounter = 0;

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-[var(--success-green)]/20',
    borderColor: 'border-[var(--success-green)]',
    textColor: 'text-[var(--success-green)]',
    role: 'status' as const,
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-[var(--error-red)]/20',
    borderColor: 'border-[var(--error-red)]',
    textColor: 'text-[var(--error-red)]',
    role: 'alert' as const,
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-[var(--warning-orange)]/20',
    borderColor: 'border-[var(--warning-orange)]',
    textColor: 'text-[var(--warning-orange)]',
    role: 'alert' as const,
  },
  info: {
    icon: Info,
    bgColor: 'bg-[var(--info-blue)]/20',
    borderColor: 'border-[var(--info-blue)]',
    textColor: 'text-[var(--info-blue)]',
    role: 'status' as const,
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  // Handle auto-dismiss with proper cleanup to prevent memory leaks
  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      role={config.role}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bgColor} ${config.borderColor} shadow-lg backdrop-blur-sm min-w-[320px] max-w-[480px]`}
    >
      <Icon size={20} className={config.textColor} aria-hidden="true" />
      <p className="flex-1 text-sm text-[var(--primary-text)]">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
        aria-label="Close notification"
      >
        <X size={16} className="text-[var(--tertiary-text)]" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = `toast-${++toastIdCounter}`;
    const toast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
