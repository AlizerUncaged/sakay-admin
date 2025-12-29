'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, Star, CheckCircle, XCircle, MoreVertical, Loader2, AlertCircle, RefreshCw, UserX, UserCheck, Eye, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, User } from '@/lib/api';
import { UserDetailModal } from '@/components/modals';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/Toast';

export default function UsersPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Customer' | 'Rider'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Debounce search for server-side filtering
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getUsers(currentPage, 20, {
        userType: filterType === 'All' ? undefined : filterType,
        search: debouncedSearch || undefined,
        isActive: filterStatus === 'All' ? undefined : filterStatus === 'Active',
      });
      if (response.success && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, filterStatus, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus, debouncedSearch]);

  const handleToggleUserStatus = async (user: User) => {
    try {
      await api.updateUserStatus(user.id, !user.isActive);
      fetchUsers();
      setActionMenuOpen(null);
      showSuccess(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch {
      showError('Failed to update user status');
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-[var(--success-green)]/20 text-[var(--success-green)]'
      : 'bg-[var(--error-red)]/20 text-[var(--error-red)]';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">Failed to load users</h2>
        <p className="text-[var(--tertiary-text)]">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchUsers}
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
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Users</h1>
          <p className="text-[var(--tertiary-text)]">Manage all users and riders</p>
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
          {/* Search - server-side with debounce */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
            {searchQuery && loading && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--tertiary-text)]" />
            )}
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
          >
            <option value="All">All Types</option>
            <option value="Customer">Customers</option>
            <option value="Rider">Riders</option>
          </select>

          {/* Status Filter */}
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
            onClick={fetchUsers}
            className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-[var(--tertiary-text)]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
      >
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--elevated-surface)]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Rides</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                <AnimatePresence mode="popLayout">
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-[var(--elevated-surface)] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-10 h-10 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold"
                            >
                              {user.firstName?.charAt(0) || '?'}
                            </motion.div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[var(--primary-text)] font-medium">
                                  {user.firstName} {user.lastName}
                                </span>
                                {user.isVerified ? (
                                  <CheckCircle size={14} className="text-[var(--success-green)]" />
                                ) : (
                                  <XCircle size={14} className="text-[var(--error-red)]" />
                                )}
                              </div>
                              {user.rating && (
                                <div className="flex items-center gap-1 text-xs text-[var(--tertiary-text)]">
                                  <Star size={12} className="text-[var(--sakay-yellow)] fill-[var(--sakay-yellow)]" />
                                  <span>{user.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-[var(--secondary-text)]">
                              <Mail size={14} />
                              <span>{user.email}</span>
                            </div>
                            {user.phoneNumber && (
                              <div className="flex items-center gap-2 text-sm text-[var(--tertiary-text)]">
                                <Phone size={14} />
                                <span>{user.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.userType === 'Rider'
                              ? 'bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]'
                              : user.userType === 'Admin'
                              ? 'bg-[var(--error-red)]/20 text-[var(--error-red)]'
                              : 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]'
                          }`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--primary-text)]">{user.totalRides || 0}</td>
                        <td className="px-6 py-4 text-[var(--tertiary-text)] text-sm">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="relative flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} className="text-[var(--tertiary-text)]" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                              className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
                            >
                              <MoreVertical size={18} className="text-[var(--tertiary-text)]" />
                            </motion.button>

                            <AnimatePresence>
                              {actionMenuOpen === user.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="absolute right-0 top-full mt-1 w-48 bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl shadow-lg z-10 overflow-hidden"
                                >
                                  <button
                                    onClick={() => {
                                      router.push(`/users/${user.id}`);
                                      setActionMenuOpen(null);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--elevated-surface)] transition-colors flex items-center gap-2 text-[var(--primary-text)]"
                                  >
                                    <ExternalLink size={16} />
                                    <span>View Full Profile</span>
                                  </button>
                                  <button
                                    onClick={() => handleToggleUserStatus(user)}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--elevated-surface)] transition-colors flex items-center gap-2"
                                  >
                                    {user.isActive ? (
                                      <>
                                        <UserX size={16} className="text-[var(--error-red)]" />
                                        <span className="text-[var(--error-red)]">Deactivate User</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck size={16} className="text-[var(--success-green)]" />
                                        <span className="text-[var(--success-green)]">Activate User</span>
                                      </>
                                    )}
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[var(--tertiary-text)]">
                        {debouncedSearch ? `No users found matching "${debouncedSearch}"` : 'No users found'}
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
          Showing {users.length} of {totalItems} users
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

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
