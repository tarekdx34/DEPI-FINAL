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
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    
    /**
     * Create a new review for a completed booking
     */
    @Transactional
    public ReviewDto.Response createReview(ReviewDto.CreateRequest request, Long userId) {
        // 1. Verify booking exists
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + request.getBookingId()));
        
        // 2. Verify booking is COMPLETED
        if (booking.getStatus() != Booking.BookingStatus.completed) {
            throw new RuntimeException("Can only review completed bookings. Current status: " + booking.getStatus());
        }
        
        // 3. Verify user is the renter of this booking
        if (!booking.getRenter().getUserId().equals(userId)) {
            throw new RuntimeException("Only the renter can review this booking");
        }
        
        // 4. Check if review already exists for this booking
        if (reviewRepository.existsByBookingBookingId(request.getBookingId())) {
            throw new RuntimeException("A review already exists for this booking");
        }
        
        // 5. Check if within 14-day review window
        if (booking.getCompletedAt() != null) {
            LocalDateTime reviewDeadline = booking.getCompletedAt().plusDays(14);
            if (LocalDateTime.now().isAfter(reviewDeadline)) {
                throw new RuntimeException("Review period has expired. Reviews must be submitted within 14 days after checkout");
            }
        }
        
        // 6. Create the review
        Review review = new Review();
        review.setBooking(booking);
        review.setProperty(booking.getProperty());
        review.setReviewer(booking.getRenter());
        review.setReviewee(booking.getOwner()); // Owner is being reviewed
        
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
        
        // Auto-approve (can be changed to manual approval)
        review.setIsApproved(true);
        review.setApprovedAt(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        
        // 7. Update property rating and review count
        updatePropertyRating(booking.getProperty().getPropertyId());
        
        return mapToResponse(review);
    }
    
    /**
     * Get all approved reviews for a property
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getPropertyReviews(Long propertyId, Pageable pageable) {
        // Verify property exists
        if (!propertyRepository.existsById(propertyId)) {
            throw new RuntimeException("Property not found with ID: " + propertyId);
        }
        
        Page<Review> reviews = reviewRepository.findByPropertyIdAndApproved(propertyId, pageable);
        return reviews.map(this::mapToResponse);
    }
    
    /**
     * Get reviews by reviewer (user who wrote the review)
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getReviewsByReviewer(Long reviewerId, Pageable pageable) {
        return reviewRepository.findByReviewerId(reviewerId, pageable)
                .map(this::mapToResponse);
    }
    
    /**
     * Get reviews for a specific owner (reviewee)
     */
    @Transactional(readOnly = true)
    public Page<ReviewDto.Response> getReviewsForOwner(Long ownerId, Pageable pageable) {
        return reviewRepository.findByRevieweeId(ownerId, pageable)
                .map(this::mapToResponse);
    }
    
    /**
     * Get a single review by ID
     */
    @Transactional(readOnly = true)
    public ReviewDto.Response getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        return mapToResponse(review);
    }
    
    /**
     * Owner responds to a review
     */
    @Transactional
    public ReviewDto.Response respondToReview(Long reviewId, ReviewDto.OwnerResponseRequest request, Long ownerId) {
        // 1. Get the review
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        // 2. Verify the owner owns the reviewed property
        if (!review.getProperty().getOwner().getUserId().equals(ownerId)) {
            throw new RuntimeException("Only the property owner can respond to this review");
        }
        
        // 3. Check if response already exists
        if (review.getOwnerResponse() != null && !review.getOwnerResponse().isEmpty()) {
            throw new RuntimeException("Owner has already responded to this review");
        }
        
        // 4. Add the response
        review.setOwnerResponse(request.getOwnerResponse());
        review.setOwnerResponseDate(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        
        return mapToResponse(review);
    }
    
    /**
     * Update owner response (edit existing response)
     */
    @Transactional
    public ReviewDto.Response updateOwnerResponse(Long reviewId, ReviewDto.OwnerResponseRequest request, Long ownerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        if (!review.getProperty().getOwner().getUserId().equals(ownerId)) {
            throw new RuntimeException("Only the property owner can update this response");
        }
        
        review.setOwnerResponse(request.getOwnerResponse());
        review.setOwnerResponseDate(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        return mapToResponse(review);
    }
    
    /**
     * Admin deletes a review
     */
    @Transactional
    public void deleteReview(Long reviewId, Long adminId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        Long propertyId = review.getProperty().getPropertyId();
        
        reviewRepository.delete(review);
        
        // Update property rating after deletion
        updatePropertyRating(propertyId);
    }
    
    /**
     * Update property average rating and total reviews
     */
    @Transactional
    public void updatePropertyRating(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + propertyId));
        
        // Get average rating
        Double avgRating = reviewRepository.getAverageRatingByPropertyId(propertyId)
                .orElse(0.0);
        
        // Get total approved reviews count
        Long totalReviews = reviewRepository.countApprovedByPropertyId(propertyId);
        
        // Update property
        property.setAverageRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
        property.setTotalReviews(totalReviews.intValue());
        
        propertyRepository.save(property);
    }
    /**
     * Get review statistics for a property
     */
    @Transactional(readOnly = true)
    public ReviewDto.StatsResponse getPropertyReviewStats(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new RuntimeException("Property not found with ID: " + propertyId);
        }
        
        ReviewDto.StatsResponse stats = new ReviewDto.StatsResponse();
        
        Long totalReviews = reviewRepository.countApprovedByPropertyId(propertyId);
        Double avgRating = reviewRepository.getAverageRatingByPropertyId(propertyId).orElse(0.0);
        
        stats.setTotalReviews(totalReviews);
        stats.setAverageRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
        
        // Calculate rating breakdown (would need additional queries for this)
        // For now, returning the overall average
        ReviewDto.StatsResponse.RatingBreakdown breakdown = new ReviewDto.StatsResponse.RatingBreakdown();
        breakdown.setCleanlinessAvg(avgRating);
        breakdown.setAccuracyAvg(avgRating);
        breakdown.setCommunicationAvg(avgRating);
        breakdown.setLocationAvg(avgRating);
        breakdown.setValueAvg(avgRating);
        
        stats.setRatingBreakdown(breakdown);
        
        return stats;
    }
    
    /**
     * Check if user can review a booking
     */
    @Transactional(readOnly = true)
    public boolean canUserReviewBooking(Integer bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        
        if (booking == null) return false;
        if (booking.getStatus() != Booking.BookingStatus.completed) return false;
        if (!booking.getRenter().getUserId().equals(userId)) return false;
        if (reviewRepository.existsByBookingBookingId(bookingId)) return false;
        
        // Check 14-day window
        if (booking.getCompletedAt() != null) {
            LocalDateTime reviewDeadline = booking.getCompletedAt().plusDays(14);
            return LocalDateTime.now().isBefore(reviewDeadline);
        }
        
        return true;
    }
    
    /**
     * Map Review entity to Response DTO
     */
    private ReviewDto.Response mapToResponse(Review review) {
        ReviewDto.Response response = new ReviewDto.Response();
        
        response.setReviewId(review.getReviewId());
        response.setBookingId(review.getBooking().getBookingId());
        response.setPropertyId(review.getProperty().getPropertyId());
        response.setPropertyTitle(review.getProperty().getTitleAr());
        
        // Reviewer info
        ReviewDto.ReviewerInfo reviewerInfo = new ReviewDto.ReviewerInfo();
        reviewerInfo.setUserId(review.getReviewer().getUserId());
        reviewerInfo.setFirstName(review.getReviewer().getFirstName());
        reviewerInfo.setLastName(review.getReviewer().getLastName());
        reviewerInfo.setProfilePhoto(review.getReviewer().getProfilePhoto());
        reviewerInfo.setVerified(review.getReviewer().getNationalIdVerified());
        reviewerInfo.setTotalReviews(reviewRepository.countByReviewerUserId(review.getReviewer().getUserId()).intValue());
        response.setReviewer(reviewerInfo);
        
        // Reviewee (owner) info
        ReviewDto.ReviewerInfo revieweeInfo = new ReviewDto.ReviewerInfo();
        revieweeInfo.setUserId(review.getReviewee().getUserId());
        revieweeInfo.setFirstName(review.getReviewee().getFirstName());
        revieweeInfo.setLastName(review.getReviewee().getLastName());
        revieweeInfo.setProfilePhoto(review.getReviewee().getProfilePhoto());
        revieweeInfo.setVerified(review.getReviewee().getNationalIdVerified());
        response.setReviewee(revieweeInfo);
        
        // Ratings
        response.setOverallRating(review.getOverallRating());
        response.setCleanlinessRating(review.getCleanlinessRating());
        response.setAccuracyRating(review.getAccuracyRating());
        response.setCommunicationRating(review.getCommunicationRating());
        response.setLocationRating(review.getLocationRating());
        response.setValueRating(review.getValueRating());
        
        // Content
        response.setReviewTitle(review.getReviewTitle());
        response.setReviewText(review.getReviewText());
        response.setPros(review.getPros());
        response.setCons(review.getCons());
        
        // Owner response
        response.setOwnerResponse(review.getOwnerResponse());
        response.setOwnerResponseDate(review.getOwnerResponseDate());
        
        // Metadata
        response.setIsApproved(review.getIsApproved());
        response.setHelpfulCount(review.getHelpfulCount());
        response.setNotHelpfulCount(review.getNotHelpfulCount());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        
        return response;
    }
}