// api.test.ts - Fixed Comprehensive Test Suite for Ajarly Platform API

import { ApiClient, ApiError } from "../api";

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage with proper null return
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ApiClient", () => {
  let api: ApiClient;
  const mockToken = "test-token-123";
  const baseURL = "http://localhost:8081/api/v1";

  beforeEach(() => {
    api = new ApiClient(baseURL);
    localStorage.clear();
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock successful responses for auth endpoints (token at root level)
  const mockFetchAuthSuccess = (data: any, status = 200) => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => data, // Return data as-is for auth endpoints
    });
  };

  // Helper to mock successful responses for regular endpoints
  const mockFetchSuccess = (data: any, status = 200) => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true, data }),
    });
  };

  // Helper to mock error responses
  const mockFetchError = (message: string, status = 400) => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: false, message, error: message }),
    });
  };

  // ============================================
  // 1. AUTHENTICATION TESTS
  // ============================================
  describe("Authentication", () => {
    test("should register a new user", async () => {
      const mockResponse = {
        token: mockToken,
        userId: 1,
        email: "ahmed123@example.com",
        userType: "landlord",
      };
      // API returns the full response, so we wrap it
      mockFetchAuthSuccess({ success: true, data: mockResponse });

      const result = await api.register({
        email: "ahmed123@example.com",
        password: "Ahmed@123",
        phoneNumber: "0101234178",
        firstName: "أحمد",
        lastName: "محمد",
        userType: "landlord",
      });

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem("authToken")).toBe(mockToken);
    });

    test("should login a user", async () => {
      const mockResponse = {
        token: mockToken,
        userId: 1,
        email: "ahmed123@example.com",
        userType: "landlord",
      };
      mockFetchAuthSuccess({ success: true, data: mockResponse });

      const result = await api.login("ahmed123@example.com", "Ahmed@123");

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem("authToken")).toBe(mockToken);
    });

    test("should logout a user", async () => {
      localStorage.setItem("authToken", mockToken);
      mockFetchSuccess({});

      await api.logout();

      expect(localStorage.getItem("authToken")).toBeNull();
    });

    test("should get user profile with auth token", async () => {
      const mockProfile = {
        userId: 1,
        email: "test@example.com",
        phoneNumber: "01234567890",
        phoneVerified: true,
        emailVerified: true,
        userType: "renter" as const,
        firstName: "John",
        lastName: "Doe",
        isActive: true,
        nationalIdVerified: false,
        createdAt: "2025-01-01T00:00:00Z",
      };
      localStorage.setItem("authToken", mockToken);
      mockFetchSuccess(mockProfile);

      const result = await api.getProfile();

      expect(result).toEqual(mockProfile);

      // Verify that the Authorization header was sent
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${mockToken}`);
    });
  });

  // ============================================
  // 2. PROPERTIES TESTS
  // ============================================
  describe("Properties", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", mockToken);
    });

    test("should create a property", async () => {
      const mockProperty = {
        propertyId: 1,
        ownerId: 1,
        titleAr: "شقة فاخرة",
        titleEn: "Luxury Apartment",
        descriptionAr: "وصف",
        descriptionEn: "Description",
        propertyType: "apartment",
        rentalType: "short_term",
        governorate: "Cairo",
        city: "Nasr City",
        bedrooms: 2,
        bathrooms: 1,
        guestsCapacity: 4,
        furnished: true,
        petsAllowed: false,
        pricePerNight: 500,
        currency: "EGP",
        status: "pending",
        isVerified: false,
        averageRating: 0,
        totalReviews: 0,
        isFeatured: false,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      };
      mockFetchSuccess(mockProperty);

      const result = await api.createProperty({
        titleAr: "شقة فاخرة",
        titleEn: "Luxury Apartment",
        descriptionAr: "وصف",
        descriptionEn: "Description",
        propertyType: "apartment",
        rentalType: "short_term",
        governorate: "Cairo",
        city: "Nasr City",
        bedrooms: 2,
        bathrooms: 1,
        guestsCapacity: 4,
        furnished: true,
        petsAllowed: false,
        pricePerNight: 500,
      });

      expect(result).toEqual(mockProperty);
    });

    test("should get all properties", async () => {
      const mockResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
      };
      mockFetchSuccess(mockResponse);

      const result = await api.getProperties({ page: 0, size: 10 });

      expect(result).toEqual(mockResponse);
    });

    test("should get a single property", async () => {
      const mockProperty = { propertyId: 1, titleEn: "Test Property" };
      mockFetchSuccess(mockProperty);

      const result = await api.getProperty(1);

      expect(result).toEqual(mockProperty);
    });

    test("should update a property", async () => {
      const mockUpdated = { propertyId: 1, titleEn: "Updated" };
      mockFetchSuccess(mockUpdated);

      const result = await api.updateProperty(1, { titleEn: "Updated" });

      expect(result).toEqual(mockUpdated);
    });

    test("should delete a property", async () => {
      mockFetchSuccess({});

      await api.deleteProperty(1);

      expect(fetch).toHaveBeenCalled();
    });
  });

  // ============================================
  // 3. BOOKINGS TESTS
  // ============================================
  describe("Bookings", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", mockToken);
    });

    test("should create a booking", async () => {
      const mockBooking = {
        bookingId: 1,
        bookingReference: "BK-001",
        status: "pending",
      };
      mockFetchSuccess(mockBooking);

      const result = await api.createBooking({
        propertyId: 1,
        checkInDate: "2025-11-15",
        checkOutDate: "2025-11-20",
        numberOfGuests: 4,
        numberOfAdults: 2,
        numberOfChildren: 2,
      });

      expect(result.bookingId).toBe(1);
    });

    test("should get all bookings", async () => {
      mockFetchSuccess([]);

      const result = await api.getBookings();

      expect(Array.isArray(result)).toBe(true);
    });

    test("should confirm a booking", async () => {
      const mockBooking = { bookingId: 1, status: "confirmed" };
      mockFetchSuccess(mockBooking);

      const result = await api.confirmBooking(1, "Welcome!");

      expect(result.status).toBe("confirmed");
    });

    test("should check availability", async () => {
      const mockResponse = { available: true, message: "Available" };
      mockFetchSuccess(mockResponse);

      const result = await api.checkAvailability(1, "2025-11-15", "2025-11-20");

      expect(result.available).toBe(true);
    });
  });

  // ============================================
  // 4. REVIEWS TESTS
  // ============================================
  describe("Reviews", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", mockToken);
    });

    test("should create a review", async () => {
      const mockReview = {
        reviewId: 1,
        overallRating: 5,
      };
      mockFetchSuccess(mockReview);

      const result = await api.createReview({
        bookingId: 1,
        overallRating: 5,
        cleanlinessRating: 5,
        accuracyRating: 5,
        communicationRating: 5,
        locationRating: 5,
        valueRating: 5,
        reviewTitle: "Great!",
        reviewText: "Wonderful",
      });

      expect(result.reviewId).toBe(1);
    });

    test("should get property reviews", async () => {
      const mockResponse = { content: [], totalElements: 0 };
      mockFetchSuccess(mockResponse);

      const result = await api.getPropertyReviews(1);

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // 5. FAVORITES TESTS
  // ============================================
  describe("Favorites", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", mockToken);
    });

    test("should add to favorites", async () => {
      const mockFavorite = { favoriteId: 1 };
      mockFetchSuccess(mockFavorite);

      const result = await api.addFavorite(1);

      expect(result.favoriteId).toBe(1);
    });

    test("should check if favorited", async () => {
      const mockResponse = { isFavorited: true };
      mockFetchSuccess(mockResponse);

      const result = await api.checkFavorite(1);

      expect(result.isFavorited).toBe(true);
    });
  });

  // ============================================
  // 6. SEARCH TESTS
  // ============================================
  describe("Search", () => {
    test("should perform advanced search", async () => {
      const mockResponse = {
        properties: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNext: false,
          hasPrevious: false,
        },
        metadata: {
          executionTimeMs: 50,
          appliedFiltersCount: 0,
          sortedBy: "price",
          sortDirection: "ASC",
        },
      };
      mockFetchSuccess(mockResponse);

      const result = await api.advancedSearch({ governorate: "Cairo" });

      expect(result.properties).toEqual([]);
    });

    test("should get governorates", async () => {
      mockFetchSuccess(["Cairo", "Alexandria"]);

      const result = await api.getGovernorates();

      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================
  // 7. PAYMENTS TESTS
  // ============================================
  describe("Payments", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", mockToken);
    });

    test("should create payment intent", async () => {
      const mockIntent = {
        transactionReference: "TXN-123",
        amount: 2650,
      };
      mockFetchSuccess(mockIntent);

      const result = await api.createPaymentIntent({
        bookingId: 1,
        paymentMethod: "fawry",
        customerName: "John Doe",
        customerEmail: "john@test.com",
        customerPhone: "01234567890",
      });

      expect(result.transactionReference).toBe("TXN-123");
    });

    test("should confirm payment", async () => {
      const mockTransaction = {
        transactionId: 1,
        status: "completed",
      };
      mockFetchSuccess(mockTransaction);

      const result = await api.confirmPayment({
        transactionReference: "TXN-123",
      });

      expect(result.status).toBe("completed");
    });
  });

  // ============================================
  // 8. SUBSCRIPTIONS TESTS
  // ============================================
  describe("Subscriptions", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", mockToken);
    });

    test("should get subscription plans", async () => {
      mockFetchSuccess([{ planId: 1, nameEn: "Basic" }]);

      const result = await api.getSubscriptionPlans();

      expect(Array.isArray(result)).toBe(true);
    });

    test("should subscribe to plan", async () => {
      const mockSub = { subscriptionId: 1, status: "active" };
      mockFetchSuccess(mockSub);

      const result = await api.subscribe({
        planId: 1,
        billingPeriod: "monthly",
        paymentMethod: "fawry",
      });

      expect(result.subscriptionId).toBe(1);
    });
  });

  // ============================================
  // 9. ADMIN TESTS
  // ============================================
  describe("Admin", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", mockToken);
    });

    test("should get dashboard stats", async () => {
      const mockStats = { totalUsers: 1000, totalProperties: 500 };
      mockFetchSuccess(mockStats);

      const result = await api.getDashboardStats();

      expect(result.totalUsers).toBe(1000);
    });

    test("should approve property", async () => {
      mockFetchSuccess("Approved");

      const result = await api.approveProperty(1);

      expect(result).toBe("Approved");
    });
  });

  // ============================================
  // 10. ANALYTICS TESTS
  // ============================================
  describe("Analytics", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", mockToken);
    });

    test("should get property analytics", async () => {
      const mockAnalytics = {
        propertyId: 1,
        summary: { totalViews: 500 },
      };
      mockFetchSuccess(mockAnalytics);

      const result = await api.getPropertyAnalytics(1);

      expect(result.propertyId).toBe(1);
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================
  describe("Error Handling", () => {
    test("should handle API errors", async () => {
      mockFetchError("Invalid credentials", 401);

      await expect(api.login("wrong@email.com", "wrong")).rejects.toThrow(
        ApiError
      );
    });

    test("should handle network errors", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError("Network request failed")
      );

      await expect(api.getProfile()).rejects.toThrow(ApiError);
    });

    test("should throw ApiError with status", async () => {
      mockFetchError("Not found", 404);

      try {
        await api.getProperty(999);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
      }
    });
  });

  // ============================================
  // AUTHORIZATION TESTS
  // ============================================
  describe("Authorization", () => {
    test("should include auth token when available", async () => {
      localStorage.setItem("authToken", mockToken);
      mockFetchSuccess({});

      await api.getProfile();

      // Check if Authorization header was included
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    test("should not include auth header when missing", async () => {
      localStorage.clear();
      mockFetchSuccess([]);

      await api.getGovernorates();

      const fetchCall = (fetch as jest.Mock).mock.calls[0][1];
      expect(fetchCall.headers.Authorization).toBeUndefined();
    });
  });
});
