// api.ts - Complete API Client for Ajarly Platform - UPDATED VERSION
// Includes all 13 features + Fixed Admin Reviews Endpoints

const API_BASE_URL = "http://localhost:8081/api/v1";

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
interface PropertyBasicInfo {
  propertyId: number;
  titleAr: string;
  titleEn: string;
  city: string;
  governorate: string;
  coverImage?: string;
}

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
  property: PropertyBasicInfo;
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
  numberOfAdults: number;
  numberOfChildren: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  securityDeposit: number;
  refundAmount?: number;
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
  property: PropertyBasicInfo;
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
  updatedAt?: string;
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

interface ReviewAdminStatsResponse {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
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

    const headers: HeadersInit = {
      ...options.headers,
    };

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
  // HELPER: Map payment method to backend enum
  // ============================================
  private mapPaymentMethod(method: string): string {
    const mapping: Record<string, string> = {
      card: "credit_card",
      CARD: "credit_card",
      credit_card: "credit_card",
      fawry: "fawry",
      FAWRY: "fawry",
      vodafone_cash: "vodafone_cash",
      etisalat_cash: "etisalat_cash",
    };

    return mapping[method] || method.toLowerCase();
  }

  // ============================================
  // HELPERS: Normalize responses
  // ============================================
  
  // ✅ Helper to normalize booking response
  private normalizeBooking(booking: any): BookingResponse {
    return {
      ...booking,
      property: {
        propertyId: booking.property?.propertyId || booking.propertyId,
        titleAr: booking.property?.titleAr || booking.propertyTitle || "",
        titleEn: booking.property?.titleEn || booking.propertyTitle || "",
        city: booking.property?.city || "",
        governorate: booking.property?.governorate || "",
        coverImage: booking.property?.coverImage || 
                   booking.property?.coverImageUrl ||
                   "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?w=800&q=80"
      }
    };
  }

  // ✅ Helper to normalize review response
 // ✅ FIXED: Helper to normalize review response with proper image handling
private normalizeReview(review: any): ReviewResponse {
  console.log('🔍 Normalizing review:', {
    reviewId: review.reviewId,
    hasProperty: !!review.property,
    propertyId: review.property?.propertyId || review.propertyId,
    coverImage: review.property?.coverImage,
    propertyTitle: review.property?.titleAr || review.propertyTitle
  });

  // ✅ Extract property info with proper null checks
  const propertyInfo: any = {
    propertyId: review.property?.propertyId || review.propertyId || 0,
    titleAr: review.property?.titleAr || review.propertyTitle || "عقار غير متوفر",
    titleEn: review.property?.titleEn || review.propertyTitle || "Property Not Available",
    city: review.property?.city || "",
    governorate: review.property?.governorate || "",
    coverImage: null  // Will be set below
  };

  // ✅ CRITICAL: Try multiple sources for cover image
  let coverImage = null;
  
  // Priority 1: property.coverImage from backend
  if (review.property?.coverImage && review.property.coverImage !== "") {
    coverImage = review.property.coverImage;
    console.log('✅ Using property.coverImage:', coverImage);
  }
  // Priority 2: property.coverImageUrl
  else if (review.property?.coverImageUrl && review.property.coverImageUrl !== "") {
    coverImage = review.property.coverImageUrl;
    console.log('✅ Using property.coverImageUrl:', coverImage);
  }
  // Priority 3: First image from property.images array
  else if (review.property?.images && Array.isArray(review.property.images) && review.property.images.length > 0) {
    const coverImg = review.property.images.find((img: any) => img.isCover);
    coverImage = coverImg?.imageUrl || review.property.images[0]?.imageUrl;
    console.log('✅ Using first image from array:', coverImage);
  }
  // Priority 4: Fallback image
  else {
    coverImage = "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?w=800&q=80";
    console.log('⚠️ Using fallback image');
  }

  propertyInfo.coverImage = coverImage;

  // ✅ Build complete response
  const normalized: ReviewResponse = {
    ...review,
    property: propertyInfo,
    reviewer: review.reviewer || {
      userId: 0,
      firstName: "Unknown",
      lastName: "User",
      verified: false,
      totalReviews: 0
    }
  };

  console.log('✅ Normalized review result:', {
    reviewId: normalized.reviewId,
    propertyId: normalized.property.propertyId,
    finalCoverImage: normalized.property.coverImage
  });

  return normalized;
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
    const booking = await this.request<any>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return this.normalizeBooking(booking);
  }

  async getBookings(status?: string): Promise<BookingResponse[]> {
    const bookings = await this.request<any[]>(
      `/bookings${status ? `?status=${status}` : ""}`
    );
    return bookings.map(b => this.normalizeBooking(b));
  }

  async getBooking(id: number): Promise<BookingResponse> {
    const booking = await this.request<any>(`/bookings/${id}`);
    return this.normalizeBooking(booking);
  }

  async confirmBooking(
    id: number,
    ownerResponse?: string
  ): Promise<BookingResponse> {
    const booking = await this.request<any>(`/bookings/${id}/confirm`, {
      method: "PUT",
      body: JSON.stringify({ ownerResponse: ownerResponse || "" }),
    });
    return this.normalizeBooking(booking);
  }

  async rejectBooking(
    id: number,
    rejectionReason: string
  ): Promise<BookingResponse> {
    const booking = await this.request<any>(`/bookings/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectionReason }),
    });
    return this.normalizeBooking(booking);
  }

  async cancelBooking(
    id: number,
    cancellationReason: string
  ): Promise<BookingResponse> {
    const booking = await this.request<any>(`/bookings/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ cancellationReason }),
    });
    return this.normalizeBooking(booking);
  }

  async getOwnerBookings(status?: string): Promise<BookingResponse[]> {
    const bookings = await this.request<any[]>(
      `/bookings/owner${status ? `?status=${status}` : ""}`
    );
    return bookings.map(b => this.normalizeBooking(b));
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
    const bookings = await this.request<any[]>("/bookings/upcoming");
    return bookings.map(b => this.normalizeBooking(b));
  }

  async getOwnerUpcomingBookings(): Promise<BookingResponse[]> {
    const bookings = await this.request<any[]>("/bookings/owner/upcoming");
    return bookings.map(b => this.normalizeBooking(b));
  }

  // ============================================
  // 5. REVIEWS (RENTER/OWNER)
  // ============================================

  async createReview(data: ReviewCreateRequest): Promise<ReviewResponse> {
    const review = await this.request<any>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return this.normalizeReview(review);
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
    
    const response = await this.request<PaginatedResponse<any>>(
      `/reviews/property/${propertyId}${queryString ? `?${queryString}` : ""}`
    );

    return {
      ...response,
      content: response.content.map(r => this.normalizeReview(r))
    };
  }

  async getPropertyReviewStats(
    propertyId: number
  ): Promise<ReviewStatsResponse> {
    return this.request<ReviewStatsResponse>(
      `/reviews/property/${propertyId}/stats`
    );
  }

// api.ts - ✅ FIXED respondToReview with Better Error Handling

async respondToReview(
  reviewId: number,
  ownerResponse: string
): Promise<ReviewResponse> {
  console.log("\n📤 ========================================");
  console.log("📤 API: Responding to Review");
  console.log("📤 Review ID:", reviewId);
  console.log("📤 Response:", ownerResponse.substring(0, 50) + "...");
  console.log("📤 ========================================\n");

  try {
    const endpoint = `/reviews/${reviewId}/response`;
    console.log(`🔄 API Call: ${this.baseURL}${endpoint}`);
    console.log("📦 Request Body:", { ownerResponse });

    const review = await this.request<any>(endpoint, {
      method: "PUT",
      body: JSON.stringify({ ownerResponse }),
    });

    console.log("✅ API Response received:", review);
    
    return this.normalizeReview(review);
    
  } catch (error: any) {
    console.error("\n❌ ========================================");
    console.error("❌ API: respondToReview FAILED");
    console.error("❌ Review ID:", reviewId);
    console.error("❌ Status:", error.status);
    console.error("❌ Message:", error.message);
    console.error("❌ Data:", error.data);
    console.error("❌ ========================================\n");

    // ✅ Enhanced error messages
    if (error.status === 500) {
      throw new ApiError(
        "Server error. The backend is experiencing issues. Please contact support if this persists.",
        500,
        error.data
      );
    } else if (error.status === 404) {
      throw new ApiError(
        "Review not found. It may have been deleted.",
        404,
        error.data
      );
    } else if (error.status === 403) {
      throw new ApiError(
        "Access denied. You may not be authorized to respond to this review.",
        403,
        error.data
      );
    } else if (error.status === 400) {
      throw new ApiError(
        error.message || "Invalid data. Please check your response text.",
        400,
        error.data
      );
    }
    
    throw error;
  }
}

// ============================================
// ✅ Helper to check backend health
// ============================================
async checkBackendHealth(): Promise<{
  healthy: boolean;
  message: string;
  endpoints: Record<string, boolean>;
}> {
  const endpoints = {
    properties: false,
    bookings: false,
    reviews: false,
    dashboard: false,
  };

  try {
    // Test each endpoint
    await Promise.allSettled([
      this.request("/properties?page=0&size=1").then(() => endpoints.properties = true),
      this.request("/bookings").then(() => endpoints.bookings = true),
      this.request("/reviews/my-reviews?page=0&size=1").then(() => endpoints.reviews = true),
      this.request("/analytics/owner/dashboard").then(() => endpoints.dashboard = true),
    ]);

    const healthyCount = Object.values(endpoints).filter(Boolean).length;
    const totalCount = Object.keys(endpoints).length;

    return {
      healthy: healthyCount === totalCount,
      message: `${healthyCount}/${totalCount} endpoints healthy`,
      endpoints
    };
  } catch (error) {
    return {
      healthy: false,
      message: "Backend health check failed",
      endpoints
    };
  }
}

  // ============================================
  // DIAGNOSTIC HELPERS
  // ============================================

  /**
   * 🔍 Test admin reviews endpoint connectivity
   * Use this to diagnose endpoint issues
   */
  async testAdminReviewsEndpoint(): Promise<{
    success: boolean;
    workingEndpoint?: string;
    error?: string;
    details?: any;
  }> {
    const testEndpoints = [
      '/admin/reviews',
      '/reviews/admin',
      '/reviews',
      '/admin/reviews?page=0&size=1',
    ];

    console.log('🔍 Testing admin reviews endpoints...');

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing: ${endpoint}`);
        const response = await this.request<any>(endpoint);
        
        console.log(`✅ SUCCESS with: ${endpoint}`, response);
        
        return {
          success: true,
          workingEndpoint: endpoint,
          details: response
        };
      } catch (error: any) {
        console.log(`❌ FAILED: ${endpoint} - ${error.message} (Status: ${error.status})`);
        
        if (endpoint === testEndpoints[testEndpoints.length - 1]) {
          return {
            success: false,
            error: error.message,
            details: {
              status: error.status,
              data: error.data,
              testedEndpoints: testEndpoints
            }
          };
        }
      }
    }

    return {
      success: false,
      error: 'All endpoints failed',
      details: { testedEndpoints: testEndpoints }
    };
  }

  /**
   * 🔍 Check if user has admin privileges
   */
  async checkAdminAccess(): Promise<{
    isAdmin: boolean;
    userType?: string;
    error?: string;
  }> {
    try {
      const profile = await this.getProfile();
      
      return {
        isAdmin: profile.userType === 'admin',
        userType: profile.userType
      };
    } catch (error: any) {
      return {
        isAdmin: false,
        error: error.message
      };
    }
  }

  // ============================================
// 6. REVIEWS (ADMIN) - ✅ FINAL WORKING VERSION
// ============================================
// Replace ONLY this section in your api.ts file

/**
 * ✅ Get all reviews with admin filtering - REAL BACKEND
 */
async getReviewsAdmin(params?: {
  page?: number;
  size?: number;
  status?: "all" | "pending" | "approved";
}): Promise<PaginatedResponse<ReviewResponse>> {
  console.log(`\n📊 ========================================`);
  console.log(`📊 FETCHING ADMIN REVIEWS`);
  console.log(`📊 Filter: ${params?.status || 'all'}`);
  console.log(`📊 ========================================\n`);
  
  const queryParams: Record<string, string> = {
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 50),
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  };

  // Apply filter
  if (params?.status === "pending") {
    queryParams.isApproved = 'false';
  } else if (params?.status === "approved") {
    queryParams.isApproved = 'true';
  }
  // For "all", don't add isApproved filter

  const queryString = new URLSearchParams(queryParams).toString();
  
  try {
    // ✅ Use correct admin endpoint
    const endpoint = `/reviews/admin/all?${queryString}`;
    console.log(`🔄 API Call: ${this.baseURL}${endpoint}`);
    
    const response = await this.request<any>(endpoint);
    console.log(`✅ Response received:`, response);

    // Handle response structure
    let reviewsData = response;
    
    // Unwrap if nested in 'data'
    if (response.data) {
      reviewsData = response.data;
    }
    
    // Extract pagination info
    let content: any[] = [];
    let totalElements = 0;
    let totalPages = 0;
    let currentPage = 0;
    let pageSize = 50;

    if (reviewsData.content) {
      // Paginated response
      content = reviewsData.content;
      totalElements = reviewsData.totalElements || 0;
      totalPages = reviewsData.totalPages || 0;
      currentPage = reviewsData.currentPage || 0;
      pageSize = reviewsData.pageSize || 50;
    } else if (Array.isArray(reviewsData)) {
      // Array response
      content = reviewsData;
      totalElements = reviewsData.length;
      totalPages = 1;
      currentPage = 0;
    }

    console.log(`✅ Processing ${content.length} reviews...`);

    // Normalize reviews
    const normalizedReviews = content.map((r, index) => {
      try {
        return this.normalizeReview(r);
      } catch (err) {
        console.error(`⚠️ Failed to normalize review ${index}:`, err);
        return null;
      }
    }).filter(r => r !== null) as ReviewResponse[];

    console.log(`✅ Successfully loaded ${normalizedReviews.length} reviews\n`);

    return {
      content: normalizedReviews,
      totalElements: totalElements,
      totalPages: totalPages,
      currentPage: currentPage,
      pageSize: pageSize
    };
    
  } catch (error: any) {
    console.error(`\n❌ ========================================`);
    console.error(`❌ FAILED TO FETCH REVIEWS`);
    console.error(`❌ Status: ${error.status}`);
    console.error(`❌ Message: ${error.message}`);
    console.error(`❌ ========================================\n`);
    
    // Better error handling
    if (error.status === 403) {
      throw new ApiError(
        "Access denied. Please ensure you're logged in as Admin.",
        403,
        error.data
      );
    } else if (error.status === 500) {
      // Return empty result instead of crashing
      console.warn("⚠️ Server error, returning empty result");
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 50
      };
    }
    
    throw error;
  }
}

/**
 * ✅ Get review statistics for admin - REAL BACKEND
 */
async getReviewStats(): Promise<ReviewAdminStatsResponse> {
  console.log("\n📊 Fetching admin review stats...");
  
  try {
    const endpoint = '/reviews/admin/stats';
    console.log(`🔄 API Call: ${this.baseURL}${endpoint}`);
    
    const stats = await this.request<any>(endpoint);
    
    console.log("✅ Stats received:", stats);
    
    return {
      totalReviews: stats.totalReviews || 0,
      pendingReviews: stats.pendingReviews || 0,
      approvedReviews: stats.approvedReviews || 0,
      rejectedReviews: stats.rejectedReviews || 0,
      averageRating: stats.averageRating || 0
    };
    
  } catch (error: any) {
    console.error("❌ Failed to fetch stats:", error);
    
    // Return default stats on error
    return {
      totalReviews: 0,
      pendingReviews: 0,
      approvedReviews: 0,
      rejectedReviews: 0,
      averageRating: 0
    };
  }
}

/**
 * ✅ Approve review - REAL BACKEND
 */
async approveReview(reviewId: number): Promise<ReviewResponse> {
  console.log(`\n✅ ========================================`);
  console.log(`✅ APPROVING REVIEW ${reviewId}`);
  console.log(`✅ ========================================\n`);
  
  try {
    const endpoint = `/reviews/${reviewId}/approve`;
    console.log(`🔄 API Call: ${this.baseURL}${endpoint}`);
    
    const review = await this.request<any>(endpoint, {
      method: "PUT"
    });
    
    console.log("✅ Review approved:", review);
    
    return this.normalizeReview(review);
    
  } catch (error: any) {
    console.error(`\n❌ ========================================`);
    console.error(`❌ APPROVE FAILED`);
    console.error(`❌ Status: ${error.status}`);
    console.error(`❌ Message: ${error.message}`);
    console.error(`❌ Data:`, error.data);
    console.error(`❌ ========================================\n`);
    
    throw error;
  }
}

/**
 * ✅ Reject review - REAL BACKEND
 */
async rejectReview(reviewId: number, reason?: string): Promise<ReviewResponse> {
  console.log(`\n❌ ========================================`);
  console.log(`❌ REJECTING REVIEW ${reviewId}`);
  console.log(`❌ Reason: ${reason || 'No reason provided'}`);
  console.log(`❌ ========================================\n`);
  
  try {
    const endpoint = `/reviews/${reviewId}/reject`;
    console.log(`🔄 API Call: ${this.baseURL}${endpoint}`);
    
    const review = await this.request<any>(endpoint, {
      method: "PUT",
      body: JSON.stringify({ 
        reason: reason || "Does not meet guidelines" 
      }),
    });
    
    console.log("✅ Review rejected:", review);
    
    return this.normalizeReview(review);
    
  } catch (error: any) {
    console.error(`\n❌ ========================================`);
    console.error(`❌ REJECT FAILED`);
    console.error(`❌ Status: ${error.status}`);
    console.error(`❌ Message: ${error.message}`);
    console.error(`❌ ========================================\n`);
    
    throw error;
  }
}

/**
 * ✅ Delete review as admin - REAL BACKEND
 */
async deleteReviewAdmin(reviewId: number): Promise<void> {
  console.log(`\n🗑️ Deleting review ${reviewId}...`);
  
  try {
    await this.request<void>(`/reviews/${reviewId}`, {
      method: "DELETE",
    });
    
    console.log("✅ Review deleted successfully\n");
    
  } catch (error: any) {
    console.error("❌ Delete failed:", error.message, "\n");
    throw error;
  }
}

  // ============================================
  // 7. FAVORITES
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
  // 8. USER PROFILE
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
  // 9. ADVANCED SEARCH
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
  // 10. ADMIN DASHBOARD
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
  // 11. REPORTS
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
  // 12. PAYMENTS
  // ============================================

  async createPaymentIntent(
    data: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    const mappedData = {
      ...data,
      paymentMethod: this.mapPaymentMethod(data.paymentMethod),
    };

    console.log("💳 Payment Intent Request:", mappedData);

    try {
      const response = await this.request<PaymentIntentResponse>(
        "/payments/create",
        {
          method: "POST",
          body: JSON.stringify(mappedData),
        }
      );

      console.log("✅ Payment Intent Response:", response);
      return response;
    } catch (error) {
      console.error("❌ Payment Intent Error:", error);
      throw error;
    }
  }

  async confirmPayment(
    data: PaymentConfirmRequest
  ): Promise<TransactionResponse> {
    console.log("💳 Confirming Payment:", data);

    try {
      const response = await this.request<TransactionResponse>(
        "/payments/confirm",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      console.log("✅ Payment Confirmed:", response);
      return response;
    } catch (error) {
      console.error("❌ Payment Confirmation Error:", error);
      throw error;
    }
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
  // 13. SUBSCRIPTIONS
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
  // 14. ANALYTICS
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

  /**
 * ✅ Get reviews written by current user (renter)
 */
async getMyReviews(params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<ReviewResponse>> {
  console.log("\n📝 ========================================");
  console.log("📝 FETCHING MY REVIEWS");
  console.log("📝 ========================================\n");
  
  const queryParams: Record<string, string> = {
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 100),
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  };

  const queryString = new URLSearchParams(queryParams).toString();
  
  try {
    const endpoint = `/reviews/my-reviews?${queryString}`;
    console.log(`🔄 API Call: ${this.baseURL}${endpoint}`);
    
    const response = await this.request<any>(endpoint);
    console.log(`✅ Response received:`, response);

    // Handle response structure
    let reviewsData = response;
    
    if (response.data) {
      reviewsData = response.data;
    }
    
    let content: any[] = [];
    let totalElements = 0;
    let totalPages = 0;
    let currentPage = 0;
    let pageSize = 100;

    if (reviewsData.content) {
      content = reviewsData.content;
      totalElements = reviewsData.totalElements || 0;
      totalPages = reviewsData.totalPages || 0;
      currentPage = reviewsData.currentPage || 0;
      pageSize = reviewsData.pageSize || 100;
    } else if (Array.isArray(reviewsData)) {
      content = reviewsData;
      totalElements = reviewsData.length;
      totalPages = 1;
      currentPage = 0;
    }

    console.log(`✅ Processing ${content.length} reviews...`);

    // ✅ Normalize reviews with proper image handling
    const normalizedReviews = content.map((r, index) => {
      try {
        return this.normalizeReview(r);
      } catch (err) {
        console.error(`⚠️ Failed to normalize review ${index}:`, err);
        return null;
      }
    }).filter(r => r !== null) as ReviewResponse[];

    console.log(`✅ Successfully loaded ${normalizedReviews.length} reviews\n`);

    return {
      content: normalizedReviews,
      totalElements: totalElements,
      totalPages: totalPages,
      currentPage: currentPage,
      pageSize: pageSize
    };
    
  } catch (error: any) {
    console.error(`\n❌ ========================================`);
    console.error(`❌ FAILED TO FETCH MY REVIEWS`);
    console.error(`❌ Status: ${error.status}`);
    console.error(`❌ Message: ${error.message}`);
    console.error(`❌ ========================================\n`);
    
    if (error.status === 500) {
      console.warn("⚠️ Server error, returning empty result");
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 100
      };
    }
    
    throw error;
  }
}

/**
 * ✅ Check if a booking can be reviewed
 */
async canReviewBooking(bookingId: number): Promise<{ canReview: boolean; reason?: string }> {
  try {
    return await this.request<{ canReview: boolean; reason?: string }>(
      `/bookings/${bookingId}/can-review`
    );
  } catch (error: any) {
    console.error(`Error checking review eligibility for booking ${bookingId}:`, error);
    return { canReview: false, reason: "Unable to verify review eligibility" };
  }
}

/**
 * ✅ Delete a review
 */
async deleteReview(reviewId: number): Promise<void> {
  console.log(`\n🗑️ Deleting review ${reviewId}...`);
  
  try {
    await this.request<void>(`/reviews/${reviewId}`, {
      method: "DELETE",
    });
    
    console.log("✅ Review deleted successfully\n");
    
  } catch (error: any) {
    console.error("❌ Delete failed:", error.message, "\n");
    throw error;
  }
}

/**
 * ✅ Update an existing review
 */
async updateReview(
  reviewId: number,
  data: ReviewCreateRequest
): Promise<ReviewResponse> {
  console.log(`\n✏️ Updating review ${reviewId}...`);
  
  try {
    const review = await this.request<any>(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    
    console.log("✅ Review updated successfully");
    
    return this.normalizeReview(review);
    
  } catch (error: any) {
    console.error("❌ Update failed:", error.message);
    throw error;
  }
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

export const formatPaymentError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.message.includes("enum")) {
      return "Payment method not supported. Please try again.";
    }
    if (error.message.includes("Booking not found")) {
      return "Booking not found. Please create a new booking.";
    }
    if (error.message.includes("already paid")) {
      return "This booking has already been paid.";
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected payment error occurred";
};




// ============================================
// EXPORTS
// ============================================

export default api;
export { ApiError, ApiClient };

export type {
  ApiResponse,
  AuthResponse,
  RegisterRequest,
  UserProfile,
  PropertyCreateRequest,
  PropertyResponse,
  PropertyBasicInfo,
  PropertyImageResponse,
  ImageUploadResponse,
  BookingCreateRequest,
  BookingResponse,
  AvailabilityResponse,
  ReviewCreateRequest,
  ReviewResponse,
  ReviewStatsResponse,
  ReviewAdminStatsResponse,
  FavoriteResponse,
  FavoriteCheckResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  PhoneVerificationResponse,
  DashboardStatsResponse,
  PendingPropertyResponse,
  ReportCreateRequest,
  ReportResponse,
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentConfirmRequest,
  TransactionResponse,
  RefundRequest,
  SubscriptionPlanResponse,
  SubscribeRequest,
  SubscriptionResponse,
  SubscriptionLimitsResponse,
  PropertyAnalyticsResponse,
  OwnerDashboardResponse,
  PlatformAnalyticsResponse,
  SearchRequest,
  SearchResponse,
  LocationSuggestion,
  PopularLocation,
  PaginatedResponse,
  PaginationResponse,
}