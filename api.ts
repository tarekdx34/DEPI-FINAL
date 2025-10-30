// api.ts - Complete API Client for Ajarly Platform (All 13 Features)

const API_BASE_URL = "http://localhost:8082/api/v1";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  message_ar?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}

// ===== AUTHENTICATION TYPES =====
interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  userType: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  userType: "renter" | "landlord" | "broker" | "admin";
}

interface UserProfile {
  userId: number;
  email: string;
  phoneNumber: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  userType: "renter" | "landlord" | "broker" | "admin";
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  bio?: string;
  governorate?: string;
  city?: string;
  isActive: boolean;
  nationalIdVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  totalBookings?: number;
  totalListings?: number;
}

// ===== PROPERTY TYPES =====
interface PropertyCreateRequest {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  propertyType: string;
  rentalType: string;
  governorate: string;
  city: string;
  neighborhood?: string;
  bedrooms: number;
  bathrooms: number;
  guestsCapacity: number;
  areaSqm?: number;
  furnished: boolean;
  petsAllowed: boolean;
  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  cleaningFee?: number;
  securityDeposit?: number;
  minRentalDays?: number;
  checkInTime?: string;
  checkOutTime?: string;
  instantBooking?: boolean;
}

interface PropertyResponse {
  propertyId: number;
  ownerId: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  slug?: string;
  propertyType: string;
  rentalType: string;
  governorate: string;
  city: string;
  neighborhood?: string;
  bedrooms: number;
  bathrooms: number;
  guestsCapacity: number;
  areaSqm?: number;
  furnished: boolean;
  petsAllowed: boolean;
  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  currency: string;
  cleaningFee?: number;
  securityDeposit?: number;
  status: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== PROPERTY IMAGES TYPES =====
interface PropertyImageResponse {
  imageId: number;
  imageUrl: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  imageOrder: number;
  isCover: boolean;
  captionAr?: string;
  captionEn?: string;
  uploadedAt: string;
}

interface ImageUploadResponse {
  uploadedCount: number;
  images: PropertyImageResponse[];
}

// ===== BOOKING TYPES =====
interface BookingCreateRequest {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfChildren: number;
  specialRequests?: string;
}

interface BookingResponse {
  bookingId: number;
  bookingReference: string;
  property: {
    propertyId: number;
    titleAr: string;
    titleEn: string;
    city: string;
    governorate: string;
  };
  renter: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  owner: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  securityDeposit: number;
  status: string;
  paymentStatus: string;
  specialRequests?: string;
  ownerResponse?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  requestedAt: string;
  confirmedAt?: string;
  expiresAt?: string;
}

interface AvailabilityResponse {
  available: boolean;
  message: string;
  unavailableFrom?: string;
  unavailableTo?: string;
}

// ===== REVIEW TYPES =====
interface ReviewCreateRequest {
  bookingId: number;
  overallRating: number;
  cleanlinessRating: number;
  accuracyRating: number;
  communicationRating: number;
  locationRating: number;
  valueRating: number;
  reviewTitle: string;
  reviewText: string;
  pros?: string;
  cons?: string;
}

interface ReviewResponse {
  reviewId: number;
  bookingId: number;
  propertyId: number;
  propertyTitle: string;
  reviewer: {
    userId: number;
    firstName: string;
    lastName: string;
    verified: boolean;
    totalReviews: number;
  };
  overallRating: number;
  cleanlinessRating: number;
  accuracyRating: number;
  communicationRating: number;
  locationRating: number;
  valueRating: number;
  reviewTitle: string;
  reviewText: string;
  pros?: string;
  cons?: string;
  ownerResponse?: string;
  ownerResponseDate?: string;
  isApproved: boolean;
  createdAt: string;
}

interface ReviewStatsResponse {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    cleanlinessAvg: number;
    accuracyAvg: number;
    communicationAvg: number;
    locationAvg: number;
    valueAvg: number;
  };
}

// ===== FAVORITE TYPES =====
interface FavoriteResponse {
  favoriteId: number;
  notes?: string;
  createdAt: string;
  property: PropertyResponse;
}

interface FavoriteCheckResponse {
  isFavorited: boolean;
  favoriteId?: number;
}

// ===== USER PROFILE TYPES =====
interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  bio?: string;
  governorate?: string;
  city?: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PhoneVerificationResponse {
  message: string;
  expiresAt: string;
}

// ===== ADMIN TYPES =====
interface DashboardStatsResponse {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovalsCount: number;
  bannedUsersCount: number;
  activeProperties: number;
  recentActivity: {
    recentBookings: number;
    recentRegistrations: number;
    recentPropertyListings: number;
    generatedAt: string;
  };
}

interface PendingPropertyResponse {
  propertyId: number;
  titleAr: string;
  titleEn: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  propertyType: string;
  rentalType: string;
  governorate: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  descriptionAr: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ===== REPORT TYPES =====
interface ReportCreateRequest {
  reportType: "property" | "user" | "review" | "message";
  reportedUserId?: number;
  reportedPropertyId?: number;
  reportedReviewId?: number;
  reason:
    | "fake_listing"
    | "inappropriate_content"
    | "scam"
    | "fraud"
    | "harassment"
    | "spam";
  description: string;
}

interface ReportResponse {
  reportId: number;
  reporterId: number;
  reportType: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  actionTaken: string;
  createdAt: string;
  assignedToId?: number;
  resolvedById?: number;
  resolvedAt?: string;
  resolutionNotes?: string;
  adminNotes?: string;
}

// ===== PAYMENT TYPES =====
interface PaymentIntentRequest {
  bookingId: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface PaymentIntentResponse {
  transactionReference: string;
  fawryReferenceNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paymentUrl: string;
  qrCode: string;
  expiresAt: string;
  message: string;
}

interface PaymentConfirmRequest {
  transactionReference: string;
  simulateSuccess?: boolean;
}

interface TransactionResponse {
  transactionId: number;
  transactionReference: string;
  transactionType: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  bookingReference?: string;
  propertyTitle?: string;
  createdAt: string;
  completedAt?: string;
}

interface RefundRequest {
  bookingId: number;
  refundAmount: number;
  reason: string;
  adminApproved: boolean;
}

// ===== SUBSCRIPTION TYPES =====
interface SubscriptionPlanResponse {
  planId: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  priceMonthly: number;
  priceYearly?: number;
  maxListings?: number;
  featuredListingsPerMonth: number;
  prioritySupport: boolean;
  verificationBadge: boolean;
  analyticsAccess: boolean;
  isActive: boolean;
  isPopular?: boolean;
  yearlySavings?: number;
}

interface SubscribeRequest {
  planId: number;
  billingPeriod: "monthly" | "yearly";
  paymentMethod: string;
}

interface SubscriptionResponse {
  subscriptionId: number;
  plan: {
    planId: number;
    nameEn: string;
    maxListings?: number;
  };
  billingPeriod: string;
  startDate: string;
  endDate: string;
  status: string;
  amountPaid: number;
  daysRemaining: number;
  isExpiringSoon: boolean;
}

interface SubscriptionLimitsResponse {
  hasActiveSubscription: boolean;
  planName: string;
  maxListings?: number;
  listingsUsed: number;
  listingsRemaining?: number;
  canCreateMore: boolean;
  featuredListingsPerMonth: number;
  featuredListingsUsed: number;
  featuredListingsRemaining: number;
  prioritySupport: boolean;
  verificationBadge: boolean;
  analyticsAccess: boolean;
}

// ===== ANALYTICS TYPES =====
interface PropertyAnalyticsResponse {
  propertyId: number;
  propertyTitle: string;
  startDate: string;
  endDate: string;
  summary: {
    totalViews: number;
    uniqueViews: number;
    totalBookingRequests: number;
    totalConfirmedBookings: number;
    totalCancellations: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    contactClicks: number;
  };
  viewsOverTime: Array<{ date: string; value: number; label: string }>;
  bookingsOverTime: Array<{ date: string; value: number; label: string }>;
  revenueOverTime: Array<{ date: string; value: number; label: string }>;
  ratingTrend: Array<{ date: string; value: number; label: string }>;
  performance: {
    bookingConversionRate: number;
    viewToBookingRate: number;
    averageRevenuePerBooking: number;
    occupancyRate: number;
    avgResponseTimeHours: number;
  };
}

interface OwnerDashboardResponse {
  ownerId: number;
  ownerName: string;
  overview: {
    totalProperties: number;
    activeProperties: number;
    pendingApprovalProperties: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalBookings: number;
    pendingBookings: number;
    upcomingBookings: number;
    averageRating: number;
    totalReviews: number;
  };
  bestPerformingProperty: {
    propertyId: number;
    propertyTitle: string;
    propertyImage: string;
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    totalViews: number;
    performanceReason: string;
  };
  upcomingBookings: any[];
  recentReviews: any[];
  revenueChart: any[];
  propertiesPerformance: any[];
}

interface PlatformAnalyticsResponse {
  startDate: string;
  endDate: string;
  overview: {
    totalUsers: number;
    newUsersInPeriod: number;
    totalProperties: number;
    newPropertiesInPeriod: number;
    activeProperties: number;
    totalBookings: number;
    newBookingsInPeriod: number;
    totalRevenue: number;
    revenueInPeriod: number;
    averagePlatformRating: number;
    totalReviews: number;
  };
  userGrowth: any[];
  propertyGrowth: any[];
  bookingGrowth: any[];
  revenueGrowth: any[];
  topLocations: Array<{
    governorate: string;
    city: string;
    propertyCount: number;
    bookingCount: number;
    totalRevenue: number;
    averagePrice: number;
  }>;
  popularPropertyTypes: any[];
  userStats: any;
  bookingStats: any;
}

// ===== SEARCH TYPES =====
interface SearchRequest {
  governorate?: string;
  city?: string;
  propertyType?: string;
  rentalType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  minGuests?: number;
  checkInDate?: string;
  checkOutDate?: string;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  page?: number;
  size?: number;
}

interface SearchResponse {
  properties: PropertyResponse[];
  pagination: PaginationResponse;
  metadata: {
    executionTimeMs: number;
    appliedFiltersCount: number;
    sortedBy: string;
    sortDirection: string;
  };
}

interface LocationSuggestion {
  governorate: string;
  city: string;
  propertyCount: number;
  displayText: string;
}

interface PopularLocation {
  governorate: string;
  city: string;
  propertyCount: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalViews: number;
}

// ===== PAGINATION =====
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================
// API CLIENT CLASS
// ============================================

class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = this.getAuthToken();

  // ✅ استخدم Record بدلاً من HeadersInit
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only add Content-Type if not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      mode: "cors",
      credentials: "omit",
    });

    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = {
        success: response.ok,
        message: text,
        data: response.ok ? text : undefined,
        error: response.ok ? undefined : text,
      };
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    if (data.data !== undefined) {
      return data.data;
    } else if (data.success !== undefined) {
      return data as any;
    } else {
      return data;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        `Network error: Cannot reach ${this.baseURL}${endpoint}`,
        0
      );
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

  // ============================================
  // 1. AUTHENTICATION
  // ============================================

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response.token) {
      localStorage.setItem("authToken", response.token);
    }
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      localStorage.setItem("authToken", response.token);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("authToken");
    }
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>("/users/profile");
  }

  // ============================================
  // 2. PROPERTIES
  // ============================================

  async createProperty(data: PropertyCreateRequest): Promise<PropertyResponse> {
    return this.request<PropertyResponse>("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProperties(
    params?: any
  ): Promise<PaginatedResponse<PropertyResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<PropertyResponse>>(
      `/properties${queryString ? `?${queryString}` : ""}`
    );
  }

  async getProperty(id: number): Promise<PropertyResponse> {
    return this.request<PropertyResponse>(`/properties/${id}`);
  }

  async updateProperty(
    id: number,
    data: Partial<PropertyCreateRequest>
  ): Promise<PropertyResponse> {
    return this.request<PropertyResponse>(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: number): Promise<void> {
    return this.request<void>(`/properties/${id}`, {
      method: "DELETE",
    });
  }

  async getMyProperties(
    params?: any
  ): Promise<PaginatedResponse<PropertyResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<PropertyResponse>>(
      `/properties/my-properties${queryString ? `?${queryString}` : ""}`
    );
  }

  // ============================================
  // 3. PROPERTY IMAGES
  // ============================================

  async uploadPropertyImages(
    propertyId: number,
    files: File[]
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return this.request<ImageUploadResponse>(
      `/properties/${propertyId}/images`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  async getPropertyImages(
    propertyId: number
  ): Promise<PropertyImageResponse[]> {
    return this.request<PropertyImageResponse[]>(
      `/properties/${propertyId}/images`
    );
  }

  async deletePropertyImage(imageId: number): Promise<void> {
    return this.request<void>(`/properties/images/${imageId}`, {
      method: "DELETE",
    });
  }

  async setCoverImage(imageId: number): Promise<PropertyImageResponse> {
    return this.request<PropertyImageResponse>(
      `/properties/images/${imageId}/cover`,
      {
        method: "PUT",
      }
    );
  }

  // ============================================
  // 4. BOOKINGS
  // ============================================

  async createBooking(data: BookingCreateRequest): Promise<BookingResponse> {
    return this.request<BookingResponse>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getBookings(status?: string): Promise<BookingResponse[]> {
    return this.request<BookingResponse[]>(
      `/bookings${status ? `?status=${status}` : ""}`
    );
  }

  async getBooking(id: number): Promise<BookingResponse> {
    return this.request<BookingResponse>(`/bookings/${id}`);
  }

  async confirmBooking(
    id: number,
    ownerResponse?: string
  ): Promise<BookingResponse> {
    return this.request<BookingResponse>(`/bookings/${id}/confirm`, {
      method: "PUT",
      body: JSON.stringify({ ownerResponse: ownerResponse || "" }),
    });
  }

  async rejectBooking(
    id: number,
    rejectionReason: string
  ): Promise<BookingResponse> {
    return this.request<BookingResponse>(`/bookings/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async cancelBooking(
    id: number,
    cancellationReason: string
  ): Promise<BookingResponse> {
    return this.request<BookingResponse>(`/bookings/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ cancellationReason }),
    });
  }

  async getOwnerBookings(status?: string): Promise<BookingResponse[]> {
    return this.request<BookingResponse[]>(
      `/bookings/owner${status ? `?status=${status}` : ""}`
    );
  }

  async checkAvailability(
    propertyId: number,
    checkIn: string,
    checkOut: string
  ): Promise<AvailabilityResponse> {
    return this.request<AvailabilityResponse>(
      `/bookings/availability/check?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`
    );
  }

  async getUpcomingBookings(): Promise<BookingResponse[]> {
    return this.request<BookingResponse[]>("/bookings/upcoming");
  }

  async getOwnerUpcomingBookings(): Promise<BookingResponse[]> {
    return this.request<BookingResponse[]>("/bookings/owner/upcoming");
  }

  // ============================================
  // 5. REVIEWS
  // ============================================

  async createReview(data: ReviewCreateRequest): Promise<ReviewResponse> {
    return this.request<ReviewResponse>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPropertyReviews(
    propertyId: number,
    params?: any
  ): Promise<PaginatedResponse<ReviewResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<ReviewResponse>>(
      `/reviews/property/${propertyId}${queryString ? `?${queryString}` : ""}`
    );
  }

  async getPropertyReviewStats(
    propertyId: number
  ): Promise<ReviewStatsResponse> {
    return this.request<ReviewStatsResponse>(
      `/reviews/property/${propertyId}/stats`
    );
  }

  async respondToReview(
    reviewId: number,
    ownerResponse: string
  ): Promise<ReviewResponse> {
    return this.request<ReviewResponse>(`/reviews/${reviewId}/response`, {
      method: "PUT",
      body: JSON.stringify({ ownerResponse }),
    });
  }

  async canReviewBooking(bookingId: number): Promise<{ canReview: boolean }> {
    return this.request<{ canReview: boolean }>(
      `/reviews/booking/${bookingId}/can-review`
    );
  }

  // ============================================
  // 6. FAVORITES
  // ============================================

  async addFavorite(
    propertyId: number,
    notes?: string
  ): Promise<FavoriteResponse> {
    return this.request<FavoriteResponse>("/favorites", {
      method: "POST",
      body: JSON.stringify({ propertyId, notes }),
    });
  }

  async getFavorites(
    params?: any
  ): Promise<PaginatedResponse<FavoriteResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<FavoriteResponse>>(
      `/favorites${queryString ? `?${queryString}` : ""}`
    );
  }

  async removeFavorite(propertyId: number): Promise<void> {
    return this.request<void>(`/favorites/${propertyId}`, {
      method: "DELETE",
    });
  }

  async checkFavorite(propertyId: number): Promise<FavoriteCheckResponse> {
    return this.request<FavoriteCheckResponse>(
      `/favorites/check/${propertyId}`
    );
  }

  // ============================================
  // 7. USER PROFILE
  // ============================================

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return this.request<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.request<void>("/users/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File): Promise<{ profilePhoto: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<{ profilePhoto: string }>("/users/upload-avatar", {
      method: "POST",
      body: formData,
    });
  }

  async requestPhoneVerification(): Promise<PhoneVerificationResponse> {
    return this.request<PhoneVerificationResponse>("/users/verify-phone", {
      method: "POST",
    });
  }

  async confirmPhoneVerification(code: string): Promise<void> {
    return this.request<void>("/users/verify-phone/confirm", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  // ============================================
  // 8. ADVANCED SEARCH
  // ============================================

  async advancedSearch(params: SearchRequest): Promise<SearchResponse> {
    return this.request<SearchResponse>("/search", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async getSearchSuggestions(query: string): Promise<LocationSuggestion[]> {
    return this.request<LocationSuggestion[]>(
      `/search/suggestions?query=${encodeURIComponent(query)}`
    );
  }

  async getPopularLocations(limit?: number): Promise<PopularLocation[]> {
    return this.request<PopularLocation[]>(
      `/locations/popular${limit ? `?limit=${limit}` : ""}`
    );
  }

  async getGovernorates(): Promise<string[]> {
    return this.request<string[]>("/locations/governorates");
  }

  async getCities(governorate?: string): Promise<string[]> {
    return this.request<string[]>(
      `/locations/cities${
        governorate ? `?governorate=${encodeURIComponent(governorate)}` : ""
      }`
    );
  }

  // ============================================
  // 9. ADMIN DASHBOARD
  // ============================================

  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return this.request<DashboardStatsResponse>("/admin/dashboard");
  }

  async getPendingProperties(
    params?: any
  ): Promise<PaginatedResponse<PendingPropertyResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<PendingPropertyResponse>>(
      `/admin/properties/pending${queryString ? `?${queryString}` : ""}`
    );
  }

  async approveProperty(propertyId: number): Promise<string> {
    return this.request<string>(`/admin/properties/${propertyId}/approve`, {
      method: "PUT",
    });
  }

  async rejectProperty(propertyId: number, reason: string): Promise<string> {
    return this.request<string>(`/admin/properties/${propertyId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  async getAllUsers(params?: any): Promise<PaginatedResponse<UserProfile>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<UserProfile>>(
      `/admin/users${queryString ? `?${queryString}` : ""}`
    );
  }

  async banUser(userId: number, reason: string): Promise<string> {
    return this.request<string>(`/admin/users/${userId}/ban`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  async unbanUser(userId: number): Promise<string> {
    return this.request<string>(`/admin/users/${userId}/unban`, {
      method: "PUT",
    });
  }

  async verifyUserId(userId: number): Promise<string> {
    return this.request<string>(`/admin/users/${userId}/verify`, {
      method: "PUT",
    });
  }

  // ============================================
  // 10. REPORTS
  // ============================================

  async createReport(data: ReportCreateRequest): Promise<ReportResponse> {
    return this.request<ReportResponse>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyReports(params?: any): Promise<PaginatedResponse<ReportResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<ReportResponse>>(
      `/reports/my-reports${queryString ? `?${queryString}` : ""}`
    );
  }

  async getAllReports(
    params?: any
  ): Promise<PaginatedResponse<ReportResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<ReportResponse>>(
      `/reports/admin/all${queryString ? `?${queryString}` : ""}`
    );
  }

  async getAssignedReports(
    params?: any
  ): Promise<PaginatedResponse<ReportResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PaginatedResponse<ReportResponse>>(
      `/reports/admin/assigned-to-me${queryString ? `?${queryString}` : ""}`
    );
  }

  async getUrgentReports(): Promise<PaginatedResponse<ReportResponse>> {
    return this.request<PaginatedResponse<ReportResponse>>(
      "/reports/admin/urgent"
    );
  }

  async assignReport(
    reportId: number,
    adminId: number
  ): Promise<ReportResponse> {
    return this.request<ReportResponse>(`/reports/${reportId}/assign`, {
      method: "PUT",
      body: JSON.stringify({ adminId }),
    });
  }

  async addReportNotes(
    reportId: number,
    notes: string
  ): Promise<ReportResponse> {
    return this.request<ReportResponse>(`/reports/${reportId}/add-notes`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  }

  async resolveReport(
    reportId: number,
    data: {
      status: string;
      actionTaken: string;
      resolutionNotes: string;
    }
  ): Promise<ReportResponse> {
    return this.request<ReportResponse>(`/reports/${reportId}/resolve`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getReport(reportId: number): Promise<ReportResponse> {
    return this.request<ReportResponse>(`/reports/${reportId}`);
  }

  // ============================================
  // 11. PAYMENTS
  // ============================================

  async createPaymentIntent(
    data: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    return this.request<PaymentIntentResponse>("/payments/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async confirmPayment(
    data: PaymentConfirmRequest
  ): Promise<TransactionResponse> {
    return this.request<TransactionResponse>("/payments/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPaymentHistory(): Promise<TransactionResponse[]> {
    return this.request<TransactionResponse[]>("/payments/history");
  }

  async processRefund(data: RefundRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>("/payments/refund", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // 12. SUBSCRIPTIONS
  // ============================================

  async getSubscriptionPlans(): Promise<SubscriptionPlanResponse[]> {
    return this.request<SubscriptionPlanResponse[]>("/subscriptions/plans");
  }

  async subscribe(data: SubscribeRequest): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>("/subscriptions/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentSubscription(): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>("/subscriptions/current");
  }

  async getSubscriptionLimits(): Promise<SubscriptionLimitsResponse> {
    return this.request<SubscriptionLimitsResponse>("/subscriptions/limits");
  }

  async cancelSubscription(reason: string): Promise<void> {
    return this.request<void>("/subscriptions/cancel", {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  // ============================================
  // 13. ANALYTICS
  // ============================================

  async getPropertyAnalytics(
    propertyId: number,
    params?: { startDate?: string; endDate?: string }
  ): Promise<PropertyAnalyticsResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PropertyAnalyticsResponse>(
      `/analytics/property/${propertyId}${queryString ? `?${queryString}` : ""}`
    );
  }

  async getOwnerDashboard(): Promise<OwnerDashboardResponse> {
    return this.request<OwnerDashboardResponse>("/analytics/owner/dashboard");
  }

  async getPlatformAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<PlatformAnalyticsResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request<PlatformAnalyticsResponse>(
      `/analytics/admin/platform${queryString ? `?${queryString}` : ""}`
    );
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

const api = new ApiClient(API_BASE_URL);

// ============================================
// HELPER FUNCTIONS
// ============================================

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("authToken");
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const clearAuth = (): void => {
  localStorage.removeItem("authToken");
};

export const formatApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// ============================================
// EXPORTS
// ============================================

export default api;
export { ApiError, ApiClient };

export type {
  // Auth
  ApiResponse,
  AuthResponse,
  RegisterRequest,
  UserProfile,
  // Properties
  PropertyCreateRequest,
  PropertyResponse,
  // Images
  PropertyImageResponse,
  ImageUploadResponse,
  // Bookings
  BookingCreateRequest,
  BookingResponse,
  AvailabilityResponse,
  // Reviews
  ReviewCreateRequest,
  ReviewResponse,
  ReviewStatsResponse,
  // Favorites
  FavoriteResponse,
  FavoriteCheckResponse,
  // User Profile
  UpdateProfileRequest,
  ChangePasswordRequest,
  PhoneVerificationResponse,
  // Admin
  DashboardStatsResponse,
  PendingPropertyResponse,
  // Reports
  ReportCreateRequest,
  ReportResponse,
  // Payments
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentConfirmRequest,
  TransactionResponse,
  RefundRequest,
  // Subscriptions
  SubscriptionPlanResponse,
  SubscribeRequest,
  SubscriptionResponse,
  SubscriptionLimitsResponse,
  // Analytics
  PropertyAnalyticsResponse,
  OwnerDashboardResponse,
  PlatformAnalyticsResponse,
  // Search
  SearchRequest,
  SearchResponse,
  LocationSuggestion,
  PopularLocation,
  // Pagination
  PaginatedResponse,
  PaginationResponse,
};
