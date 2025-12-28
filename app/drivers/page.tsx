'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Phone, CheckCircle, XCircle, Eye, Loader2, AlertCircle, RefreshCw, UserPlus, Settings, ExternalLink } from 'lucide-react';
import { api, User, Motorcycle } from '@/lib/api';
import { DriverDetailModal, AddDriverModal } from '@/components/modals';

interface DriverWithVehicle extends User {
  motorcycle?: Motorcycle;
}

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<DriverWithVehicle[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedDriver, setSelectedDriver] = useState<DriverWithVehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ridersResponse, motorcyclesResponse] = await Promise.all([
        api.getRiders(1, 50),
        api.getMotorcycles(1, 50),
      ]);

      if (ridersResponse.success && ridersResponse.data) {
        // Map motorcycles to drivers
        const motorcyclesByOwner = new Map<string, Motorcycle>();
        if (motorcyclesResponse.success && motorcyclesResponse.data) {
          motorcyclesResponse.data.forEach((m) => {
            motorcyclesByOwner.set(m.ownerId, m);
          });
          setMotorcycles(motorcyclesResponse.data);
        }

        const driversWithVehicles = ridersResponse.data.map((driver) => ({
          ...driver,
          motorcycle: motorcyclesByOwner.get(driver.id),
        }));
        setDrivers(driversWithVehicles);
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
    const plateNumber = driver.motorcycle?.plateNumber?.toLowerCase() || '';
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plateNumber.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (filterStatus === 'Active' ? driver.isActive : !driver.isActive);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-[var(--success-green)]/20 text-[var(--success-green)]'
      : 'bg-[var(--tertiary-text)]/20 text-[var(--tertiary-text)]';
  };

  const onlineCount = drivers.filter((d) => d.isActive).length;

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
          onClick={fetchData}
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
            <div className="w-2 h-2 rounded-full bg-[var(--success-green)] animate-pulse" />
            <span className="text-sm text-[var(--secondary-text)]">
              {onlineCount} Active
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
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
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
            onClick={fetchData}
            className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-[var(--tertiary-text)]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Driver Cards Grid */}
      {loading ? (
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
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver, index) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-[var(--sakay-yellow)] transition-colors"
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
                    {driver.motorcycle ? (
                      <>
                        <p className="text-[var(--primary-text)] font-medium">
                          {driver.motorcycle.brand} {driver.motorcycle.model}
                        </p>
                        <p className="text-sm text-[var(--tertiary-text)]">{driver.motorcycle.plateNumber}</p>
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
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedDriver(driver);
                        setIsDetailModalOpen(true);
                      }}
                      className="flex-1 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/drivers/${driver.id}`)}
                      className="flex-1 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-xl hover:bg-[var(--bright-yellow)] transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Settings size={16} />
                      Manage
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-[var(--tertiary-text)]">
                No drivers found
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Driver Detail Modal */}
      <DriverDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        driver={selectedDriver}
      />

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
