'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function Error({ title = 'Something went wrong', message, onRetry }: ErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--error-red)]/20 flex items-center justify-center">
        <AlertCircle size={32} className="text-[var(--error-red)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--primary-text)]">{title}</h2>
      <p className="text-[var(--tertiary-text)] text-center max-w-md">{message}</p>
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl"
        >
          <RefreshCw size={18} />
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
}

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[var(--error-red)]/10 border border-[var(--error-red)]/30 text-[var(--error-red)] px-4 py-3 rounded-xl text-sm flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={18} />
        {message}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:opacity-70">&times;</button>
      )}
    </motion.div>
  );
}
