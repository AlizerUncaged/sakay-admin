'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Car, Hash, Palette, User, Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Image from 'next/image';
import { api, AdminVehicle } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/Toast';

export default function VehiclesPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getVehicles(currentPage, 20, {
        search: debouncedSearch || undefined,
        status: filterStatus !== 'All' ? filterStatus : undefined,
      });

      if (response.success && response.data) {
        setVehicles(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, debouncedSearch]);

  const handleStatusChange = async (vehicleId: number, newStatus: string) => {
    setUpdatingStatus(vehicleId);
    try {
      await api.updateVehicle(vehicleId, { status: newStatus });
      setVehicles(vehicles.map(v =>
        v.id === vehicleId ? { ...v, status: newStatus } : v
      ));
      showSuccess(`Vehicle status updated to ${newStatus}`);
    } catch {
      showError('Failed to update vehicle status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-[var(--success-green)]/20 text-[var(--success-green)]';
      case 'Booked':
        return 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]';
      case 'Maintenance':
        return 'bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]';
      case 'Pending':
        return 'bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]';
      default:
        return 'bg-[var(--tertiary-text)]/20 text-[var(--tertiary-text)]';
    }
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
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">Failed to load vehicles</h2>
        <p className="text-[var(--tertiary-text)]">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchVehicles}
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
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Vehicles</h1>
          <p className="text-[var(--tertiary-text)]">Manage all registered vehicles</p>
        </div>
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
              placeholder="Search by plate, make, model, or owner..."
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
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={fetchVehicles}
            className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-[var(--tertiary-text)]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Vehicles Table */}
      {loading && vehicles.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--elevated-surface)] border-b border-[var(--border-color)]">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--secondary-text)]">Vehicle</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--secondary-text)]">Owner</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--secondary-text)]">Plate</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--secondary-text)]">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--secondary-text)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle, index) => (
                      <motion.tr
                        key={vehicle.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-[var(--border-color)] hover:bg-[var(--elevated-surface)] transition-colors"
                      >
                        {/* Vehicle Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--sakay-yellow)]/20 flex items-center justify-center">
                              <Car size={20} className="text-[var(--sakay-yellow)]" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--primary-text)]">
                                {vehicle.maker} {vehicle.model}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-[var(--tertiary-text)]">
                                <Palette size={12} />
                                <span>{vehicle.color}</span>
                                <span>|</span>
                                <span>{vehicle.manufacturedYear}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {vehicle.ownerProfileImageUrl ? (
                              <Image
                                src={vehicle.ownerProfileImageUrl.startsWith('http') ? vehicle.ownerProfileImageUrl : `https://sakay.to${vehicle.ownerProfileImageUrl}`}
                                alt={vehicle.ownerName}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[var(--elevated-surface)] flex items-center justify-center">
                                <User size={16} className="text-[var(--tertiary-text)]" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-[var(--primary-text)]">{vehicle.ownerName}</p>
                              <p className="text-xs text-[var(--tertiary-text)]">{vehicle.ownerEmail}</p>
                            </div>
                          </div>
                        </td>

                        {/* Plate */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Hash size={14} className="text-[var(--tertiary-text)]" />
                            <span className="text-[var(--primary-text)] font-mono">{vehicle.plateNumber}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={vehicle.status}
                              onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                              disabled={updatingStatus === vehicle.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-0 outline-none ${getStatusColor(vehicle.status)} ${updatingStatus === vehicle.id ? 'opacity-50' : ''}`}
                              style={{ backgroundColor: 'var(--elevated-surface)' }}
                            >
                              <option value="Available">Available</option>
                              <option value="Booked">Booked</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Pending">Pending</option>
                            </select>
                            {updatingStatus === vehicle.id && (
                              <Loader2 size={14} className="animate-spin text-[var(--sakay-yellow)]" />
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-lg text-sm font-medium hover:bg-[var(--bright-yellow)] transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[var(--tertiary-text)]">
                        {debouncedSearch ? `No vehicles found matching "${debouncedSearch}"` : 'No vehicles found'}
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
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
          Showing {vehicles.length} of {totalItems} vehicles
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
