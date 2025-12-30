'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, User, Bike, Clock, DollarSign, Route, Calendar, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '../common/Modal';
import { Booking } from '@/lib/api';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function BookingDetailModal({ isOpen, onClose, booking }: BookingDetailModalProps) {
  const router = useRouter();

  if (!booking) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Booking #${booking.id}`} size="lg">
      <div className="space-y-6">
        {/* Status and Type Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              booking.bookingType === 'Ride'
                ? 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]'
                : 'bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]'
            }`}>
              {booking.bookingType}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--sakay-yellow)]">
              ₱{(booking.finalFare || booking.estimatedFare || 0).toLocaleString()}
            </p>
            <p className="text-xs text-[var(--tertiary-text)]">
              {booking.finalFare ? 'Final Fare' : 'Estimated Fare'}
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="bg-[var(--elevated-surface)] rounded-xl p-4">
          <h4 className="text-sm font-medium text-[var(--tertiary-text)] uppercase tracking-wide mb-4">Route</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-[var(--success-green)] mt-1.5" />
              <div>
                <p className="text-xs text-[var(--tertiary-text)]">Pickup</p>
                <p className="text-[var(--primary-text)]">{booking.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-[var(--error-red)] mt-1.5" />
              <div>
                <p className="text-xs text-[var(--tertiary-text)]">Dropoff</p>
                <p className="text-[var(--primary-text)]">{booking.dropoffLocation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-[var(--elevated-surface)] rounded-xl p-4 ${booking.customer?.id ? 'cursor-pointer hover:bg-[var(--input-background)] transition-colors' : ''}`}
            onClick={() => {
              if (booking.customer?.id) {
                onClose();
                router.push(`/users/${booking.customer.id}`);
              }
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[var(--tertiary-text)] uppercase tracking-wide">Customer</h4>
              {booking.customer?.id && (
                <ExternalLink size={14} className="text-[var(--tertiary-text)]" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {booking.customer?.profileImageUrl ? (
                  <Image
                    src={booking.customer.profileImageUrl.startsWith('http') ? booking.customer.profileImageUrl : `https://sakay.to${booking.customer.profileImageUrl}`}
                    alt={`${booking.customer.firstName} ${booking.customer.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[var(--info-blue)] flex items-center justify-center text-white font-bold">
                    {booking.customer?.firstName?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[var(--primary-text)] font-medium">
                  {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'Unknown'}
                </p>
                <p className="text-sm text-[var(--tertiary-text)]">{booking.customer?.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Driver */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-[var(--elevated-surface)] rounded-xl p-4 ${booking.rider?.id ? 'cursor-pointer hover:bg-[var(--input-background)] transition-colors' : ''}`}
            onClick={() => {
              if (booking.rider?.id) {
                onClose();
                router.push(`/drivers/${booking.rider.id}`);
              }
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[var(--tertiary-text)] uppercase tracking-wide">Driver</h4>
              {booking.rider?.id && (
                <ExternalLink size={14} className="text-[var(--tertiary-text)]" />
              )}
            </div>
            {booking.rider ? (
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {booking.rider.profileImageUrl ? (
                    <Image
                      src={booking.rider.profileImageUrl.startsWith('http') ? booking.rider.profileImageUrl : `https://sakay.to${booking.rider.profileImageUrl}`}
                      alt={`${booking.rider.firstName} ${booking.rider.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold">
                      {booking.rider.firstName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[var(--primary-text)] font-medium">
                    {booking.rider.firstName} {booking.rider.lastName}
                  </p>
                  <p className="text-sm text-[var(--tertiary-text)]">{booking.rider.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-[var(--tertiary-text)]">Not assigned</p>
            )}
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {booking.estimatedDistance && (
            <div className="bg-[var(--elevated-surface)] rounded-xl p-4 text-center">
              <Route size={20} className="text-[var(--info-blue)] mx-auto mb-2" />
              <p className="text-lg font-bold text-[var(--primary-text)]">{booking.estimatedDistance} km</p>
              <p className="text-xs text-[var(--tertiary-text)]">Distance</p>
            </div>
          )}
          {booking.estimatedDuration && (
            <div className="bg-[var(--elevated-surface)] rounded-xl p-4 text-center">
              <Clock size={20} className="text-[var(--warning-orange)] mx-auto mb-2" />
              <p className="text-lg font-bold text-[var(--primary-text)]">{booking.estimatedDuration} min</p>
              <p className="text-xs text-[var(--tertiary-text)]">Duration</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-[var(--elevated-surface)] rounded-xl p-4">
          <h4 className="text-sm font-medium text-[var(--tertiary-text)] uppercase tracking-wide mb-4">Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-[var(--tertiary-text)]" />
              <span className="text-sm text-[var(--tertiary-text)]">Requested:</span>
              <span className="text-sm text-[var(--primary-text)]">{formatDate(booking.requestedAt)}</span>
            </div>
            {booking.acceptedAt && (
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--success-green)]" />
                <span className="text-sm text-[var(--tertiary-text)]">Accepted:</span>
                <span className="text-sm text-[var(--primary-text)]">{formatDate(booking.acceptedAt)}</span>
              </div>
            )}
            {booking.completedAt && (
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--success-green)]" />
                <span className="text-sm text-[var(--tertiary-text)]">Completed:</span>
                <span className="text-sm text-[var(--primary-text)]">{formatDate(booking.completedAt)}</span>
              </div>
            )}
            {booking.cancelledAt && (
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--error-red)]" />
                <span className="text-sm text-[var(--tertiary-text)]">Cancelled:</span>
                <span className="text-sm text-[var(--primary-text)]">{formatDate(booking.cancelledAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
