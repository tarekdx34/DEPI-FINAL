package com.ajarly.backend.repository;

import com.ajarly.backend.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Find by property (approved only) with pagination
    @Query("SELECT r FROM Review r WHERE r.property.propertyId = :propertyId AND r.isApproved = true ORDER BY r.createdAt DESC")
    Page<Review> findByPropertyIdAndApproved(@Param("propertyId") Long propertyId, Pageable pageable);
    
    // Find all reviews by property (including unapproved - for admin)
    Page<Review> findByPropertyPropertyId(Long propertyId, Pageable pageable);
    
    // Find by reviewer
    @Query("SELECT r FROM Review r WHERE r.reviewer.userId = :reviewerId ORDER BY r.createdAt DESC")
    Page<Review> findByReviewerId(@Param("reviewerId") Long reviewerId, Pageable pageable);
    
    // Find by reviewee (owner)
    @Query("SELECT r FROM Review r WHERE r.reviewee.userId = :revieweeId AND r.isApproved = true ORDER BY r.createdAt DESC")
    Page<Review> findByRevieweeId(@Param("revieweeId") Long revieweeId, Pageable pageable);
    
    // Find by booking
    Optional<Review> findByBookingBookingId(Integer bookingId);
    
    // Check if review exists for booking
    boolean existsByBookingBookingId(Integer bookingId);
    
    // Count approved reviews for property
    @Query("SELECT COUNT(r) FROM Review r WHERE r.property.propertyId = :propertyId AND r.isApproved = true")
    Long countApprovedByPropertyId(@Param("propertyId") Long propertyId);
    
    // Get average rating for property (approved only)
    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.property.propertyId = :propertyId AND r.isApproved = true")
    Optional<Double> getAverageRatingByPropertyId(@Param("propertyId") Long propertyId);
    
    // Find reviews pending approval (for admin)
    @Query("SELECT r FROM Review r WHERE r.isApproved = false ORDER BY r.createdAt DESC")
    Page<Review> findPendingApproval(Pageable pageable);
    
    // Get reviewer's total review count
    Long countByReviewerUserId(Long reviewerId);
}