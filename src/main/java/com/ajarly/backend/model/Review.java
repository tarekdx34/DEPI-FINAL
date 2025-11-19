package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ✅ FINAL VERSION - Review Entity
 * Fixed: Auto-approve reviews by default
 */
@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee; // Owner being reviewed
    
    // ============================================
    // RATINGS (1-5)
    // ============================================
    
    @Column(name = "overall_rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal overallRating;
    
    @Column(name = "cleanliness_rating")
    private Integer cleanlinessRating;
    
    @Column(name = "accuracy_rating")
    private Integer accuracyRating;
    
    @Column(name = "communication_rating")
    private Integer communicationRating;
    
    @Column(name = "location_rating")
    private Integer locationRating;
    
    @Column(name = "value_rating")
    private Integer valueRating;
    
    // ============================================
    // REVIEW CONTENT
    // ============================================
    
    @Column(name = "review_title", length = 255)
    private String reviewTitle;
    
    @Column(name = "review_text", columnDefinition = "TEXT", nullable = false)
    private String reviewText;
    
    @Column(columnDefinition = "TEXT")
    private String pros;
    
    @Column(columnDefinition = "TEXT")
    private String cons;
    
    // ============================================
    // OWNER RESPONSE
    // ============================================
    
    @Column(name = "owner_response", columnDefinition = "TEXT")
    private String ownerResponse;
    
    @Column(name = "owner_response_date")
    private LocalDateTime ownerResponseDate;
    
    // ============================================
    // MODERATION
    // ✅ CRITICAL FIX: Default to TRUE for auto-approval
    // ============================================
    
    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = true;  // 👈 Changed from false to true
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    // ============================================
    // ANALYTICS
    // ============================================
    
    @Column(name = "helpful_count")
    private Integer helpfulCount = 0;
    
    @Column(name = "not_helpful_count")
    private Integer notHelpfulCount = 0;
    
    // ============================================
    // TIMESTAMPS
    // ============================================
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    /**
     * Check if review is within 14 days of checkout
     */
    public boolean isWithinReviewWindow(LocalDateTime checkoutDate) {
        if (checkoutDate == null) return false;
        LocalDateTime reviewDeadline = checkoutDate.plusDays(14);
        return LocalDateTime.now().isBefore(reviewDeadline);
    }
    
    /**
     * Check if owner has responded
     */
    public boolean hasOwnerResponse() {
        return ownerResponse != null && !ownerResponse.trim().isEmpty();
    }
    
    /**
     * Calculate helpfulness ratio
     */
    public double getHelpfulnessRatio() {
        int total = (helpfulCount != null ? helpfulCount : 0) + 
                   (notHelpfulCount != null ? notHelpfulCount : 0);
        if (total == 0) return 0.0;
        return (double) (helpfulCount != null ? helpfulCount : 0) / total;
    }
}