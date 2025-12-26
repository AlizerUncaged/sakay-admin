'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bike, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.login(email, password);

      if (response.success && response.data) {
        // Check if user is admin
        if (response.data.user.userType !== 'Admin') {
          setError('Access denied. Admin privileges required.');
          api.logout();
          return;
        }
        router.push('/');
      } else {
        setError(response.errors?.[0] || 'Invalid credentials');
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--dark-background)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-16 h-16 rounded-2xl bg-[var(--sakay-yellow)] flex items-center justify-center mb-4"
          >
            <Bike size={40} className="text-[var(--dark-background)]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[var(--primary-text)]">Sakay Admin</h1>
          <p className="text-[var(--tertiary-text)] mt-1">Sign in to your account</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[var(--error-red)]/10 border border-[var(--error-red)]/30 text-[var(--error-red)] px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)] transition-colors"
                placeholder="admin@sakay.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)] transition-colors pr-12"
                  placeholder="Enter your password"
                  required
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)] hover:text-[var(--primary-text)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl hover:bg-[var(--bright-yellow)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[var(--tertiary-text)] text-sm mt-6"
          >
            Only admin accounts can access this dashboard
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
