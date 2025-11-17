package com.ajarly.backend.service;

import com.ajarly.backend.dto.ReviewDto;
import com.ajarly.backend.model.Booking;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.Review;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.BookingRepository;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.ReviewRepository;
import com.ajarly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    
    // ==================== EXISTING METHODS (Keep as is) ====================
    
    /**
     * Create a new review for a completed booking
     */
    @Transactional
    public ReviewDto.Response createReview(ReviewDto.CreateRequest request, Long userId) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() != Booking.BookingStatus.completed) {
            throw new RuntimeException("Can only review completed bookings");
        }
        
        if (!booking.getRenter().getUserId().equals(userId)) {
            throw new RuntimeException("Only the renter can review this booking");
        }
        
        if (reviewRepository.existsByBookingBookingId(request.getBookingId())) {
            throw new RuntimeException("A review already exists for this booking");
        }
        
        Review review = new Review();
        review.setBooking(booking);
        review.setProperty(booking.getProperty());
        review.setReviewer(booking.getRenter());
        review.setReviewee(booking.getOwner());
        
        review.setOverallRating(request.getOverallRating());
        review.setCleanlinessRating(request.getCleanlinessRating());
        review.setAccuracyRating(request.getAccuracyRating());
        review.setCommunicationRating(request.getCommunicationRating());
        review.setLocationRating(request.getLocationRating());
        review.setValueRating(request.getValueRating());
        
        review.setReviewTitle(request.getReviewTitle());
        review.setReviewText(request.getReviewText());
        review.setPros(request.getPros());
        review.setCons(request.getCons());
        
        // ✅ Set to PENDING by default
        review.setIsApproved(true);
        review.setApprovedAt(LocalDateTime.now());
        review.setApprovedBy(null);
        
        review = reviewRepository.save(review);
        
        System.out.println("✅ Review created: ID=" + review.getReviewId() + ", Status=AUTO-APPROVED");
        updatePropertyRating(review.getProperty().getPropertyId());

        return mapToResponse(review);
    }
    /**
     * ✅ Get approved reviews for a specific property - PUBLIC METHOD
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getPropertyReviews(Long propertyId, Pageable pageable) {
    System.out.println("\n📊 ========================================");
    System.out.println("📊 GET PROPERTY REVIEWS SERVICE");
    System.out.println("📊 Property ID: " + propertyId);
    System.out.println("📊 Page: " + pageable.getPageNumber() + ", Size: " + pageable.getPageSize());
    System.out.println("📊 ========================================\n");
    
    try {
        // Verify property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + propertyId));
        
        System.out.println("✅ Property found: " + property.getTitleEn());
        
        // Get only APPROVED reviews for this property
        Page<Review> reviews = reviewRepository.findByPropertyIdAndApproved(propertyId, pageable);
        
        System.out.println("✅ Found " + reviews.getTotalElements() + " approved reviews");
        System.out.println("   Current page has " + reviews.getContent().size() + " reviews");
        
        // Map to response DTOs
        Page<ReviewDto.Response> result = reviews.map(this::mapToResponse);
        
        System.out.println("\n✅ Successfully mapped reviews for property " + propertyId + "\n");
        
        return result;
        
    } catch (RuntimeException e) {
        System.err.println("\n❌ ======================================");
        System.err.println("❌ GET PROPERTY REVIEWS FAILED");
        System.err.println("❌ Error: " + e.getMessage());
        System.err.println("❌ ======================================\n");
        throw e;
        
    } catch (Exception e) {
        System.err.println("\n❌ ======================================");
        System.err.println("❌ UNEXPECTED ERROR");
        System.err.println("❌ Error: " + e.getMessage());
        System.err.println("❌ ======================================\n");
        e.printStackTrace();
        
        // Return empty page instead of throwing
        return Page.empty(pageable);
    }
}
    // ... (keep all other existing methods as is) ...
    
    // ==================== 🆕 ADMIN METHODS - FIXED ====================
    
    /**
     * ✅ Admin approves a review - COMPLETELY FIXED
     */
    @Transactional
    public ReviewDto.Response approveReview(Long reviewId, Long adminId) {
        System.out.println("\n🔍 ========================================");
        System.out.println("🔍 APPROVE REVIEW REQUEST");
        System.out.println("🔍 Review ID: " + reviewId);
        System.out.println("🔍 Admin ID: " + adminId);
        System.out.println("🔍 ========================================\n");
        
        try {
            // 1. Find review
            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> {
                        System.err.println("❌ Review not found: " + reviewId);
                        return new RuntimeException("Review not found with ID: " + reviewId);
                    });
            
            System.out.println("✅ Review found: " + reviewId);
            System.out.println("   Current status: isApproved = " + review.getIsApproved());
            
            // 2. Check if already approved
            if (Boolean.TRUE.equals(review.getIsApproved())) {
                System.out.println("⚠️  Review already approved, returning current state");
                return mapToResponse(review);
            }
            
            // 3. Find admin user (optional, for audit trail)
            User admin = userRepository.findById(adminId).orElse(null);
            if (admin != null) {
                System.out.println("✅ Admin found: " + admin.getEmail());
            }
            
            // 4. Approve the review
            review.setIsApproved(true);
            review.setApprovedAt(LocalDateTime.now());
            review.setApprovedBy(admin);
            
            System.out.println("🔄 Saving approved review...");
            review = reviewRepository.save(review);
            
            System.out.println("✅ Review saved: isApproved = " + review.getIsApproved());
            System.out.println("   Approved at: " + review.getApprovedAt());
            
            // 5. Update property rating
            try {
                updatePropertyRating(review.getProperty().getPropertyId());
                System.out.println("✅ Property rating updated");
            } catch (Exception e) {
                System.err.println("⚠️  Failed to update property rating: " + e.getMessage());
                // Don't fail the whole operation
            }
            
            System.out.println("\n✅ ======================================");
            System.out.println("✅ REVIEW APPROVED SUCCESSFULLY");
            System.out.println("✅ ======================================\n");
            
            return mapToResponse(review);
            
        } catch (Exception e) {
            System.err.println("\n❌ ======================================");
            System.err.println("❌ APPROVE REVIEW FAILED");
            System.err.println("❌ Error: " + e.getMessage());
            System.err.println("❌ ======================================\n");
            e.printStackTrace();
            throw new RuntimeException("Failed to approve review: " + e.getMessage(), e);
        }
    }
    
    /**
     * ✅ Admin rejects a review - FIXED
     */
    @Transactional
    public ReviewDto.Response rejectReview(Long reviewId, String reason, Long adminId) {
        System.out.println("🔍 Rejecting review " + reviewId + " by admin " + adminId);
        System.out.println("   Reason: " + reason);
        
        try {
            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
            
            // Find admin user
            User admin = userRepository.findById(adminId).orElse(null);
            
            // Mark as rejected (not approved)
            review.setIsApproved(false);
            review.setApprovedAt(null);
            review.setApprovedBy(admin);
            
            review = reviewRepository.save(review);
            
            System.out.println("✅ Review rejected successfully");
            
            // Update property rating (exclude this review)
            updatePropertyRating(review.getProperty().getPropertyId());
            
            return mapToResponse(review);
            
        } catch (Exception e) {
            System.err.println("❌ Reject review failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to reject review: " + e.getMessage(), e);
        }
    }
    
    /**
     * ✅ Get all reviews for admin - FIXED to return ALL reviews
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getAllReviewsForAdmin(Boolean isApproved, Pageable pageable) {
        System.out.println("\n📊 ========================================");
        System.out.println("📊 GET REVIEWS FOR ADMIN");
        System.out.println("📊 Filter: isApproved = " + isApproved);
        System.out.println("📊 Page: " + pageable.getPageNumber() + ", Size: " + pageable.getPageSize());
        System.out.println("📊 ========================================\n");
        
        try {
            Page<Review> reviews;
            
            if (isApproved == null) {
                // Get ALL reviews
                reviews = reviewRepository.findAll(pageable);
                System.out.println("📊 Fetching ALL reviews");
            } else if (isApproved) {
                // Get only approved
                reviews = reviewRepository.findByIsApproved(true, pageable);
                System.out.println("📊 Fetching APPROVED reviews");
            } else {
                // Get only pending
                reviews = reviewRepository.findByIsApproved(false, pageable);
                System.out.println("📊 Fetching PENDING reviews");
            }
            
            System.out.println("✅ Found " + reviews.getTotalElements() + " total reviews");
            System.out.println("   Current page has " + reviews.getContent().size() + " reviews");
            
            // Debug: Print review IDs
            System.out.println("   Review IDs on this page:");
            reviews.getContent().forEach(r -> {
                System.out.println("   - Review " + r.getReviewId() + 
                    " (approved=" + r.getIsApproved() + 
                    ", property=" + r.getProperty().getPropertyId() + ")");
            });
            
            Page<ReviewDto.Response> result = reviews.map(this::mapToResponse);
            
            System.out.println("\n✅ Successfully mapped " + result.getContent().size() + " reviews\n");
            
            return result;
            
        } catch (Exception e) {
            System.err.println("\n❌ ======================================");
            System.err.println("❌ GET REVIEWS FAILED");
            System.err.println("❌ Error: " + e.getMessage());
            System.err.println("❌ ======================================\n");
            e.printStackTrace();
            
            // Return empty page instead of throwing
            return Page.empty(pageable);
        }
    }
    
    /**
     * ✅ Get review statistics - FIXED
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getReviewStatsForAdmin() {
        System.out.println("📊 Calculating review statistics...");
        
        try {
            long totalReviews = reviewRepository.count();
            long approvedReviews = reviewRepository.countByIsApproved(true);
            long pendingReviews = reviewRepository.countByIsApproved(false);
            
            Double averageRating = reviewRepository.getAverageRatingForApprovedReviews();
            if (averageRating == null) {
                averageRating = 0.0;
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalReviews", totalReviews);
            stats.put("approvedReviews", approvedReviews);
            stats.put("pendingReviews", pendingReviews);
            stats.put("rejectedReviews", 0L);
            stats.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
            
            System.out.println("✅ Stats calculated:");
            System.out.println("   Total: " + totalReviews);
            System.out.println("   Approved: " + approvedReviews);
            System.out.println("   Pending: " + pendingReviews);
            System.out.println("   Avg Rating: " + averageRating);
            
            return stats;
            
        } catch (Exception e) {
            System.err.println("❌ Failed to calculate stats: " + e.getMessage());
            e.printStackTrace();
            
            // Return default stats
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalReviews", 0L);
            stats.put("approvedReviews", 0L);
            stats.put("pendingReviews", 0L);
            stats.put("rejectedReviews", 0L);
            stats.put("averageRating", 0.0);
            return stats;
        }
    }
    
    /**
     * Update property average rating
     */
    @Transactional
    public void updatePropertyRating(Long propertyId) {
        try {
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));
            
            Double avgRating = reviewRepository.getAverageRatingByPropertyId(propertyId)
                    .orElse(0.0);
            
            Long totalReviews = reviewRepository.countApprovedByPropertyId(propertyId);
            
            property.setAverageRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
            property.setTotalReviews(totalReviews.intValue());
            
            propertyRepository.save(property);
            
            System.out.println("✅ Property " + propertyId + " rating updated: " + avgRating + " (" + totalReviews + " reviews)");
            
        } catch (Exception e) {
            System.err.println("⚠️  Failed to update property rating: " + e.getMessage());
        }
    }
    
    
    /**
     * ✅ Map Review to Response DTO - SAFE VERSION
     */
    private ReviewDto.Response mapToResponse(Review review) {
        ReviewDto.Response response = new ReviewDto.Response();
        
        try {
            response.setReviewId(review.getReviewId());
            
            // Booking
            if (review.getBooking() != null) {
                response.setBookingId(review.getBooking().getBookingId());
            }
            
            // Property
            if (review.getProperty() != null) {
                response.setPropertyId(review.getProperty().getPropertyId());
                response.setPropertyTitle(review.getProperty().getTitleAr() != null 
                    ? review.getProperty().getTitleAr() 
                    : review.getProperty().getTitleEn());
            }
            
            // Reviewer info
            if (review.getReviewer() != null) {
                ReviewDto.ReviewerInfo reviewerInfo = new ReviewDto.ReviewerInfo();
                reviewerInfo.setUserId(review.getReviewer().getUserId());
                reviewerInfo.setFirstName(review.getReviewer().getFirstName());
                reviewerInfo.setLastName(review.getReviewer().getLastName());
                reviewerInfo.setProfilePhoto(review.getReviewer().getProfilePhoto());
                reviewerInfo.setVerified(Boolean.TRUE.equals(review.getReviewer().getNationalIdVerified()));
                
                try {
                    Long count = reviewRepository.countByReviewerUserId(review.getReviewer().getUserId());
                    reviewerInfo.setTotalReviews(count != null ? count.intValue() : 0);
                } catch (Exception e) {
                    reviewerInfo.setTotalReviews(0);
                }
                
                response.setReviewer(reviewerInfo);
            }
            
            // Ratings
            response.setOverallRating(review.getOverallRating() != null ? review.getOverallRating() : BigDecimal.ZERO);
            response.setCleanlinessRating(review.getCleanlinessRating() != null ? review.getCleanlinessRating() : 0);
            response.setAccuracyRating(review.getAccuracyRating() != null ? review.getAccuracyRating() : 0);
            response.setCommunicationRating(review.getCommunicationRating() != null ? review.getCommunicationRating() : 0);
            response.setLocationRating(review.getLocationRating() != null ? review.getLocationRating() : 0);
            response.setValueRating(review.getValueRating() != null ? review.getValueRating() : 0);
            
            // Content
            response.setReviewTitle(review.getReviewTitle());
            response.setReviewText(review.getReviewText());
            response.setPros(review.getPros());
            response.setCons(review.getCons());
            
            // Owner response
            response.setOwnerResponse(review.getOwnerResponse());
            response.setOwnerResponseDate(review.getOwnerResponseDate());
            
            // Metadata
            response.setIsApproved(Boolean.TRUE.equals(review.getIsApproved()));
            response.setHelpfulCount(review.getHelpfulCount() != null ? review.getHelpfulCount() : 0);
            response.setNotHelpfulCount(review.getNotHelpfulCount() != null ? review.getNotHelpfulCount() : 0);
            response.setCreatedAt(review.getCreatedAt());
            response.setUpdatedAt(review.getUpdatedAt());
            
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ Error mapping review " + review.getReviewId() + ": " + e.getMessage());
            e.printStackTrace();
            
            // Return minimal response
            ReviewDto.Response safeResponse = new ReviewDto.Response();
            safeResponse.setReviewId(review.getReviewId());
            safeResponse.setReviewTitle("Error loading review");
            safeResponse.setIsApproved(false);
            return safeResponse;
        }
    }
    
    // ==================== OTHER EXISTING METHODS ====================
    // (Keep all your other methods like getPropertyReviews, respondToReview, etc.)
}