'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Car, Hash, Palette, Calendar, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { api, AdminVehicle } from '@/lib/api';
import { useToast } from '../common/Toast';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: AdminVehicle | null;
  onSuccess?: () => void;
}

export function EditVehicleModal({ isOpen, onClose, vehicle, onSuccess }: EditVehicleModalProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    maker: '',
    model: '',
    color: '',
    plateNumber: '',
    manufacturedYear: '',
    pricePerKm: '',
    pricePerHour: '',
    status: '',
    isActive: true,
    isVerified: false,
  });

  // Reset form when vehicle changes or modal opens
  useEffect(() => {
    if (vehicle && isOpen) {
      setFormData({
        maker: vehicle.maker || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        plateNumber: vehicle.plateNumber || '',
        manufacturedYear: vehicle.manufacturedYear || '',
        pricePerKm: vehicle.pricePerKm?.toString() || '',
        pricePerHour: vehicle.pricePerHour?.toString() || '',
        status: vehicle.status || 'Pending',
        isActive: vehicle.isActive,
        isVerified: vehicle.isVerified,
      });
      setError(null);
    }
  }, [vehicle, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const validate = () => {
    if (!formData.maker.trim()) {
      setError('Maker is required');
      return false;
    }
    if (!formData.model.trim()) {
      setError('Model is required');
      return false;
    }
    if (!formData.plateNumber.trim()) {
      setError('Plate number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const updates: {
        maker?: string;
        model?: string;
        color?: string;
        plateNumber?: string;
        manufacturedYear?: string;
        pricePerKm?: number;
        pricePerHour?: number;
        status?: string;
        isActive?: boolean;
        isVerified?: boolean;
      } = {};

      if (formData.maker !== vehicle.maker) updates.maker = formData.maker;
      if (formData.model !== vehicle.model) updates.model = formData.model;
      if (formData.color !== vehicle.color) updates.color = formData.color;
      if (formData.plateNumber !== vehicle.plateNumber) updates.plateNumber = formData.plateNumber;
      if (formData.manufacturedYear !== vehicle.manufacturedYear) updates.manufacturedYear = formData.manufacturedYear;
      if (formData.pricePerKm && parseFloat(formData.pricePerKm) !== vehicle.pricePerKm) {
        updates.pricePerKm = parseFloat(formData.pricePerKm);
      }
      if (formData.pricePerHour && parseFloat(formData.pricePerHour) !== vehicle.pricePerHour) {
        updates.pricePerHour = parseFloat(formData.pricePerHour);
      }
      if (formData.status !== vehicle.status) updates.status = formData.status;
      if (formData.isActive !== vehicle.isActive) updates.isActive = formData.isActive;
      if (formData.isVerified !== vehicle.isVerified) updates.isVerified = formData.isVerified;

      if (Object.keys(updates).length > 0) {
        const response = await api.updateVehicle(vehicle.id, updates);
        if (!response.success) {
          setError(response.errors?.[0] || 'Failed to update vehicle');
          setLoading(false);
          return;
        }
        showSuccess('Vehicle updated successfully');
        onSuccess?.();
        onClose();
      } else {
        showSuccess('No changes to save');
        onClose();
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      const errorMessage = error.errors?.[0] || 'An error occurred';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Vehicle" size="lg">
      <div className="space-y-6">
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

        {/* Vehicle Preview */}
        <div className="flex items-center gap-4 p-4 bg-[var(--elevated-surface)] rounded-xl">
          <div className="w-14 h-14 rounded-full bg-[var(--sakay-yellow)]/20 flex items-center justify-center">
            <Car size={28} className="text-[var(--sakay-yellow)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--primary-text)]">
              {formData.maker} {formData.model}
            </p>
            <p className="text-sm text-[var(--tertiary-text)] font-mono">{formData.plateNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Make & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--secondary-text)]">Maker</label>
              <div className="relative">
                <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                <input
                  type="text"
                  name="maker"
                  value={formData.maker}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--secondary-text)]">Model</label>
              <div className="relative">
                <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                />
              </div>
            </div>
          </div>

          {/* Plate & Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--secondary-text)]">Plate Number</label>
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--secondary-text)]">Color</label>
              <div className="relative">
                <Palette size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                />
              </div>
            </div>
          </div>

          {/* Year & Prices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--secondary-text)]">Year</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                <input
                  type="text"
                  name="manufacturedYear"
                  value={formData.manufacturedYear}
                  onChange={handleChange}
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--secondary-text)]">Price per KM</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                <input
                  type="number"
                  name="pricePerKm"
                  value={formData.pricePerKm}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--secondary-text)]">Price per Hour</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--secondary-text)]">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[var(--elevated-surface)] rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[var(--border-color)] accent-[var(--sakay-yellow)]"
              />
              <div className="flex items-center gap-2">
                {formData.isVerified ? (
                  <CheckCircle size={18} className="text-[var(--success-green)]" />
                ) : (
                  <XCircle size={18} className="text-[var(--error-red)]" />
                )}
                <span className="text-sm text-[var(--primary-text)]">Verified</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[var(--border-color)] accent-[var(--sakay-yellow)]"
              />
              <div className="flex items-center gap-2">
                {formData.isActive ? (
                  <CheckCircle size={18} className="text-[var(--success-green)]" />
                ) : (
                  <XCircle size={18} className="text-[var(--tertiary-text)]" />
                )}
                <span className="text-sm text-[var(--primary-text)]">Active</span>
              </div>
            </label>
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
      </div>
    </Modal>
  );
}
