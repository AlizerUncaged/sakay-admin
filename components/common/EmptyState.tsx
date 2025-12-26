'use client';

import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({
  icon = <Inbox size={48} />,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="text-[var(--tertiary-text)] mb-4">{icon}</div>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-2">{title}</h3>
      )}
      <p className="text-[var(--tertiary-text)] max-w-md">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
