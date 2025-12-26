'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-[var(--sakay-yellow)] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--tertiary-text)] text-sm mb-1">{title}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
            className="text-3xl font-bold text-[var(--primary-text)]"
          >
            {value}
          </motion.p>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.3 }}
              className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-[var(--success-green)]' : 'text-[var(--error-red)]'}`}
            >
              {trend.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-[var(--tertiary-text)]">vs last month</span>
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: delay + 0.1 }}
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
