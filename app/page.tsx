'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Bike,
  CalendarCheck,
  DollarSign,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api, DashboardStats, Booking } from '@/lib/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  delay?: number;
}

function StatCard({ title, value, icon, trend, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-[var(--sakay-yellow)] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--tertiary-text)] text-sm mb-1">{title}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
            className="text-3xl font-bold text-[var(--primary-text)]"
          >
            {value}
          </motion.p>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.3 }}
              className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-[var(--success-green)]' : 'text-[var(--error-red)]'}`}
            >
              {trend.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-[var(--tertiary-text)]">vs last month</span>
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: delay + 0.1 }}
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-[var(--elevated-surface)] rounded w-24 mb-2" />
            <div className="h-8 bg-[var(--elevated-surface)] rounded w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-[var(--elevated-surface)] rounded w-24 mb-2" />
            <div className="h-8 bg-[var(--elevated-surface)] rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResponse, bookingsResponse] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentBookings(5),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      if (bookingsResponse.success && bookingsResponse.data) {
        setRecentBookings(bookingsResponse.data);
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[var(--success-green)]/20 text-[var(--success-green)]';
      case 'InProgress':
        return 'bg-[var(--info-blue)]/20 text-[var(--info-blue)]';
      case 'Pending':
        return 'bg-[var(--warning-orange)]/20 text-[var(--warning-orange)]';
      case 'Cancelled':
        return 'bg-[var(--error-red)]/20 text-[var(--error-red)]';
      case 'Accepted':
        return 'bg-[var(--sakay-yellow)]/20 text-[var(--sakay-yellow)]';
      default:
        return 'bg-[var(--tertiary-text)]/20 text-[var(--tertiary-text)]';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-text)]">Dashboard</h1>
          <p className="text-[var(--tertiary-text)]">Loading dashboard data...</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--error-red)]/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-[var(--error-red)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">Failed to load dashboard</h2>
        <p className="text-[var(--tertiary-text)]">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl"
        >
          <RefreshCw size={18} />
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[var(--primary-text)]">Dashboard</h1>
        <p className="text-[var(--tertiary-text)]">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers.toLocaleString() || '0'}
          icon={<Users size={24} />}
          trend={stats ? { value: stats.userGrowth, isPositive: stats.userGrowth >= 0 } : undefined}
          color="var(--info-blue)"
          delay={0}
        />
        <StatCard
          title="Active Riders"
          value={stats?.totalRiders || 0}
          icon={<Bike size={24} />}
          color="var(--sakay-yellow)"
          delay={0.1}
        />
        <StatCard
          title="Bookings Today"
          value={stats?.bookingsToday || 0}
          icon={<CalendarCheck size={24} />}
          trend={stats ? { value: stats.bookingGrowth, isPositive: stats.bookingGrowth >= 0 } : undefined}
          color="var(--success-green)"
          delay={0.2}
        />
        <StatCard
          title="Revenue Today"
          value={`₱${(stats?.revenueToday || 0).toLocaleString()}`}
          icon={<DollarSign size={24} />}
          trend={stats ? { value: stats.revenueGrowth, isPositive: stats.revenueGrowth >= 0 } : undefined}
          color="var(--amber-gold)"
          delay={0.3}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Bookings"
          value={stats?.activeBookings || 0}
          icon={<CalendarCheck size={24} />}
          color="var(--warning-orange)"
          delay={0.4}
        />
        <StatCard
          title="Total Bookings"
          value={(stats?.totalBookings || 0).toLocaleString()}
          icon={<CalendarCheck size={24} />}
          color="var(--info-blue)"
          delay={0.5}
        />
        <StatCard
          title="Average Rating"
          value={stats?.averageRating || 0}
          icon={<Star size={24} />}
          color="var(--sakay-yellow)"
          delay={0.6}
        />
      </div>

      {/* Recent Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--primary-text)]">Recent Bookings</h2>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={fetchData}
            className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-[var(--tertiary-text)]" />
          </motion.button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--elevated-surface)]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Driver</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[var(--tertiary-text)]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="hover:bg-[var(--elevated-surface)] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[var(--primary-text)]">#{booking.id}</td>
                    <td className="px-6 py-4 text-sm text-[var(--primary-text)]">
                      {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--secondary-text)]">
                      {booking.rider ? `${booking.rider.firstName} ${booking.rider.lastName}` : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--primary-text)] font-medium">
                      {booking.finalFare || booking.estimatedFare ? `₱${(booking.finalFare || booking.estimatedFare || 0).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--tertiary-text)]">
                      {formatTimeAgo(booking.requestedAt)}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--tertiary-text)]">
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
