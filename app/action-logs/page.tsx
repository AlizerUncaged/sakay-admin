'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  Calendar,
  Globe,
  FileText,
} from 'lucide-react';
import { api, AdminActionLog } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

export default function ActionLogsPage() {
  const [logs, setLogs] = useState<AdminActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getActionLogs(currentPage, 50); // Fetch more per page for better client-side search
      if (response.success && response.data) {
        setLogs(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load action logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Client-side filtering for current page (API doesn't support search)
  const filteredLogs = debouncedSearch
    ? logs.filter(
        (log) =>
          log.action.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          log.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          log.entityType.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : logs;

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return 'bg-[var(--success-green)]/20 text-[var(--success-green)]';
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]';
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return 'bg-[var(--error-red)]/20 text-[var(--error-red)]';
    }
    if (actionLower.includes('login') || actionLower.includes('logout')) {
      return 'bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]';
    }
    return 'bg-[var(--tertiary-text)]/20 text-[var(--tertiary-text)]';
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--error-red)]/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-[var(--error-red)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">Failed to load action logs</h2>
        <p className="text-[var(--tertiary-text)]">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl"
        >
          <RefreshCw size={18} />
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Action Logs</h1>
          <p className="text-[var(--tertiary-text)]">Track all administrative actions</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
            <input
              type="text"
              placeholder="Filter current page by action, description, or entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
            {searchQuery && loading && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--tertiary-text)]" />
            )}
          </div>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={fetchLogs}
            className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-[var(--tertiary-text)]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
      >
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--elevated-surface)]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Action</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Description</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Entity</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Admin</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">IP Address</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                <AnimatePresence mode="popLayout">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-[var(--elevated-surface)] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Activity size={16} className="text-[var(--tertiary-text)]" />
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-[var(--tertiary-text)]" />
                            <span className="text-[var(--secondary-text)] text-sm max-w-xs truncate">
                              {log.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[var(--primary-text)]">{log.entityType}</span>
                          {log.entityId && (
                            <span className="text-[var(--tertiary-text)] text-xs ml-1">#{log.entityId.slice(0, 8)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-[var(--tertiary-text)]" />
                            <span className="text-[var(--secondary-text)] text-sm">
                              {log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-[var(--tertiary-text)]" />
                            <span className="text-[var(--tertiary-text)] text-sm font-mono">
                              {log.ipAddress || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[var(--tertiary-text)]" />
                            <span className="text-[var(--tertiary-text)] text-sm">{formatDate(log.createdAt)}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[var(--tertiary-text)]">
                        {debouncedSearch ? `No logs found matching "${debouncedSearch}"` : 'No action logs found'}
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-[var(--tertiary-text)]">
          {debouncedSearch
            ? `Showing ${filteredLogs.length} filtered (${logs.length} on page, ${totalItems} total)`
            : `Showing ${logs.length} of ${totalItems} logs`}
        </p>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Previous
          </motion.button>
          <span className="px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-xl font-medium">
            {currentPage} / {totalPages || 1}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50"
          >
            Next
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
