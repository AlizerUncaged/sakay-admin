'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Bike, Eye, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { api, Booking } from '@/lib/api';
import { BookingDetailModal } from '@/components/modals';
import { useDebounce } from '@/hooks/useDebounce';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<'All' | 'Ride' | 'Delivery'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Debounce search for server-side filtering
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getBookings(currentPage, 20, {
        status: filterStatus,
        bookingType: filterType,
        search: debouncedSearch || undefined,
      });
      if (response.success && response.data) {
        setBookings(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterType, debouncedSearch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterType, debouncedSearch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[var(--success-green)]/20 text-[var(--success-green)]';
      case 'InProgress':
        return 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]';
      case 'Accepted':
        return 'bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]';
      case 'Pending':
        return 'bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]';
      case 'Cancelled':
        return 'bg-[var(--error-red)]/20 text-[var(--error-red)]';
      default:
        return 'bg-[var(--tertiary-text)]/20 text-[var(--tertiary-text)]';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Stats
  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === 'Completed').length,
    pending: bookings.filter((b) => b.status === 'Pending').length,
    totalRevenue: bookings.filter((b) => b.status === 'Completed').reduce((acc, b) => acc + (b.finalFare || b.estimatedFare || 0), 0),
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
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">Failed to load bookings</h2>
        <p className="text-[var(--tertiary-text)]">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchBookings}
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
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Bookings</h1>
          <p className="text-[var(--tertiary-text)]">Manage all ride and delivery bookings</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: stats.total, color: 'var(--primary-text)' },
          { label: 'Completed', value: stats.completed, color: 'var(--success-green)' },
          { label: 'Pending', value: stats.pending, color: 'var(--warning-orange)' },
          { label: 'Revenue', value: `₱${stats.totalRevenue.toLocaleString()}`, color: 'var(--sakay-yellow)' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-4"
          >
            <p className="text-[var(--tertiary-text)] text-sm">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
            <input
              type="text"
              placeholder="Search by customer, driver, or ID..."
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
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
          >
            <option value="All">All Types</option>
            <option value="Ride">Ride</option>
            <option value="Delivery">Delivery</option>
          </select>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={fetchBookings}
            className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-[var(--tertiary-text)]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--elevated-surface)]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Driver</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Route</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Fare</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                <AnimatePresence mode="popLayout">
                  {bookings.length > 0 ? (
                    bookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-[var(--elevated-surface)] transition-colors"
                      >
                        <td className="px-6 py-4 text-[var(--primary-text)] font-medium">#{booking.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-[var(--tertiary-text)]" />
                            <span className="text-[var(--primary-text)]">
                              {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Bike size={14} className="text-[var(--sakay-yellow)]" />
                            <span className="text-[var(--secondary-text)]">
                              {booking.rider ? `${booking.rider.firstName} ${booking.rider.lastName}` : 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 max-w-[200px]">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-[var(--success-green)] mt-1.5 flex-shrink-0" />
                              <span className="text-xs text-[var(--secondary-text)] truncate">{booking.pickupLocation}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-[var(--error-red)] mt-1.5 flex-shrink-0" />
                              <span className="text-xs text-[var(--tertiary-text)] truncate">{booking.dropoffLocation}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.bookingType === 'Ride'
                              ? 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]'
                              : 'bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]'
                          }`}>
                            {booking.bookingType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[var(--primary-text)] font-medium">
                            {booking.finalFare || booking.estimatedFare ? `₱${(booking.finalFare || booking.estimatedFare || 0).toLocaleString()}` : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-2 hover:bg-[var(--input-background)] rounded-lg transition-colors"
                          >
                            <Eye size={18} className="text-[var(--tertiary-text)]" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[var(--tertiary-text)]">
                        No bookings found
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
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-[var(--tertiary-text)]">
          Showing {bookings.length} of {totalItems} bookings
        </p>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50"
          >
            Previous
          </motion.button>
          <span className="px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-xl font-medium">
            {currentPage}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50"
          >
            Next
          </motion.button>
        </div>
      </motion.div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
}
