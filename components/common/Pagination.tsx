'use client';

import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsShown: number;
  itemName?: string;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsShown,
  itemName = 'items',
  onPageChange,
}: PaginationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between"
    >
      <p className="text-sm text-[var(--tertiary-text)]">
        Showing {itemsShown} of {totalItems} {itemName}
      </p>
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </motion.button>
        <span className="px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-xl font-medium">
          {currentPage} / {totalPages || 1}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  );
}
