package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Response DTO للوحة تحكم المالك
 * يعرض ملخص شامل لجميع عقارات المالك
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerDashboardResponse {
    
    // Owner Info
    private Long ownerId;
    private String ownerName;
    
    // Overview Statistics
    private OverviewStats overview;
    
    // Best Performing Property
    private BestProperty bestPerformingProperty;
    
    // Upcoming Bookings
    private List<UpcomingBooking> upcomingBookings;
    
    // Recent Reviews
    private List<RecentReview> recentReviews;
    
    // Revenue Chart
    private List<RevenueData> revenueChart;
    
    // Properties Performance
    private List<PropertyPerformance> propertiesPerformance;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OverviewStats {
        private Integer totalProperties;
        private Integer activeProperties;
        private Integer pendingApprovalProperties;
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        private Integer totalBookings;
        private Integer pendingBookings;
        private Integer upcomingBookings;
        private BigDecimal averageRating;
        private Integer totalReviews;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BestProperty {
        private Long propertyId;
        private String propertyTitle;
        private String propertyImage;
        private BigDecimal totalRevenue;
        private Integer totalBookings;
        private BigDecimal averageRating;
        private Integer totalViews;
        private String performanceReason; // "Highest Revenue", "Most Bookings", etc.
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpcomingBooking {
        private Integer bookingId;
        private String bookingReference;
        private Long propertyId;
        private String propertyTitle;
        private String renterName;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer numberOfGuests;
        private BigDecimal totalPrice;
        private String status;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentReview {
        private Long reviewId;
        private Long propertyId;
        private String propertyTitle;
        private String reviewerName;
        private BigDecimal rating;
        private String reviewText;
        private String reviewDate;
        private Boolean hasResponse;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueData {
        private LocalDate date;
        private BigDecimal revenue;
        private Integer bookings;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PropertyPerformance {
        private Long propertyId;
        private String propertyTitle;
        private Integer totalViews;
        private Integer totalBookings;
        private BigDecimal totalRevenue;
        private BigDecimal averageRating;
        private String status;
    }
}