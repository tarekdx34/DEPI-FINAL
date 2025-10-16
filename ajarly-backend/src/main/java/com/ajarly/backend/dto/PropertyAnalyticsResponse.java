package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Response DTO لتحليلات أداء العقار
 * يحتوي على بيانات جاهزة للرسوم البيانية
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyAnalyticsResponse {
    
    private Long propertyId;
    private String propertyTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Summary Metrics
    private SummaryMetrics summary;
    
    // Chart Data
    private List<DailyMetric> viewsOverTime;
    private List<DailyMetric> bookingsOverTime;
    private List<DailyMetric> revenueOverTime;
    private List<DailyMetric> ratingTrend;
    
    // Performance Indicators
    private PerformanceIndicators performance;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryMetrics {
        private Integer totalViews;
        private Integer uniqueViews;
        private Integer totalBookingRequests;
        private Integer totalConfirmedBookings;
        private Integer totalCancellations;
        private BigDecimal totalRevenue;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Integer contactClicks;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyMetric {
        private LocalDate date;
        private Number value; // Can be Integer, BigDecimal, etc.
        private String label; // Optional label for display
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceIndicators {
        private BigDecimal bookingConversionRate; // (confirmed / requests) * 100
        private BigDecimal viewToBookingRate; // (requests / views) * 100
        private BigDecimal averageRevenuePerBooking;
        private BigDecimal occupancyRate; // Percentage of days booked
        private Integer avgResponseTimeHours; // Average time to respond to bookings
    }
}