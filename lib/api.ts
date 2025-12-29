const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sakay.to';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors: string[];
  warnings: string[];
  pagination?: PaginationInfo;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('admin_token', token);
      } else {
        localStorage.removeItem('admin_token');
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          errors: data.errors || ['An error occurred'],
        };
      }

      return data;
    } catch (error: unknown) {
      if ((error as { status?: number }).status) {
        throw error;
      }
      throw {
        status: 0,
        errors: ['Network error. Please check your connection.'],
      };
    }
  }

  // ============================================
  // Auth endpoints
  // ============================================
  async login(email: string, password: string) {
    const response = await this.request<{
      token: string;
      refreshToken: string;
      user: User;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getProfile() {
    return this.request<User>('/api/auth/profile');
  }

  // ============================================
  // Admin Dashboard endpoints (all use /api/admin/*)
  // ============================================
  async getDashboardStats() {
    return this.request<DashboardStats>('/api/admin/stats');
  }

  async getActionLogs(page = 1, pageSize = 20) {
    return this.request<AdminActionLog[]>(`/api/admin/action-logs?page=${page}&pageSize=${pageSize}`);
  }

  async getSettings() {
    return this.request<AppSettings[]>('/api/admin/settings');
  }

  async updateSetting(key: string, value: string, description?: string, category?: string) {
    // Auto-detect category for fare rate settings
    const fareRateKeys = ['ride_', 'delivery_', 'cargo_', 'express_'];
    const isFareRate = fareRateKeys.some(prefix => key.startsWith(prefix));
    const finalCategory = isFareRate ? 'FareRates' : (category || 'General');

    return this.request<AppSettings>(`/api/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description, category: finalCategory }),
    });
  }

  // ============================================
  // Admin Users endpoints (uses /api/admin/users)
  // ============================================
  async getUsers(page = 1, pageSize = 20, filters?: { userType?: string; search?: string; isActive?: boolean }) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (filters?.userType && filters.userType !== 'All') {
      params.append('userType', filters.userType);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    return this.request<User[]>(`/api/admin/users?${params.toString()}`);
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.request<User>(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async updateUser(userId: string, data: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string }) {
    return this.request<User>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUser(userId: string) {
    return this.request<User>(`/api/admin/users/${userId}`);
  }

  async getDriver(driverId: string) {
    // Get driver with vehicle info from dedicated endpoint
    return this.request<Driver>(`/api/admin/drivers/${driverId}`);
  }

  async updateDriverVehicle(driverId: string, data: {
    maker?: string;
    model?: string;
    color?: string;
    plateNumber?: string;
    manufacturedYear?: string;
    pricePerKm?: number;
    status?: string;
  }) {
    return this.request<Vehicle>(`/api/admin/drivers/${driverId}/vehicle`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async registerDriver(formData: FormData) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/drivers/register`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        errors: data.errors || ['Registration failed'],
      };
    }
    return data;
  }

  // ============================================
  // Admin Bookings endpoints (uses /api/admin/bookings)
  // ============================================
  async getBookings(page = 1, pageSize = 20, filters?: { status?: string; bookingType?: string; search?: string }) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (filters?.status && filters.status !== 'All') {
      params.append('status', filters.status);
    }
    if (filters?.bookingType && filters.bookingType !== 'All') {
      params.append('bookingType', filters.bookingType);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    return this.request<Booking[]>(`/api/admin/bookings?${params.toString()}`);
  }

  async getRecentBookings(limit = 5) {
    return this.request<Booking[]>(`/api/admin/bookings?page=1&pageSize=${limit}`);
  }

  // ============================================
  // Admin Reviews endpoints (uses /api/admin/reviews)
  // ============================================
  async getReviews(page = 1, pageSize = 20, filters?: { rating?: number; search?: string }) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (filters?.rating) {
      params.append('rating', filters.rating.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    return this.request<Review[]>(`/api/admin/reviews?${params.toString()}`);
  }

  async deleteReview(reviewId: number) {
    return this.request<boolean>(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Motorcycles/Drivers endpoints (public endpoints)
  // ============================================
  async getMotorcycles(page = 1, pageSize = 20) {
    // This uses the public endpoint which is AllowAnonymous
    return this.request<Motorcycle[]>(`/api/motorcycle`);
  }

  async getRiders(page = 1, pageSize = 20, filters?: { search?: string; isActive?: boolean }) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    params.append('userType', 'Rider');
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    return this.request<User[]>(`/api/admin/users?${params.toString()}`);
  }
}

// ============================================
// Types matching backend models
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  userType: 'Customer' | 'Rider' | 'Admin';
  isActive: boolean;
  isVerified?: boolean;
  rating?: number;
  totalRides?: number;
  createdAt: string;
}

export interface RiderData {
  id: number;
  serviceRegion: string;
  vehicleType: string;
  timeAllocation: string;
  licenseLevel: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  verificationStatus: string;
  isVerified: boolean;
}

export interface Vehicle {
  id: number;
  riderDataId: number;
  vehicleType: string;
  plateNumber: string;
  maker: string;
  model: string;
  color: string;
  manufacturedYear: string;
  chassisNumber: string;
  engineNumber: string;
  transmissionType: string;
  orPhotoUrl?: string;
  crPhotoUrl?: string;
  frontPhotoUrl?: string;
  backPhotoUrl?: string;
  sidePhotoUrl?: string;
  ownershipType: string;
  description?: string;
  status: string;
  pricePerHour?: number;
  pricePerKm?: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Driver extends User {
  riderData?: RiderData;
  vehicle?: Vehicle;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface MotorcycleSummary {
  id: number;
  brand: string;
  model: string;
  plateNumber: string;
}

export interface BookingSummary {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
}

export interface Booking {
  id: number;
  customerId: string;
  riderId?: string;
  motorcycleId?: number;
  bookingType: 'Ride' | 'Delivery';
  status: 'Pending' | 'Accepted' | 'InProgress' | 'Completed' | 'Cancelled';
  pickupLocation: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLocation: string;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  estimatedFare?: number;
  finalFare?: number;
  estimatedDistance?: number;
  estimatedDuration?: number;
  requestedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  customer?: UserSummary;
  rider?: UserSummary;
  motorcycle?: MotorcycleSummary;
}

export interface Motorcycle {
  id: number;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  pricePerKm?: number;
  pricePerHour?: number;
  status: 'Available' | 'Booked' | 'Maintenance' | 'Inactive';
  ownerId: string;
  owner?: UserSummary;
  isActive: boolean;
}

export interface Review {
  id: number;
  bookingId: number;
  customerId: string;
  riderId?: string;
  motorcycleId?: number;
  rating: number;
  comment?: string;
  isActive: boolean;
  createdAt: string;
  customer?: UserSummary;
  rider?: UserSummary;
  booking?: BookingSummary;
}

export interface DashboardStats {
  totalUsers: number;
  totalRiders: number;
  totalCustomers: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  totalMotorcycles: number;
  availableMotorcycles: number;
  bookingsToday: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  userGrowth: number;
  bookingGrowth: number;
  revenueGrowth: number;
}

export interface AdminActionLog {
  id: number;
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
  admin?: User;
}

export interface AppSettings {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: string;
  updatedBy?: string;
  updatedAt: string;
}

export const api = new ApiClient();
