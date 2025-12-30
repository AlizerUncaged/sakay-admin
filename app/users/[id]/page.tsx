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
  Pencil,
  Camera,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { api, User, Booking } from '@/lib/api';
import { useToast } from '@/components/common/Toast';
import { EditUserModal } from '@/components/modals';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Image must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file');
      return;
    }

    setUploadingPicture(true);
    try {
      // Upload the file
      const uploadResponse = await api.uploadProfilePicture(file);
      if (uploadResponse.success && uploadResponse.data?.fileUrl) {
        // Update user profile with new image URL
        await api.updateUser(user.id, { profileImageUrl: uploadResponse.data.fileUrl });
        setUser({ ...user, profileImageUrl: uploadResponse.data.fileUrl });
        showSuccess('Profile picture updated successfully');
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      showError(error.errors?.[0] || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userResponse, bookingsResponse] = await Promise.all([
        api.getUser(userId),
        api.getBookings(1, 10, { search: userId }),
      ]);

      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      } else {
        setError('User not found');
      }

      if (bookingsResponse.success && bookingsResponse.data) {
        // Filter bookings for this user
        setBookings(bookingsResponse.data.filter(
          b => b.customerId === userId || b.riderId === userId
        ));
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await api.updateUserStatus(user.id, !user.isActive);
      setUser({ ...user, isActive: !user.isActive });
      showSuccess(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch {
      showError('Failed to update user status');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--error-red)]/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-[var(--error-red)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">{error || 'User not found'}</h2>
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
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">User Profile</h1>
          <p className="text-[var(--tertiary-text)]">View and manage user details</p>
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
            {/* Avatar with Upload */}
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `https://sakay.to${user.profileImageUrl}`}
                  alt={`${user.firstName} ${user.lastName}`}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-4xl font-bold text-[var(--dark-background)]">
                  {user.firstName?.charAt(0) || '?'}
                </div>
              )}
              {/* Upload Overlay */}
              <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={uploadingPicture}
                />
                {uploadingPicture ? (
                  <Loader2 size={24} className="text-white animate-spin" />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
              </label>
            </div>

            {/* Name & Verification */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[var(--primary-text)]">
                {user.firstName} {user.lastName}
              </h2>
              {user.isVerified ? (
                <CheckCircle size={18} className="text-[var(--success-green)]" />
              ) : (
                <XCircle size={18} className="text-[var(--error-red)]" />
              )}
            </div>

            {/* Type Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
              user.userType === 'Rider'
                ? 'bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]'
                : user.userType === 'Admin'
                ? 'bg-[var(--error-red)]/20 text-[var(--error-red)]'
                : 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]'
            }`}>
              {user.userType}
            </span>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-[var(--success-green)] animate-pulse' : 'bg-[var(--tertiary-text)]'}`} />
              <span className={`text-sm font-medium ${user.isActive ? 'text-[var(--success-green)]' : 'text-[var(--tertiary-text)]'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Edit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors bg-[var(--sakay-yellow)] text-[var(--dark-background)] hover:bg-[var(--bright-yellow)]"
              >
                <Pencil size={18} />
                Edit User
              </motion.button>

              {/* Toggle Status Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleStatus}
                disabled={updating}
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  user.isActive
                    ? 'bg-[var(--error-red)]/20 text-[var(--error-red)] hover:bg-[var(--error-red)]/30'
                    : 'bg-[var(--success-green)]/20 text-[var(--success-green)] hover:bg-[var(--success-green)]/30'
                }`}
              >
                {updating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : user.isActive ? (
                  <>
                    <UserX size={18} />
                    Deactivate User
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    Activate User
                  </>
                )}
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
                  <p className="text-[var(--primary-text)] font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--elevated-surface)] rounded-xl">
                <Phone size={18} className="text-[var(--tertiary-text)]" />
                <div>
                  <p className="text-xs text-[var(--tertiary-text)]">Phone</p>
                  <p className="text-[var(--primary-text)] font-medium">{user.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
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
                <p className="text-2xl font-bold text-[var(--primary-text)]">{user.rating || 'N/A'}</p>
                <p className="text-xs text-[var(--tertiary-text)]">Rating</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-center p-4 bg-[var(--elevated-surface)] rounded-xl"
              >
                <Bike size={24} className="mx-auto mb-2 text-[var(--info-blue)]" />
                <p className="text-2xl font-bold text-[var(--primary-text)]">{user.totalRides || 0}</p>
                <p className="text-xs text-[var(--tertiary-text)]">Total Rides</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-center p-4 bg-[var(--elevated-surface)] rounded-xl"
              >
                <Shield size={24} className="mx-auto mb-2 text-[var(--success-green)]" />
                <p className="text-2xl font-bold text-[var(--primary-text)]">{user.isVerified ? 'Yes' : 'No'}</p>
                <p className="text-xs text-[var(--tertiary-text)]">Verified</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-center p-4 bg-[var(--elevated-surface)] rounded-xl"
              >
                <Calendar size={24} className="mx-auto mb-2 text-[var(--tertiary-text)]" />
                <p className="text-sm font-bold text-[var(--primary-text)]">{formatDate(user.createdAt)}</p>
                <p className="text-xs text-[var(--tertiary-text)]">Member Since</p>
              </motion.div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-[var(--sakay-yellow)]" />
              Recent Bookings
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
                        {formatDate(booking.requestedAt)}
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
                No bookings found
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={fetchData}
      />
    </div>
  );
}
