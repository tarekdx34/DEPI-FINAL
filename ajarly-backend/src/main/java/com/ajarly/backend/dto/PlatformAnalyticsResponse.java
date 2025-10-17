package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Response DTO لتحليلات المنصة بالكامل (Admin Only)
 * يعرض إحصائيات شاملة عن كل نشاطات المنصة
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformAnalyticsResponse {
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Platform Overview
    private PlatformOverview overview;
    
    // Growth Charts
    private List<GrowthMetric> userGrowth;
    private List<GrowthMetric> propertyGrowth;
    private List<GrowthMetric> bookingGrowth;
    private List<GrowthMetric> revenueGrowth;
    
    // Top Locations
    private List<TopLocation> topLocations;
    
    // Popular Property Types
    private List<PropertyTypeStats> popularPropertyTypes;
    
    // User Statistics
    private UserStats userStats;
    
    // Booking Statistics
    private BookingStats bookingStats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlatformOverview {
        private Integer totalUsers;
        private Integer newUsersInPeriod;
        private Integer totalProperties;
        private Integer newPropertiesInPeriod;
        private Integer activeProperties;
        private Integer totalBookings;
        private Integer newBookingsInPeriod;
        private BigDecimal totalRevenue;
        private BigDecimal revenueInPeriod;
        private BigDecimal averagePlatformRating;
        private Integer totalReviews;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GrowthMetric {
        private LocalDate date;
        private Integer count;
        private BigDecimal value; // For revenue
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopLocation {
        private String governorate;
        private String city;
        private Integer propertyCount;
        private Integer bookingCount;
        private BigDecimal totalRevenue;
        private BigDecimal averagePrice;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PropertyTypeStats {
        private String propertyType;
        private Integer count;
        private Integer bookingCount;
        private BigDecimal averagePrice;
        private BigDecimal totalRevenue;
        private BigDecimal averageRating;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserStats {
        private Integer totalRenters;
        private Integer totalLandlords;
        private Integer totalBrokers;
        private Integer activeUsersInPeriod;
        private Integer newRentersInPeriod;
        private Integer newLandlordsInPeriod;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingStats {
        private Integer pendingBookings;
        private Integer confirmedBookings;
        private Integer completedBookings;
        private Integer cancelledBookings;
        private BigDecimal averageBookingValue;
        private BigDecimal conversionRate; // confirmed / total requests
        private Integer averageNightsPerBooking;
    }
}