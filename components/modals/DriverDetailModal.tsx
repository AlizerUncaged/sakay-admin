'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Phone, Star, CheckCircle, XCircle, Calendar, Bike, MapPin, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '../common/Modal';
import { User, Motorcycle } from '@/lib/api';

interface DriverDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: User | null;
  motorcycle?: Motorcycle | null;
}

export function DriverDetailModal({ isOpen, onClose, driver, motorcycle }: DriverDetailModalProps) {
  const router = useRouter();

  if (!driver) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Driver Details" size="lg">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
          >
            {driver.profileImageUrl ? (
              <Image
                src={driver.profileImageUrl.startsWith('http') ? driver.profileImageUrl : `https://sakay.to${driver.profileImageUrl}`}
                alt={`${driver.firstName} ${driver.lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold text-3xl">
                {driver.firstName?.charAt(0) || '?'}
              </div>
            )}
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-[var(--primary-text)]">
                {driver.firstName} {driver.lastName}
              </h3>
              {driver.isVerified ? (
                <CheckCircle size={20} className="text-[var(--success-green)]" />
              ) : (
                <XCircle size={20} className="text-[var(--error-red)]" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]">
                Rider
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                driver.isActive
                  ? 'bg-[var(--success-green)]/20 text-[var(--success-green)]'
                  : 'bg-[var(--error-red)]/20 text-[var(--error-red)]'
              }`}>
                {driver.isActive ? 'Active' : 'Inactive'}
              </span>
              {driver.rating && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-[var(--sakay-yellow)] fill-[var(--sakay-yellow)]" />
                  <span className="text-sm text-[var(--primary-text)]">{driver.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[var(--elevated-surface)] rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-[var(--tertiary-text)] uppercase tracking-wide">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--info-blue)]/20">
                <Mail size={18} className="text-[var(--info-blue)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--tertiary-text)]">Email</p>
                <p className="text-[var(--primary-text)]">{driver.email}</p>
              </div>
            </div>
            {driver.phoneNumber && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--success-green)]/20">
                  <Phone size={18} className="text-[var(--success-green)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Phone</p>
                  <p className="text-[var(--primary-text)]">{driver.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Info */}
        {motorcycle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--elevated-surface)] rounded-xl p-4"
          >
            <h4 className="text-sm font-medium text-[var(--tertiary-text)] uppercase tracking-wide mb-4">Vehicle Information</h4>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[var(--sakay-yellow)]/20">
                <Bike size={32} className="text-[var(--sakay-yellow)]" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Brand & Model</p>
                  <p className="text-[var(--primary-text)] font-medium">{motorcycle.brand} {motorcycle.model}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Plate Number</p>
                  <p className="text-[var(--primary-text)] font-medium">{motorcycle.plateNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Year</p>
                  <p className="text-[var(--primary-text)]">{motorcycle.year}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Color</p>
                  <p className="text-[var(--primary-text)]">{motorcycle.color}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    motorcycle.status === 'Available'
                      ? 'bg-[var(--success-green)]/20 text-[var(--success-green)]'
                      : motorcycle.status === 'Booked'
                      ? 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]'
                      : 'bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]'
                  }`}>
                    {motorcycle.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Price/km</p>
                  <p className="text-[var(--sakay-yellow)] font-medium">₱{motorcycle.pricePerKm}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--elevated-surface)] rounded-xl p-4 text-center"
          >
            <Bike size={24} className="text-[var(--info-blue)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--primary-text)]">{driver.totalRides || 0}</p>
            <p className="text-xs text-[var(--tertiary-text)]">Total Rides</p>
          </motion.div>
          {driver.rating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--elevated-surface)] rounded-xl p-4 text-center"
            >
              <Star size={24} className="text-[var(--sakay-yellow)] mx-auto mb-2 fill-[var(--sakay-yellow)]" />
              <p className="text-2xl font-bold text-[var(--primary-text)]">{driver.rating}</p>
              <p className="text-xs text-[var(--tertiary-text)]">Rating</p>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--elevated-surface)] rounded-xl p-4 text-center"
          >
            <Calendar size={24} className="text-[var(--warning-orange)] mx-auto mb-2" />
            <p className="text-sm font-medium text-[var(--primary-text)]">{formatDate(driver.createdAt)}</p>
            <p className="text-xs text-[var(--tertiary-text)]">Member Since</p>
          </motion.div>
        </div>

        {/* View Full Profile Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onClose();
            router.push(`/drivers/${driver.id}`);
          }}
          className="w-full py-3 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-xl hover:bg-[var(--bright-yellow)] transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink size={18} />
          View Full Profile
        </motion.button>
      </div>
    </Modal>
  );
}
