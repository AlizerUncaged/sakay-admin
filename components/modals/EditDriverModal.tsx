'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User as UserIcon, Mail, Phone, AlertCircle, Bike, Palette, Hash, DollarSign, Calendar } from 'lucide-react';
import { Modal } from '../common/Modal';
import { api, Driver } from '@/lib/api';
import { useToast } from '../common/Toast';

interface EditDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  onSuccess?: () => void;
}

export function EditDriverModal({ isOpen, onClose, driver, onSuccess }: EditDriverModalProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'vehicle'>('personal');

  // Personal info form
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  // Vehicle info form
  const [vehicleData, setVehicleData] = useState({
    maker: '',
    model: '',
    color: '',
    plateNumber: '',
    manufacturedYear: '',
    pricePerKm: '',
    status: '',
  });

  // Reset form when driver changes or modal opens
  useEffect(() => {
    if (driver && isOpen) {
      setPersonalData({
        firstName: driver.firstName || '',
        lastName: driver.lastName || '',
        email: driver.email || '',
        phoneNumber: driver.phoneNumber || '',
      });
      setVehicleData({
        maker: driver.vehicle?.maker || '',
        model: driver.vehicle?.model || '',
        color: driver.vehicle?.color || '',
        plateNumber: driver.vehicle?.plateNumber || '',
        manufacturedYear: driver.vehicle?.manufacturedYear || '',
        pricePerKm: driver.vehicle?.pricePerKm?.toString() || '',
        status: driver.vehicle?.status || '',
      });
      setError(null);
      setActiveTab('personal');
    }
  }, [driver, isOpen]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validatePersonal = () => {
    if (!personalData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!personalData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!personalData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;

    setLoading(true);
    setError(null);

    try {
      let hasChanges = false;

      // Update personal info if changed
      if (activeTab === 'personal') {
        if (!validatePersonal()) {
          setLoading(false);
          return;
        }

        const personalUpdates: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } = {};
        if (personalData.firstName !== driver.firstName) personalUpdates.firstName = personalData.firstName;
        if (personalData.lastName !== driver.lastName) personalUpdates.lastName = personalData.lastName;
        if (personalData.email !== driver.email) personalUpdates.email = personalData.email;
        if (personalData.phoneNumber !== (driver.phoneNumber || '')) personalUpdates.phoneNumber = personalData.phoneNumber;

        if (Object.keys(personalUpdates).length > 0) {
          const response = await api.updateUser(driver.id, personalUpdates);
          if (!response.success) {
            setError(response.errors?.[0] || 'Failed to update personal info');
            setLoading(false);
            return;
          }
          hasChanges = true;
        }
      }

      // Update vehicle info if changed
      if (activeTab === 'vehicle' && driver.vehicle) {
        const vehicleUpdates: {
          maker?: string;
          model?: string;
          color?: string;
          plateNumber?: string;
          manufacturedYear?: string;
          pricePerKm?: number;
          status?: string;
        } = {};

        if (vehicleData.maker !== driver.vehicle.maker) vehicleUpdates.maker = vehicleData.maker;
        if (vehicleData.model !== driver.vehicle.model) vehicleUpdates.model = vehicleData.model;
        if (vehicleData.color !== driver.vehicle.color) vehicleUpdates.color = vehicleData.color;
        if (vehicleData.plateNumber !== driver.vehicle.plateNumber) vehicleUpdates.plateNumber = vehicleData.plateNumber;
        if (vehicleData.manufacturedYear !== driver.vehicle.manufacturedYear) vehicleUpdates.manufacturedYear = vehicleData.manufacturedYear;
        if (vehicleData.pricePerKm && parseFloat(vehicleData.pricePerKm) !== driver.vehicle.pricePerKm) {
          vehicleUpdates.pricePerKm = parseFloat(vehicleData.pricePerKm);
        }
        if (vehicleData.status !== driver.vehicle.status) vehicleUpdates.status = vehicleData.status;

        if (Object.keys(vehicleUpdates).length > 0) {
          const response = await api.updateDriverVehicle(driver.id, vehicleUpdates);
          if (!response.success) {
            setError(response.errors?.[0] || 'Failed to update vehicle info');
            setLoading(false);
            return;
          }
          hasChanges = true;
        }
      }

      if (hasChanges) {
        showSuccess(`${activeTab === 'personal' ? 'Personal info' : 'Vehicle info'} updated successfully`);
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

  if (!driver) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Driver" size="lg">
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

        {/* Driver Preview */}
        <div className="flex items-center gap-4 p-4 bg-[var(--elevated-surface)] rounded-xl">
          <div className="w-14 h-14 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold text-xl">
            {personalData.firstName?.charAt(0) || driver.firstName?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-[var(--primary-text)]">
              {personalData.firstName} {personalData.lastName}
            </p>
            <p className="text-sm text-[var(--tertiary-text)]">Rider</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-[var(--elevated-surface)] rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'personal'
                ? 'bg-[var(--sakay-yellow)] text-[var(--dark-background)]'
                : 'text-[var(--secondary-text)] hover:text-[var(--primary-text)]'
            }`}
          >
            Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vehicle')}
            disabled={!driver.vehicle}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              activeTab === 'vehicle'
                ? 'bg-[var(--sakay-yellow)] text-[var(--dark-background)]'
                : 'text-[var(--secondary-text)] hover:text-[var(--primary-text)]'
            }`}
          >
            Vehicle Info
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--secondary-text)]">First Name</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                    <input
                      type="text"
                      name="firstName"
                      value={personalData.firstName}
                      onChange={handlePersonalChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--secondary-text)]">Last Name</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                    <input
                      type="text"
                      name="lastName"
                      value={personalData.lastName}
                      onChange={handlePersonalChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--secondary-text)]">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                  <input
                    type="email"
                    name="email"
                    value={personalData.email}
                    onChange={handlePersonalChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--secondary-text)]">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={personalData.phoneNumber}
                    onChange={handlePersonalChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Info Tab */}
          {activeTab === 'vehicle' && driver.vehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--secondary-text)]">Maker</label>
                  <div className="relative">
                    <Bike size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                    <input
                      type="text"
                      name="maker"
                      value={vehicleData.maker}
                      onChange={handleVehicleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--secondary-text)]">Model</label>
                  <div className="relative">
                    <Bike size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                    <input
                      type="text"
                      name="model"
                      value={vehicleData.model}
                      onChange={handleVehicleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--secondary-text)]">Plate Number</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                    <input
                      type="text"
                      name="plateNumber"
                      value={vehicleData.plateNumber}
                      onChange={handleVehicleChange}
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
                      value={vehicleData.color}
                      onChange={handleVehicleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--secondary-text)]">Year</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
                    <input
                      type="text"
                      name="manufacturedYear"
                      value={vehicleData.manufacturedYear}
                      onChange={handleVehicleChange}
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
                      value={vehicleData.pricePerKm}
                      onChange={handleVehicleChange}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--secondary-text)]">Status</label>
                  <select
                    name="status"
                    value={vehicleData.status}
                    onChange={handleVehicleChange}
                    className="w-full px-4 py-2.5 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* No vehicle message */}
          {activeTab === 'vehicle' && !driver.vehicle && (
            <div className="text-center py-8 bg-[var(--elevated-surface)] rounded-xl">
              <Bike size={32} className="mx-auto mb-2 text-[var(--tertiary-text)]" />
              <p className="text-[var(--tertiary-text)]">No vehicle registered for this driver</p>
            </div>
          )}

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
              disabled={loading || (activeTab === 'vehicle' && !driver.vehicle)}
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
