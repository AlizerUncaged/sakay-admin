'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, MessageSquare, Trash2, Flag, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { api, Review } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/Toast';

export default function ReviewsPage() {
  const { showError, showSuccess } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search for server-side filtering
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getReviews(currentPage, 20, {
        rating: filterRating !== 'All' ? parseInt(filterRating) : undefined,
        search: debouncedSearch || undefined,
      });
      if (response.success && response.data) {
        setReviews(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterRating, debouncedSearch]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRating, debouncedSearch]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-[var(--sakay-yellow)] fill-[var(--sakay-yellow)]' : 'text-[var(--tertiary-text)]'}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showSuccess('Review deleted successfully');
    } catch (err) {
      showError('Failed to delete review');
    }
  };

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
        <h2 className="text-xl font-semibold text-[var(--primary-text)]">Failed to load reviews</h2>
        <p className="text-[var(--tertiary-text)]">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchReviews}
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
      >
        <h1 className="text-2xl font-bold text-[var(--primary-text)]">Reviews</h1>
        <p className="text-[var(--tertiary-text)]">Monitor and manage customer feedback</p>
      </motion.div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Rating Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-5xl font-bold text-[var(--sakay-yellow)] mb-2"
            >
              {averageRating}
            </motion.div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(Math.round(parseFloat(averageRating)))}
            </div>
            <p className="text-[var(--tertiary-text)]">Based on {reviews.length} reviews</p>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }, index) => (
              <motion.div
                key={rating}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center gap-1 w-16">
                  <span className="text-[var(--secondary-text)]">{rating}</span>
                  <Star size={14} className="text-[var(--sakay-yellow)] fill-[var(--sakay-yellow)]" />
                </div>
                <div className="flex-1 h-3 bg-[var(--elevated-surface)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="h-full bg-[var(--sakay-yellow)] rounded-full"
                  />
                </div>
                <span className="text-[var(--tertiary-text)] text-sm w-12 text-right">{count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)]" />
            <input
              type="text"
              placeholder="Search by customer, driver, or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] placeholder-[var(--placeholder-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
            />
            {searchQuery && loading && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--tertiary-text)]" />
            )}
          </div>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={fetchReviews}
            className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-[var(--tertiary-text)]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[var(--sakay-yellow)]" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 rounded-full bg-[var(--sakay-yellow)] flex items-center justify-center text-[var(--dark-background)] font-bold"
                      >
                        {review.customer?.firstName?.charAt(0) || '?'}
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--primary-text)] font-semibold">
                            {review.customer ? `${review.customer.firstName} ${review.customer.lastName}` : 'Anonymous'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--tertiary-text)]">
                          <span>
                            to {review.rider ? `${review.rider.firstName} ${review.rider.lastName}` : 'Unknown Driver'}
                          </span>
                          <span>|</span>
                          <span>Booking #{review.bookingId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-[var(--tertiary-text)] text-sm ml-2">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  {review.comment && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[var(--elevated-surface)] rounded-xl p-4 mb-4"
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare size={16} className="text-[var(--tertiary-text)] mt-0.5" />
                        <p className="text-[var(--secondary-text)]">{review.comment}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--info-blue)]/20 text-[var(--info-blue)]">
                      Rider Review
                    </span>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors text-[var(--tertiary-text)] hover:text-[var(--warning-orange)]"
                      >
                        <Flag size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors text-[var(--tertiary-text)] hover:text-[var(--error-red)]"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-[var(--tertiary-text)]">
                No reviews found
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-[var(--tertiary-text)]">
            Showing {reviews.length} of {totalItems} reviews
          </p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50"
            >
              Previous
            </motion.button>
            <span className="px-4 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] rounded-xl font-medium">
              {currentPage}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50"
            >
              Next
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
