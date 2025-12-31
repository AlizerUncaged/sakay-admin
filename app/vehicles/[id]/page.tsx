'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Car,
  User,
  Mail,
  Hash,
  Palette,
  Calendar,
  DollarSign,
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Edit,
} from 'lucide-react';
import Image from 'next/image';
import { api, AdminVehicle } from '@/lib/api';
import { useToast } from '@/components/common/Toast';
import { EditVehicleModal } from '@/components/modals';

export default function VehicleProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const vehicleId = parseInt(params.id as string);

  const [vehicle, setVehicle] = useState<AdminVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchVehicle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getVehicle(vehicleId);
      if (response.success && response.data) {
        setVehicle(response.data);
      } else {
        setError('Vehicle not found');
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!vehicle) return;
    setUpdatingStatus(true);
    try {
      await api.updateVehicle(vehicle.id, { status: newStatus });
      setVehicle({ ...vehicle, status: newStatus });
      showSuccess(`Vehicle status updated to ${newStatus}`);
    } catch {
      showError('Failed to update vehicle status');
    } finally {
      setUpdatingStatus(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--error-red)]/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-[var(--error-red)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">{error || 'Vehicle not found'}</h2>
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
            onClick={fetchVehicle}
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
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Vehicle Details</h1>
          <p className="text-[var(--tertiary-text)]">View and manage vehicle information</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
        >
          <div className="text-center">
            {/* Vehicle Icon */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[var(--sakay-yellow)]/20 flex items-center justify-center">
              <Car size={48} className="text-[var(--sakay-yellow)]" />
            </div>

            {/* Vehicle Name */}
            <h2 className="text-xl font-bold text-[var(--primary-text)] mb-1">
              {vehicle.maker} {vehicle.model}
            </h2>
            <p className="text-[var(--tertiary-text)] mb-2">{vehicle.manufacturedYear}</p>

            {/* Plate Number */}
            <span className="inline-block px-3 py-1 rounded-full text-sm font-mono mb-4 bg-[var(--elevated-surface)] text-[var(--primary-text)]">
              {vehicle.plateNumber}
            </span>

            {/* Verification Badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {vehicle.isVerified ? (
                <>
                  <CheckCircle size={18} className="text-[var(--success-green)]" />
                  <span className="text-sm text-[var(--success-green)]">Verified</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-[var(--error-red)]" />
                  <span className="text-sm text-[var(--error-red)]">Not Verified</span>
                </>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="mb-6">
              <label className="block text-sm text-[var(--tertiary-text)] mb-2">Vehicle Status</label>
              <div className="flex items-center justify-center gap-2">
                <select
                  value={vehicle.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border border-[var(--border-color)] outline-none ${getStatusColor(vehicle.status)} ${updatingStatus ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: 'var(--elevated-surface)' }}
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
                {updatingStatus && <Loader2 size={18} className="animate-spin text-[var(--sakay-yellow)]" />}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditModal(true)}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors bg-[var(--sakay-yellow)] text-[var(--dark-background)] hover:bg-[var(--bright-yellow)]"
              >
                <Edit size={18} />
                Edit Vehicle
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/drivers/${vehicle.ownerId}`)}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors bg-[var(--elevated-surface)] text-[var(--primary-text)] hover:bg-[var(--input-background)]"
              >
                <User size={18} />
                View Owner Profile
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Owner Information */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
              <User size={20} className="text-[var(--sakay-yellow)]" />
              Owner Information
            </h3>
            <div className="flex items-center gap-4 p-4 bg-[var(--elevated-surface)] rounded-xl">
              {vehicle.ownerProfileImageUrl ? (
                <Image
                  src={vehicle.ownerProfileImageUrl.startsWith('http') ? vehicle.ownerProfileImageUrl : `https://sakay.to${vehicle.ownerProfileImageUrl}`}
                  alt={vehicle.ownerName}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-xl font-bold text-[var(--dark-background)]">
                  {vehicle.ownerName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-[var(--primary-text)]">{vehicle.ownerName}</p>
                <div className="flex items-center gap-2 text-sm text-[var(--tertiary-text)]">
                  <Mail size={14} />
                  <span>{vehicle.ownerEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
              <Settings size={20} className="text-[var(--sakay-yellow)]" />
              Vehicle Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <Car size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Make & Model</p>
                  <p className="text-[var(--primary-text)] font-medium">{vehicle.maker} {vehicle.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <Hash size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Plate Number</p>
                  <p className="text-[var(--primary-text)] font-medium font-mono">{vehicle.plateNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <Palette size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Color</p>
                  <p className="text-[var(--primary-text)] font-medium">{vehicle.color}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <Calendar size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Year</p>
                  <p className="text-[var(--primary-text)] font-medium">{vehicle.manufacturedYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <DollarSign size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Price/km</p>
                  <p className="text-[var(--primary-text)] font-medium">
                    {vehicle.pricePerKm ? `₱${vehicle.pricePerKm}` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <DollarSign size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Price/hour</p>
                  <p className="text-[var(--primary-text)] font-medium">
                    {vehicle.pricePerHour ? `₱${vehicle.pricePerHour}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(vehicle.chassisNumber || vehicle.engineNumber || vehicle.transmissionType) && (
            <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
                <Settings size={20} className="text-[var(--sakay-yellow)]" />
                Technical Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.chassisNumber && (
                  <div className="p-3 bg-[var(--elevated-surface)] rounded-xl">
                    <p className="text-xs text-[var(--tertiary-text)]">Chassis Number</p>
                    <p className="text-[var(--primary-text)] font-medium font-mono">{vehicle.chassisNumber}</p>
                  </div>
                )}
                {vehicle.engineNumber && (
                  <div className="p-3 bg-[var(--elevated-surface)] rounded-xl">
                    <p className="text-xs text-[var(--tertiary-text)]">Engine Number</p>
                    <p className="text-[var(--primary-text)] font-medium font-mono">{vehicle.engineNumber}</p>
                  </div>
                )}
                {vehicle.transmissionType && (
                  <div className="p-3 bg-[var(--elevated-surface)] rounded-xl">
                    <p className="text-xs text-[var(--tertiary-text)]">Transmission</p>
                    <p className="text-[var(--primary-text)] font-medium">{vehicle.transmissionType}</p>
                  </div>
                )}
                {vehicle.ownershipType && (
                  <div className="p-3 bg-[var(--elevated-surface)] rounded-xl">
                    <p className="text-xs text-[var(--tertiary-text)]">Ownership Type</p>
                    <p className="text-[var(--primary-text)] font-medium">{vehicle.ownershipType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-[var(--sakay-yellow)]" />
              Timeline
            </h3>
            <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
              <Calendar size={18} className="text-[var(--tertiary-text)]" />
              <div>
                <p className="text-xs text-[var(--tertiary-text)]">Registered On</p>
                <p className="text-[var(--primary-text)] font-medium">{formatDate(vehicle.createdAt)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        vehicle={vehicle}
        onSuccess={fetchVehicle}
      />
    </div>
  );
}
