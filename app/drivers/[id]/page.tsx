'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Bike,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserX,
  UserCheck,
  Shield,
  Activity,
  Car,
  Palette,
  Hash,
  DollarSign,
  Wrench,
} from 'lucide-react';
import { api, User, Motorcycle, Booking } from '@/lib/api';

interface DriverWithVehicle extends User {
  motorcycle?: Motorcycle;
}

export default function DriverProfilePage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<DriverWithVehicle | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [driverResponse, bookingsResponse] = await Promise.all([
        api.getDriver(driverId),
        api.getBookings(1, 10, { search: driverId }),
      ]);

      if (driverResponse.success && driverResponse.data) {
        setDriver(driverResponse.data as DriverWithVehicle);
      } else {
        setError('Driver not found');
      }

      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data.filter(b => b.riderId === driverId));
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load driver');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [driverId]);

  const handleToggleStatus = async () => {
    if (!driver) return;
    setUpdating(true);
    try {
      await api.updateUserStatus(driver.id, !driver.isActive);
      setDriver({ ...driver, isActive: !driver.isActive });
    } catch {
      alert('Failed to update driver status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[var(--success-green)]/20 text-[var(--success-green)]';
      case 'Pending':
        return 'bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]';
      case 'Cancelled':
        return 'bg-[var(--error-red)]/20 text-[var(--error-red)]';
      case 'InProgress':
        return 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]';
      default:
        return 'bg-[var(--tertiary-text)]/20 text-[var(--tertiary-text)]';
    }
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-[var(--success-green)]/20 text-[var(--success-green)]';
      case 'Booked':
        return 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]';
      case 'Maintenance':
        return 'bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]';
      default:
        return 'bg-[var(--tertiary-text)]/20 text-[var(--tertiary-text)]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--error-red)]/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-[var(--error-red)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">{error || 'Driver not found'}</h2>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] font-medium rounded-xl"
          >
            <ArrowLeft size={18} />
            Go Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl"
          >
            <RefreshCw size={18} />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="p-2 hover:bg-[var(--elevated-surface)] rounded-xl transition-colors"
        >
          <ArrowLeft size={24} className="text-[var(--primary-text)]" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Driver Profile</h1>
          <p className="text-[var(--tertiary-text)]">View and manage driver details</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
        >
          <div className="text-center">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 mx-auto rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-4xl font-bold text-[var(--dark-background)] mb-4"
            >
              {driver.firstName?.charAt(0) || '?'}
            </motion.div>

            {/* Name & Verification */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[var(--primary-text)]">
                {driver.firstName} {driver.lastName}
              </h2>
              {driver.isVerified ? (
                <CheckCircle size={18} className="text-[var(--success-green)]" />
              ) : (
                <XCircle size={18} className="text-[var(--error-red)]" />
              )}
            </div>

            {/* Type Badge */}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]">
              Rider
            </span>

            {/* Rating */}
            <div className="flex items-center justify-center gap-1 mb-4">
              <Star size={16} className="text-[var(--sakay-yellow)] fill-[var(--sakay-yellow)]" />
              <span className="text-[var(--primary-text)] font-semibold">{driver.rating || 'N/A'}</span>
              <span className="text-[var(--tertiary-text)] text-sm">({driver.totalRides || 0} rides)</span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${driver.isActive ? 'bg-[var(--success-green)] animate-pulse' : 'bg-[var(--tertiary-text)]'}`} />
              <span className={`text-sm font-medium ${driver.isActive ? 'text-[var(--success-green)]' : 'text-[var(--tertiary-text)]'}`}>
                {driver.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Toggle Status Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleStatus}
              disabled={updating}
              className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                driver.isActive
                  ? 'bg-[var(--error-red)]/20 text-[var(--error-red)] hover:bg-[var(--error-red)]/30'
                  : 'bg-[var(--success-green)]/20 text-[var(--success-green)] hover:bg-[var(--success-green)]/30'
              }`}
            >
              {updating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : driver.isActive ? (
                <>
                  <UserX size={18} />
                  Deactivate Driver
                </>
              ) : (
                <>
                  <UserCheck size={18} />
                  Activate Driver
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Contact Information */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
              <Mail size={20} className="text-[var(--sakay-yellow)]" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <Mail size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Email</p>
                  <p className="text-[var(--primary-text)] font-medium">{driver.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <Phone size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Phone</p>
                  <p className="text-[var(--primary-text)] font-medium">{driver.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
              <Bike size={20} className="text-[var(--sakay-yellow)]" />
              Vehicle Information
            </h3>
            {driver.motorcycle ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--elevated-surface)] rounded-xl">
                  <div>
                    <p className="text-xl font-bold text-[var(--primary-text)]">
                      {driver.motorcycle.brand} {driver.motorcycle.model}
                    </p>
                    <p className="text-[var(--tertiary-text)]">{driver.motorcycle.year}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVehicleStatusColor(driver.motorcycle.status)}`}>
                    {driver.motorcycle.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-[var(--elevated-surface)] rounded-xl">
                    <Hash size={16} className="text-[var(--tertiary-text)]" />
                    <div>
                      <p className="text-xs text-[var(--tertiary-text)]">Plate</p>
                      <p className="text-[var(--primary-text)] font-medium text-sm">{driver.motorcycle.plateNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-[var(--elevated-surface)] rounded-xl">
                    <Palette size={16} className="text-[var(--tertiary-text)]" />
                    <div>
                      <p className="text-xs text-[var(--tertiary-text)]">Color</p>
                      <p className="text-[var(--primary-text)] font-medium text-sm">{driver.motorcycle.color}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-[var(--elevated-surface)] rounded-xl">
                    <DollarSign size={16} className="text-[var(--tertiary-text)]" />
                    <div>
                      <p className="text-xs text-[var(--tertiary-text)]">Price/km</p>
                      <p className="text-[var(--primary-text)] font-medium text-sm">₱{driver.motorcycle.pricePerKm || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-[var(--elevated-surface)] rounded-xl">
                    <Car size={16} className="text-[var(--tertiary-text)]" />
                    <div>
                      <p className="text-xs text-[var(--tertiary-text)]">Year</p>
                      <p className="text-[var(--primary-text)] font-medium text-sm">{driver.motorcycle.year}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-[var(--elevated-surface)] rounded-xl">
                <Wrench size={32} className="mx-auto mb-2 text-[var(--tertiary-text)]" />
                <p className="text-[var(--tertiary-text)]">No vehicle registered</p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
              <Activity size={20} className="text-[var(--sakay-yellow)]" />
              Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-center p-4 bg-[var(--elevated-surface)] rounded-xl"
              >
                <Star size={24} className="mx-auto mb-2 text-[var(--sakay-yellow)] fill-[var(--sakay-yellow)]" />
                <p className="text-2xl font-bold text-[var(--primary-text)]">{driver.rating || 'N/A'}</p>
                <p className="text-xs text-[var(--tertiary-text)]">Rating</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-center p-4 bg-[var(--elevated-surface)] rounded-xl"
              >
                <Bike size={24} className="mx-auto mb-2 text-[var(--info-blue)]" />
                <p className="text-2xl font-bold text-[var(--primary-text)]">{driver.totalRides || 0}</p>
                <p className="text-xs text-[var(--tertiary-text)]">Total Rides</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-center p-4 bg-[var(--elevated-surface)] rounded-xl"
              >
                <Shield size={24} className="mx-auto mb-2 text-[var(--success-green)]" />
                <p className="text-2xl font-bold text-[var(--primary-text)]">{driver.isVerified ? 'Yes' : 'No'}</p>
                <p className="text-xs text-[var(--tertiary-text)]">Verified</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-center p-4 bg-[var(--elevated-surface)] rounded-xl"
              >
                <Calendar size={24} className="mx-auto mb-2 text-[var(--tertiary-text)]" />
                <p className="text-sm font-bold text-[var(--primary-text)]">{formatDate(driver.createdAt)}</p>
                <p className="text-xs text-[var(--tertiary-text)]">Member Since</p>
              </motion.div>
            </div>
          </div>

          {/* Recent Rides */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-[var(--sakay-yellow)]" />
              Recent Rides
            </h3>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <motion.div
                    key={booking.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-3 bg-[var(--elevated-surface)] rounded-xl"
                  >
                    <div className="flex-1">
                      <p className="text-[var(--primary-text)] font-medium text-sm">
                        {booking.pickupLocation} → {booking.dropoffLocation}
                      </p>
                      <p className="text-xs text-[var(--tertiary-text)]">
                        {formatDate(booking.requestedAt)} • ₱{booking.finalFare || booking.estimatedFare || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--tertiary-text)]">
                No rides found
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
