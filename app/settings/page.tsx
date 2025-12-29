'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Shield, Globe, DollarSign, Loader2, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { api, AppSettings } from '@/lib/api';

interface SettingsMap {
  [key: string]: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [originalSettings, setOriginalSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Numeric setting keys that need validation
  const numericKeys = [
    'ride_baseFare', 'ride_perKm', 'ride_minFare',
    'delivery_baseFare', 'delivery_perKm', 'delivery_minFare',
    'cargo_baseFare', 'cargo_perKm', 'cargo_minFare',
    'express_baseFare', 'express_perKm', 'express_minFare',
  ];

  const validateValue = (key: string, value: string): string | null => {
    if (numericKeys.includes(key)) {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return 'Must be a valid number';
      }
      if (num < 0) {
        return 'Must be a positive number';
      }
      if (num === 0) {
        return 'Cannot be zero';
      }
    }
    if (key === 'support_email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email format';
      }
    }
    return null;
  };

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getSettings();
      if (response.success && response.data) {
        const settingsMap: SettingsMap = {};
        response.data.forEach((setting) => {
          settingsMap[setting.key] = setting.value;
        });
        setSettings(settingsMap);
        setOriginalSettings(settingsMap);
        setChangedKeys(new Set());
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Validate the value
    const validationError = validateValue(key, value);
    setValidationErrors((prev) => {
      const next = { ...prev };
      if (validationError) {
        next[key] = validationError;
      } else {
        delete next[key];
      }
      return next;
    });

    // Track which settings have changed
    if (value !== originalSettings[key]) {
      setChangedKeys((prev) => new Set([...prev, key]));
    } else {
      setChangedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const handleSave = async () => {
    if (changedKeys.size === 0 || hasValidationErrors) return;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Save all changed settings
      const promises = Array.from(changedKeys).map((key) =>
        api.updateSetting(key, settings[key])
      );
      await Promise.all(promises);

      setOriginalSettings({ ...settings });
      setChangedKeys(new Set());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getValue = (key: string, defaultValue = '') => settings[key] ?? defaultValue;
  const getBoolValue = (key: string, defaultValue = false) =>
    settings[key] === 'true' || (settings[key] === undefined && defaultValue);
  const getError = (key: string) => validationErrors[key];

  // Render a validated numeric input with error message
  const renderFareInput = (key: string, label: string, defaultValue: string) => (
    <div>
      <label className="block text-xs font-medium text-[var(--tertiary-text)] mb-1">{label}</label>
      <input
        type="number"
        value={getValue(key, defaultValue)}
        onChange={(e) => handleChange(key, e.target.value)}
        className={`w-full px-3 py-2 bg-[var(--input-background)] border rounded-lg text-[var(--primary-text)] focus:outline-none text-sm ${
          getError(key)
            ? 'border-[var(--error-red)] focus:border-[var(--error-red)]'
            : 'border-[var(--border-color)] focus:border-[var(--sakay-yellow)]'
        }`}
      />
      {getError(key) && (
        <p className="text-xs text-[var(--error-red)] mt-1">{getError(key)}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
      </div>
    );
  }

  if (error && Object.keys(settings).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--error-red)]/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-[var(--error-red)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">Failed to load settings</h2>
        <p className="text-[var(--tertiary-text)]">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl"
        >
          <RefreshCw size={18} />
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Settings</h1>
          <p className="text-[var(--tertiary-text)]">Manage application settings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving || changedKeys.size === 0 || hasValidationErrors}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl hover:bg-[var(--bright-yellow)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check size={18} />
              Saved!
            </>
          ) : hasValidationErrors ? (
            <>
              <AlertCircle size={18} />
              Fix Errors
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes {changedKeys.size > 0 && `(${changedKeys.size})`}
            </>
          )}
        </motion.button>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--error-red)]/10 border border-[var(--error-red)]/30 text-[var(--error-red)] px-4 py-3 rounded-xl text-sm flex items-center gap-2"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[var(--info-blue)]/20">
            <Globe size={20} className="text-[var(--info-blue)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--primary-text)]">General Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={getValue('site_name', 'Sakay')}
              onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={getValue('support_email', 'support@sakay.com')}
              onChange={(e) => handleChange('support_email', e.target.value)}
              className={`w-full px-4 py-3 bg-[var(--input-background)] border rounded-xl text-[var(--primary-text)] focus:outline-none ${
                getError('support_email')
                  ? 'border-[var(--error-red)] focus:border-[var(--error-red)]'
                  : 'border-[var(--border-color)] focus:border-[var(--sakay-yellow)]'
              }`}
            />
            {getError('support_email') && (
              <p className="text-xs text-[var(--error-red)] mt-1">{getError('support_email')}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fare Rates by Service Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[var(--sakay-yellow)]/20">
            <DollarSign size={20} className="text-[var(--sakay-yellow)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--primary-text)]">Fare Rates</h2>
          <span className="text-xs px-2 py-1 bg-[var(--info-blue)]/20 text-[var(--info-blue)] rounded-full">
            Used by mobile apps
          </span>
        </div>

        {/* Ride Service */}
        <div className="mb-6 p-4 bg-[var(--elevated-surface)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--sakay-yellow)] mb-4">🏍️ Ride Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFareInput('ride_baseFare', 'Base Fare (₱)', '40')}
            {renderFareInput('ride_perKm', 'Per KM (₱)', '12')}
            {renderFareInput('ride_minFare', 'Min Fare (₱)', '50')}
          </div>
        </div>

        {/* Delivery Service */}
        <div className="mb-6 p-4 bg-[var(--elevated-surface)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--info-blue)] mb-4">📦 Delivery Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFareInput('delivery_baseFare', 'Base Fare (₱)', '45')}
            {renderFareInput('delivery_perKm', 'Per KM (₱)', '15')}
            {renderFareInput('delivery_minFare', 'Min Fare (₱)', '60')}
          </div>
        </div>

        {/* Cargo Service */}
        <div className="mb-6 p-4 bg-[var(--elevated-surface)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--success-green)] mb-4">🚚 Cargo Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFareInput('cargo_baseFare', 'Base Fare (₱)', '80')}
            {renderFareInput('cargo_perKm', 'Per KM (₱)', '20')}
            {renderFareInput('cargo_minFare', 'Min Fare (₱)', '100')}
          </div>
        </div>

        {/* Express Service */}
        <div className="p-4 bg-[var(--elevated-surface)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--warning-orange)] mb-4">⚡ Express Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFareInput('express_baseFare', 'Base Fare (₱)', '60')}
            {renderFareInput('express_perKm', 'Per KM (₱)', '18')}
            {renderFareInput('express_minFare', 'Min Fare (₱)', '80')}
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[var(--success-green)]/20">
            <Bell size={20} className="text-[var(--success-green)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--primary-text)]">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--elevated-surface)] rounded-xl">
            <div>
              <p className="text-[var(--primary-text)] font-medium">Push Notifications</p>
              <p className="text-sm text-[var(--tertiary-text)]">Send push notifications to users</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChange('enable_notifications', getBoolValue('enable_notifications', true) ? 'false' : 'true')}
              className={`w-12 h-6 rounded-full transition-colors ${
                getBoolValue('enable_notifications', true) ? 'bg-[var(--success-green)]' : 'bg-[var(--border-color)]'
              }`}
            >
              <motion.div
                animate={{ x: getBoolValue('enable_notifications', true) ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white"
              />
            </motion.button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[var(--elevated-surface)] rounded-xl">
            <div>
              <p className="text-[var(--primary-text)] font-medium">SMS Notifications</p>
              <p className="text-sm text-[var(--tertiary-text)]">Send SMS for important updates</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChange('enable_sms', getBoolValue('enable_sms', true) ? 'false' : 'true')}
              className={`w-12 h-6 rounded-full transition-colors ${
                getBoolValue('enable_sms', true) ? 'bg-[var(--success-green)]' : 'bg-[var(--border-color)]'
              }`}
            >
              <motion.div
                animate={{ x: getBoolValue('enable_sms', true) ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white"
              />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* System Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[var(--error-red)]/20">
            <Shield size={20} className="text-[var(--error-red)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--primary-text)]">System</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-[var(--elevated-surface)] rounded-xl border border-[var(--error-red)]/30">
          <div>
            <p className="text-[var(--primary-text)] font-medium">Maintenance Mode</p>
            <p className="text-sm text-[var(--tertiary-text)]">Disable access to the platform temporarily</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChange('maintenance_mode', getBoolValue('maintenance_mode', false) ? 'false' : 'true')}
            className={`w-12 h-6 rounded-full transition-colors ${
              getBoolValue('maintenance_mode', false) ? 'bg-[var(--error-red)]' : 'bg-[var(--border-color)]'
            }`}
          >
            <motion.div
              animate={{ x: getBoolValue('maintenance_mode', false) ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-5 h-5 rounded-full bg-white"
            />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
