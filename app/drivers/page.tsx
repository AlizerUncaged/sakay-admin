'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Phone, CheckCircle, XCircle, Eye, Loader2, AlertCircle, RefreshCw, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, Driver } from '@/lib/api';
import { AddDriverModal, DriverDetailModal } from '@/components/modals';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/Toast';

export default function DriversPage() {
  const router = useRouter();
  const { showSuccess } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Debounce search for server-side filtering
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getDrivers(currentPage, 20, {
        search: debouncedSearch || undefined,
        isActive: filterStatus === 'All' ? undefined : filterStatus === 'Active',
      });

      if (response.success && response.data) {
        setDrivers(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, debouncedSearch]);

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-[var(--success-green)]/20 text-[var(--success-green)]'
      : 'bg-[var(--tertiary-text)]/20 text-[var(--tertiary-text)]';
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
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">Failed to load drivers</h2>
        <p className="text-[var(--tertiary-text)]">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchDrivers}
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
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Drivers</h1>
          <p className="text-[var(--tertiary-text)]">Manage all registered drivers</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--elevated-surface)] rounded-xl"
          >
            <span className="text-sm text-[var(--secondary-text)]">
              {totalItems} Total
            </span>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl hover:bg-[var(--bright-yellow)] transition-colors"
          >
            <UserPlus size={18} />
            Add Driver
          </motion.button>
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
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
            {searchQuery && loading && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--tertiary-text)]" />
            )}
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={fetchDrivers}
            className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-[var(--tertiary-text)]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Driver Cards Grid */}
      {loading && drivers.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {drivers.length > 0 ? (
              drivers.map((driver, index) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-[var(--sakay-yellow)] transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedDriver(driver);
                    setIsDetailModalOpen(true);
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold text-lg"
                      >
                        {driver.firstName.charAt(0)}
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--primary-text)] font-semibold">
                            {driver.firstName} {driver.lastName}
                          </span>
                          {driver.isVerified ? (
                            <CheckCircle size={14} className="text-[var(--success-green)]" />
                          ) : (
                            <XCircle size={14} className="text-[var(--error-red)]" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-[var(--tertiary-text)]">
                          <Star size={12} className="text-[var(--sakay-yellow)] fill-[var(--sakay-yellow)]" />
                          <span>{driver.rating || 'N/A'}</span>
                          <span className="mx-1">|</span>
                          <span>{driver.totalRides || 0} rides</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.isActive)}`}>
                      {driver.isActive ? (
                        <div className="w-2 h-2 rounded-full bg-[var(--success-green)] animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[var(--tertiary-text)]" />
                      )}
                      <span>{driver.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-[var(--elevated-surface)] rounded-xl p-3 mb-4">
                    {driver.vehicle ? (
                      <>
                        <p className="text-[var(--primary-text)] font-medium">
                          {driver.vehicle.maker} {driver.vehicle.model}
                        </p>
                        <p className="text-sm text-[var(--tertiary-text)]">{driver.vehicle.plateNumber}</p>
                      </>
                    ) : (
                      <p className="text-[var(--tertiary-text)] text-sm">No vehicle registered</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="text-center p-2 bg-[var(--elevated-surface)] rounded-lg"
                    >
                      <p className="text-lg font-bold text-[var(--primary-text)]">{driver.totalRides || 0}</p>
                      <p className="text-xs text-[var(--tertiary-text)]">Total Rides</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="text-center p-2 bg-[var(--elevated-surface)] rounded-lg"
                    >
                      <p className="text-lg font-bold text-[var(--sakay-yellow)]">{driver.rating || 'N/A'}</p>
                      <p className="text-xs text-[var(--tertiary-text)]">Rating</p>
                    </motion.div>
                  </div>

                  {/* Contact */}
                  {driver.phoneNumber && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--secondary-text)]">
                        <Phone size={14} />
                        <span>{driver.phoneNumber}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/drivers/${driver.id}`);
                    }}
                    className="w-full py-2.5 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-xl hover:bg-[var(--bright-yellow)] transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye size={16} />
                    View Full Profile
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-[var(--tertiary-text)]">
                {debouncedSearch ? `No drivers found matching "${debouncedSearch}"` : 'No drivers found'}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-[var(--tertiary-text)]">
          Showing {drivers.length} of {totalItems} drivers
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

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchDrivers();
          setIsAddModalOpen(false);
          showSuccess('Driver added successfully');
        }}
      />

      {/* Driver Detail Modal */}
      <DriverDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        driver={selectedDriver}
        motorcycle={selectedDriver?.vehicle}
      />
    </div>
  );
}
