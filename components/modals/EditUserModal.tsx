'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User as UserIcon, Mail, Phone, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { api, User } from '@/lib/api';
import { useToast } from '../common/Toast';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

export function EditUserModal({ isOpen, onClose, user, onSuccess }: EditUserModalProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
      setError(null);
    }
  }, [user, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Only send changed fields
      const updates: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } = {};

      if (formData.firstName !== user.firstName) {
        updates.firstName = formData.firstName;
      }
      if (formData.lastName !== user.lastName) {
        updates.lastName = formData.lastName;
      }
      if (formData.email !== user.email) {
        updates.email = formData.email;
      }
      if (formData.phoneNumber !== (user.phoneNumber || '')) {
        updates.phoneNumber = formData.phoneNumber;
      }

      // Check if there are any changes
      if (Object.keys(updates).length === 0) {
        showSuccess('No changes to save');
        onClose();
        return;
      }

      const response = await api.updateUser(user.id, updates);

      if (response.success) {
        showSuccess('User updated successfully');
        onSuccess?.();
        onClose();
      } else {
        setError(response.errors?.[0] || 'Failed to update user');
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      const errorMessage = error.errors?.[0] || 'An error occurred while updating user';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-[var(--error-red)]/10 border border-[var(--error-red)]/30 rounded-xl"
          >
            <AlertCircle size={20} className="text-[var(--error-red)]" />
            <p className="text-sm text-[var(--error-red)]">{error}</p>
          </motion.div>
        )}

        {/* Profile Preview */}
        <div className="flex items-center gap-4 p-4 bg-[var(--elevated-surface)] rounded-xl">
          <div className="w-14 h-14 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold text-xl">
            {formData.firstName?.charAt(0) || user.firstName?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-[var(--primary-text)]">
              {formData.firstName} {formData.lastName}
            </p>
            <p className="text-sm text-[var(--tertiary-text)]">{user.userType}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--secondary-text)]">First Name</label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--secondary-text)]">Last Name</label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--secondary-text)]">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--secondary-text)]">Phone Number</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number (optional)"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-[var(--secondary-text)] hover:bg-[var(--elevated-surface)] rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl hover:bg-[var(--bright-yellow)] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
