package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity لتتبع الأداء اليومي للعقارات
 * يتم حسابه تلقائياً كل يوم في الساعة 1 صباحاً
 */
@Entity
@Table(name = "property_performance_analytics", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"property_id", "analytics_date"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyPerformanceAnalytics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "performance_id")  // ✅ Changed from analytics_id to performance_id
    private Long performanceId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @Column(name = "analytics_date", nullable = false)
    private LocalDate analyticsDate;
    
    // View Metrics
    @Column(name = "total_views", nullable = false)
    private Integer totalViews = 0;
    
    @Column(name = "unique_views", nullable = false)
    private Integer uniqueViews = 0;
    
    // Booking Metrics
    @Column(name = "booking_requests", nullable = false)
    private Integer bookingRequests = 0;
    
    @Column(name = "booking_confirmations", nullable = false)
    private Integer bookingConfirmations = 0;
    
    @Column(name = "booking_cancellations", nullable = false)
    private Integer bookingCancellations = 0;
    
    @Column(name = "booking_rejections", nullable = false)
    private Integer bookingRejections = 0;
    
    // Revenue Metrics
    @Column(name = "revenue", precision = 10, scale = 2)
    private BigDecimal revenue = BigDecimal.ZERO;
    
    @Column(name = "potential_revenue", precision = 10, scale = 2)
    private BigDecimal potentialRevenue = BigDecimal.ZERO;
    
    // Rating Metrics
    @Column(name = "new_reviews", nullable = false)
    private Integer newReviews = 0;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    // Contact Metrics
    @Column(name = "contact_clicks", nullable = false)
    private Integer contactClicks = 0;
    
    @Column(name = "image_views", nullable = false)
    private Integer imageViews = 0;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}