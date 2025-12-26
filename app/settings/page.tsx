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

  const handleSave = async () => {
    if (changedKeys.size === 0) return;

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
          disabled={saving || changedKeys.size === 0}
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
              className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
          </div>
        </div>
      </motion.div>

      {/* Pricing Settings */}
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
          <h2 className="text-lg font-semibold text-[var(--primary-text)]">Pricing Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
              Currency
            </label>
            <select
              value={getValue('currency', 'PHP')}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            >
              <option value="PHP">PHP - Philippine Peso</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
              Base Price
            </label>
            <input
              type="number"
              value={getValue('base_price', '50')}
              onChange={(e) => handleChange('base_price', e.target.value)}
              className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
              Price per KM
            </label>
            <input
              type="number"
              value={getValue('price_per_km', '15')}
              onChange={(e) => handleChange('price_per_km', e.target.value)}
              className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
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
