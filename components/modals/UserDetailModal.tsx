'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Phone, Star, CheckCircle, XCircle, Calendar, MapPin, Bike, ExternalLink } from 'lucide-react';
import { Modal } from '../common/Modal';
import { User } from '@/lib/api';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
  const router = useRouter();

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold text-3xl"
          >
            {user.firstName?.charAt(0) || '?'}
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-[var(--primary-text)]">
                {user.firstName} {user.lastName}
              </h3>
              {user.isVerified ? (
                <CheckCircle size={20} className="text-[var(--success-green)]" />
              ) : (
                <XCircle size={20} className="text-[var(--error-red)]" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.userType === 'Rider'
                  ? 'bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]'
                  : user.userType === 'Admin'
                  ? 'bg-[var(--error-red)]/20 text-[var(--error-red)]'
                  : 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]'
              }`}>
                {user.userType}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.isActive
                  ? 'bg-[var(--success-green)]/20 text-[var(--success-green)]'
                  : 'bg-[var(--error-red)]/20 text-[var(--error-red)]'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
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
                <p className="text-[var(--primary-text)]">{user.email}</p>
              </div>
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--success-green)]/20">
                  <Phone size={18} className="text-[var(--success-green)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Phone</p>
                  <p className="text-[var(--primary-text)]">{user.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user.rating !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--elevated-surface)] rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star size={20} className="text-[var(--sakay-yellow)] fill-[var(--sakay-yellow)]" />
                <span className="text-2xl font-bold text-[var(--primary-text)]">{user.rating}</span>
              </div>
              <p className="text-xs text-[var(--tertiary-text)]">Rating</p>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--elevated-surface)] rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bike size={20} className="text-[var(--info-blue)]" />
              <span className="text-2xl font-bold text-[var(--primary-text)]">{user.totalRides || 0}</span>
            </div>
            <p className="text-xs text-[var(--tertiary-text)]">Total Rides</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--elevated-surface)] rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar size={20} className="text-[var(--warning-orange)]" />
            </div>
            <p className="text-xs text-[var(--tertiary-text)]">Joined</p>
            <p className="text-sm text-[var(--primary-text)]">{formatDate(user.createdAt)}</p>
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
            router.push(`/users/${user.id}`);
          }}
          className="w-full py-3 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-xl hover:bg-[var(--bright-yellow)] transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <ExternalLink size={18} />
          View Full Profile
        </motion.button>
      </div>
    </Modal>
  );
}
