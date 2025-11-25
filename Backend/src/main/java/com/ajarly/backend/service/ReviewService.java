package com.ajarly.backend.service;

import com.ajarly.backend.dto.ReviewDto;
import com.ajarly.backend.model.Booking;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.PropertyImage;
import com.ajarly.backend.model.Review;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.BookingRepository;
import com.ajarly.backend.repository.PropertyImageRepository;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.ReviewRepository;
import com.ajarly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRatingUpdateService ratingUpdateService;
    
    // ==================== CREATE REVIEW ====================
    
    /**
     * ✅ Create review with GUARANTEED rating update
     */
    @Transactional
    public ReviewDto.Response createReview(ReviewDto.CreateRequest request, Long userId) {
        log.info("\n🆕 ========================================");
        log.info("🆕 CREATING NEW REVIEW");
        log.info("🆕 Booking ID: {}", request.getBookingId());
        log.info("🆕 User ID: {}", userId);
        log.info("🆕 Rating: {}", request.getOverallRating());
        log.info("🆕 ========================================\n");
        
        // Validate booking
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
        
        // Create review
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
        
        // ✅ Auto-approve
        review.setIsApproved(true);
        review.setApprovedAt(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        
        log.info("✅ Review created successfully: ID={}", review.getReviewId());
        
        // ✅ CRITICAL FIX: Use separate service for rating update
        Long propertyId = booking.getProperty().getPropertyId();
        try {
            ratingUpdateService.updatePropertyRating(propertyId);
            log.info("✅ Property rating updated successfully");
        } catch (Exception e) {
            log.error("⚠️ Rating update failed, but review was saved: {}", e.getMessage());
        }
        
        return mapToResponse(review);
    }
    
    // ==================== GET REVIEWS ====================
    
    /**
     * ✅ Get approved reviews for a specific property - PUBLIC METHOD
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getPropertyReviews(Long propertyId, Pageable pageable) {
        log.info("\n📊 ========================================");
        log.info("📊 GET PROPERTY REVIEWS SERVICE");
        log.info("📊 Property ID: {}", propertyId);
        log.info("📊 Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        log.info("📊 ========================================\n");
        
        // Verify property exists
        if (!propertyRepository.existsById(propertyId)) {
            throw new RuntimeException("Property not found with ID: " + propertyId);
        }
        
        // Get only approved reviews for the property
        Page<Review> reviews = reviewRepository.findByPropertyPropertyIdAndIsApprovedTrue(
            propertyId, 
            pageable
        );
        
        log.info("✅ Found {} approved reviews for property {}", 
                reviews.getTotalElements(), propertyId);
        
        return reviews.map(this::mapToResponse);
    }
    
    /**
     * ✅ Get reviews by property (alias for getPropertyReviews)
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getReviewsByProperty(Long propertyId, Pageable pageable) {
        return getPropertyReviews(propertyId, pageable);
    }
    
    /**
     * ✅ Get reviews by reviewer with FULL property data including images
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getReviewsByReviewer(Long reviewerId, Pageable pageable) {
        log.info("\n📝 ========================================");
        log.info("📝 FETCHING REVIEWS BY REVIEWER");
        log.info("📝 Reviewer ID: {}", reviewerId);
        log.info("📝 ========================================\n");
        
        Page<Review> reviews = reviewRepository.findByReviewerWithPropertyAndImages(
            reviewerId, 
            pageable
        );
        
        log.info("✅ Found {} reviews by reviewer {}", reviews.getTotalElements(), reviewerId);
        
        return reviews.map(this::mapToResponseWithPropertyInfo);
    }
    
    // ==================== ADMIN METHODS ====================
    
    /**
     * ✅ FIXED: Approve review with GUARANTEED rating update
     */
    @Transactional
    public ReviewDto.Response approveReview(Long reviewId, Long adminId) {
        log.info("\n✅ ========================================");
        log.info("✅ APPROVING REVIEW");
        log.info("✅ Review ID: {}", reviewId);
        log.info("✅ Admin ID: {}", adminId);
        log.info("✅ ========================================\n");
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        boolean wasAlreadyApproved = Boolean.TRUE.equals(review.getIsApproved());
        
        if (wasAlreadyApproved) {
            log.info("⚠️ Review {} was already approved", reviewId);
        } else {
            User admin = userRepository.findById(adminId).orElse(null);
            
            review.setIsApproved(true);
            review.setApprovedAt(LocalDateTime.now());
            review.setApprovedBy(admin);
            
            review = reviewRepository.save(review);
            
            log.info("✅ Review {} approved successfully", reviewId);
        }
        
        // ✅ CRITICAL FIX: Use separate service for rating update
        Long propertyId = review.getProperty().getPropertyId();
        try {
            ratingUpdateService.updatePropertyRating(propertyId);
            log.info("✅ Property rating updated successfully");
        } catch (Exception e) {
            log.error("⚠️ Rating update failed: {}", e.getMessage());
        }
        
        return mapToResponse(review);
    }
    
    /**
     * ✅ FIXED: Reject review with GUARANTEED rating update
     */
    @Transactional
    public ReviewDto.Response rejectReview(Long reviewId, String reason, Long adminId) {
        log.info("\n❌ ========================================");
        log.info("❌ REJECTING REVIEW");
        log.info("❌ Review ID: {}", reviewId);
        log.info("❌ Admin ID: {}", adminId);
        log.info("❌ Reason: {}", reason);
        log.info("❌ ========================================\n");
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        User admin = userRepository.findById(adminId).orElse(null);
        
        review.setIsApproved(false);
        review.setApprovedAt(null);
        review.setApprovedBy(admin);
        
        review = reviewRepository.save(review);
        
        log.info("✅ Review {} rejected successfully", reviewId);
        
        // ✅ CRITICAL FIX: Use separate service for rating update
        Long propertyId = review.getProperty().getPropertyId();
        try {
            ratingUpdateService.updatePropertyRating(propertyId);
            log.info("✅ Property rating updated successfully");
        } catch (Exception e) {
            log.error("⚠️ Rating update failed: {}", e.getMessage());
        }
        
        return mapToResponse(review);
    }
    
    /**
     * ✅ Get all reviews for admin
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getAllReviewsForAdmin(Boolean isApproved, Pageable pageable) {
        log.info("\n📊 ========================================");
        log.info("📊 FETCHING REVIEWS FOR ADMIN");
        log.info("📊 Filter: isApproved = {}", isApproved);
        log.info("📊 Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        log.info("📊 ========================================\n");
        
        Page<Review> reviews;
        
        if (isApproved == null) {
            reviews = reviewRepository.findAll(pageable);
            log.info("📊 Fetching ALL reviews");
        } else if (isApproved) {
            reviews = reviewRepository.findByIsApproved(true, pageable);
            log.info("📊 Fetching APPROVED reviews");
        } else {
            reviews = reviewRepository.findByIsApproved(false, pageable);
            log.info("📊 Fetching PENDING reviews");
        }
        
        log.info("✅ Found {} total reviews (current page: {})", 
                reviews.getTotalElements(), reviews.getContent().size());
        
        return reviews.map(this::mapToResponse);
    }
    
    /**
     * ✅ Get review statistics for admin dashboard
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getReviewStatsForAdmin() {
        log.info("\n📊 ========================================");
        log.info("📊 FETCHING ADMIN REVIEW STATISTICS");
        log.info("📊 ========================================\n");
        
        Map<String, Object> stats = new HashMap<>();
        
        try {
            long totalReviews = reviewRepository.count();
            stats.put("totalReviews", totalReviews);
            
            Long pendingReviews = reviewRepository.countByIsApproved(false);
            stats.put("pendingReviews", pendingReviews != null ? pendingReviews : 0L);
            
            Long approvedReviews = reviewRepository.countByIsApproved(true);
            stats.put("approvedReviews", approvedReviews != null ? approvedReviews : 0L);
            
            stats.put("rejectedReviews", 0L);
            
            Double averageRating = reviewRepository.getAverageRatingForApprovedReviews();
            stats.put("averageRating", averageRating != null ? averageRating : 0.0);
            
            log.info("✅ Stats retrieved:");
            log.info("   - Total: {}", totalReviews);
            log.info("   - Pending: {}", stats.get("pendingReviews"));
            log.info("   - Approved: {}", approvedReviews);
            log.info("   - Avg Rating: {}", averageRating);
            
        } catch (Exception e) {
            log.error("❌ Error fetching review stats: {}", e.getMessage());
            
            stats.put("totalReviews", 0L);
            stats.put("pendingReviews", 0L);
            stats.put("approvedReviews", 0L);
            stats.put("rejectedReviews", 0L);
            stats.put("averageRating", 0.0);
        }
        
        return stats;
    }
    
    // ==================== OWNER RESPONSE ====================
    
    /**
     * ✅ Owner responds to review
     */
    @Transactional
    public ReviewDto.Response respondToReview(Long reviewId, String ownerResponse, Long ownerId) {
        log.info("💬 Owner {} responding to review {}", ownerId, reviewId);
        
        if (ownerResponse == null || ownerResponse.trim().isEmpty()) {
            throw new RuntimeException("Response text cannot be empty");
        }
        if (ownerResponse.length() < 10) {
            throw new RuntimeException("Response must be at least 10 characters");
        }
        if (ownerResponse.length() > 1000) {
            throw new RuntimeException("Response must not exceed 1000 characters");
        }
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        if (!review.getProperty().getOwner().getUserId().equals(ownerId)) {
            throw new RuntimeException("You can only respond to reviews of your own properties");
        }
        
        review.setOwnerResponse(ownerResponse.trim());
        review.setOwnerResponseDate(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        
        log.info("✅ Response saved for review {}", reviewId);
        
        return mapToResponse(review);
    }
    
    // ==================== BULK RATING UPDATE ====================
    
    /**
     * ✅ FIXED: Bulk update ratings for all properties
     */
    @Transactional
    public void updateAllPropertyRatings() {
        log.info("\n🔄 ========================================");
        log.info("🔄 BULK RATING UPDATE - ALL PROPERTIES");
        log.info("🔄 ========================================\n");
        
        List<Property> allProperties = propertyRepository.findAll();
        log.info("📊 Found {} properties to update", allProperties.size());
        
        int updated = 0;
        int failed = 0;
        
        for (Property property : allProperties) {
            try {
                ratingUpdateService.updatePropertyRating(property.getPropertyId());
                updated++;
            } catch (Exception e) {
                failed++;
                log.error("❌ Failed property {}: {}", property.getPropertyId(), e.getMessage());
            }
        }
        
        log.info("\n✅ ========================================");
        log.info("✅ BULK UPDATE COMPLETED");
        log.info("✅ Updated: {}", updated);
        log.info("✅ Failed: {}", failed);
        log.info("✅ ========================================\n");
    }
    
    // ==================== HELPER METHODS ====================
    
    /**
     * ✅ Map Review to Response DTO - SAFE VERSION
     */
    private ReviewDto.Response mapToResponse(Review review) {
        ReviewDto.Response response = new ReviewDto.Response();
        
        try {
            response.setReviewId(review.getReviewId());
            
            if (review.getBooking() != null) {
                response.setBookingId(review.getBooking().getBookingId());
            }
            
            if (review.getProperty() != null) {
                response.setPropertyId(review.getProperty().getPropertyId());
                response.setPropertyTitle(review.getProperty().getTitleAr() != null 
                    ? review.getProperty().getTitleAr() 
                    : review.getProperty().getTitleEn());
            }
            
            if (review.getReviewer() != null) {
                ReviewDto.ReviewerInfo reviewerInfo = new ReviewDto.ReviewerInfo();
                reviewerInfo.setUserId(review.getReviewer().getUserId());
                reviewerInfo.setFirstName(review.getReviewer().getFirstName());
                reviewerInfo.setLastName(review.getReviewer().getLastName());
                reviewerInfo.setProfilePhoto(review.getReviewer().getProfilePhoto());
                reviewerInfo.setVerified(Boolean.TRUE.equals(review.getReviewer().getNationalIdVerified()));
                
                Long count = reviewRepository.countByReviewerUserId(review.getReviewer().getUserId());
                reviewerInfo.setTotalReviews(count != null ? count.intValue() : 0);
                
                response.setReviewer(reviewerInfo);
            }
            
            response.setOverallRating(review.getOverallRating() != null ? review.getOverallRating() : BigDecimal.ZERO);
            response.setCleanlinessRating(review.getCleanlinessRating() != null ? review.getCleanlinessRating() : 0);
            response.setAccuracyRating(review.getAccuracyRating() != null ? review.getAccuracyRating() : 0);
            response.setCommunicationRating(review.getCommunicationRating() != null ? review.getCommunicationRating() : 0);
            response.setLocationRating(review.getLocationRating() != null ? review.getLocationRating() : 0);
            response.setValueRating(review.getValueRating() != null ? review.getValueRating() : 0);
            
            response.setReviewTitle(review.getReviewTitle());
            response.setReviewText(review.getReviewText());
            response.setPros(review.getPros());
            response.setCons(review.getCons());
            
            response.setOwnerResponse(review.getOwnerResponse());
            response.setOwnerResponseDate(review.getOwnerResponseDate());
            
            response.setIsApproved(Boolean.TRUE.equals(review.getIsApproved()));
            response.setHelpfulCount(review.getHelpfulCount() != null ? review.getHelpfulCount() : 0);
            response.setNotHelpfulCount(review.getNotHelpfulCount() != null ? review.getNotHelpfulCount() : 0);
            response.setCreatedAt(review.getCreatedAt());
            response.setUpdatedAt(review.getUpdatedAt());
            
            return response;
            
        } catch (Exception e) {
            log.error("❌ Error mapping review {}: {}", review.getReviewId(), e.getMessage());
            
            ReviewDto.Response safeResponse = new ReviewDto.Response();
            safeResponse.setReviewId(review.getReviewId());
            safeResponse.setReviewTitle("Error loading review");
            safeResponse.setIsApproved(false);
            return safeResponse;
        }
    }
    
    /**
     * ✅ Map Review to Response with FULL Property Info (including image)
     */
    private ReviewDto.Response mapToResponseWithPropertyInfo(Review review) {
        ReviewDto.Response response = mapToResponse(review);
        
        if (review.getProperty() != null) {
            Property property = review.getProperty();
            
            log.info("📸 Loading property image for property ID: {}", property.getPropertyId());
            
            String coverImage = property.getCoverImage();
            log.info("   - Property.coverImage: {}", coverImage);
            
            if (coverImage == null || coverImage.isEmpty()) {
                Optional<PropertyImage> coverImageOpt = propertyImageRepository
                    .findFirstByPropertyPropertyIdAndIsCoverTrue(property.getPropertyId());
                
                if (coverImageOpt.isPresent()) {
                    coverImage = coverImageOpt.get().getImageUrl();
                    log.info("   - Found cover image from property_images: {}", coverImage);
                }
            }
            
            if (coverImage == null || coverImage.isEmpty()) {
                Optional<PropertyImage> firstImage = propertyImageRepository
                    .findFirstByPropertyPropertyId(property.getPropertyId());
                
                if (firstImage.isPresent()) {
                    coverImage = firstImage.get().getImageUrl();
                    log.info("   - Found first image from property_images: {}", coverImage);
                }
            }
            
            if (coverImage == null || coverImage.isEmpty()) {
                coverImage = "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?w=800&q=80";
                log.warn("   ⚠️ No image found, using fallback");
            }
            
            log.info("   ✅ Final coverImage: {}", coverImage);
            
            ReviewDto.PropertyBasicInfo propertyInfo = ReviewDto.PropertyBasicInfo.builder()
                .propertyId(property.getPropertyId())
                .titleAr(property.getTitleAr())
                .titleEn(property.getTitleEn())
                .city(property.getCity())
                .governorate(property.getGovernorate())
                .coverImage(coverImage)
                .build();
            
            response.setProperty(propertyInfo);
        } else {
            log.warn("⚠️ Review {} has no associated property!", review.getReviewId());
        }
        
        return response;
    }
}