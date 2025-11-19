package com.ajarly.backend.repository;

import com.ajarly.backend.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // ==================== BASIC METHODS ====================
    // في ReviewRepository.java
Page<Review> findByPropertyPropertyIdAndIsApprovedTrue(Long propertyId, Pageable pageable);

    Page<Review> findByPropertyPropertyId(Long propertyId, Pageable pageable);
    
    Page<Review> findByReviewerUserId(Long reviewerId, Pageable pageable);
    
    Page<Review> findByRevieweeUserId(Long revieweeId, Pageable pageable);
    
    boolean existsByBookingBookingId(Integer bookingId);
    
    Optional<Review> findByBookingBookingId(Integer bookingId);
    
    @Query("SELECT COUNT(r) FROM Review r")
    long count();
    
    Long countByReviewerUserId(Long userId);
    
    // ==================== ✅ NEW: MY REVIEWS QUERIES ====================
    
    /**
     * ✅ Find reviews written by current user (renter) with approval filter
     * Used by: /api/v1/reviews/my-reviews
     */
    Page<Review> findByReviewerUserIdAndIsApproved(
        Long reviewerId, 
        Boolean isApproved, 
        Pageable pageable
    );
    
    /**
     * ✅ Find reviews for a specific property with approval filter
     * Used by: /api/v1/reviews/property/{propertyId}
     */
    Page<Review> findByPropertyPropertyIdAndIsApproved(
        Long propertyId, 
        Boolean isApproved, 
        Pageable pageable
    );
    
    // ==================== SINGLE PROPERTY QUERIES ====================
    
    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.property.propertyId = :propertyId AND r.isApproved = TRUE")
    Optional<Double> getAverageRatingByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.property.propertyId = :propertyId AND r.isApproved = TRUE")
    Long countApprovedByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT r FROM Review r " +
           "WHERE r.property.propertyId = :propertyId " +
           "AND r.isApproved = TRUE " +
           "ORDER BY r.createdAt DESC")
    Page<Review> findByPropertyIdAndApproved(
        @Param("propertyId") Long propertyId, 
        Pageable pageable
    );
    
    // ==================== ✅ CRITICAL: MULTI-PROPERTY QUERIES ====================
    // These are the KEY methods for Owner Dashboard!
    
    /**
     * ✅ Count approved reviews across MULTIPLE properties
     * Used by Owner Dashboard to get total review count
     */
    @Query("SELECT COUNT(r) FROM Review r " +
           "WHERE r.property.propertyId IN :propertyIds " +
           "AND r.isApproved = TRUE")
    Long countApprovedByPropertyIds(@Param("propertyIds") List<Long> propertyIds);
    
    /**
     * ✅ Get average rating across MULTIPLE properties
     * Used by Owner Dashboard to calculate overall rating
     */
    @Query("SELECT AVG(r.overallRating) FROM Review r " +
           "WHERE r.property.propertyId IN :propertyIds " +
           "AND r.isApproved = TRUE")
    Optional<Double> getAverageRatingByPropertyIds(@Param("propertyIds") List<Long> propertyIds);
    
    /**
     * ✅ Find approved reviews for multiple properties
     * Used for getting reviews across owner's portfolio
     */
    @Query("SELECT r FROM Review r " +
           "WHERE r.property.propertyId IN :propertyIds " +
           "AND r.isApproved = TRUE " +
           "ORDER BY r.createdAt DESC")
    Page<Review> findByPropertyIdsAndApproved(
        @Param("propertyIds") List<Long> propertyIds,
        Pageable pageable
    );
    
    /**
     * ✅ Alternative: Find reviews by owner ID directly
     * Backup method if property IDs not available
     */
    @Query("SELECT r FROM Review r " +
           "WHERE r.property.owner.userId = :ownerId " +
           "AND r.isApproved = TRUE " +
           "ORDER BY r.createdAt DESC")
    Page<Review> findRecentReviewsByOwnerId(
        @Param("ownerId") Long ownerId,
        Pageable pageable
    );
    
    // ==================== ADMIN QUERIES ====================
    
    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.isApproved = TRUE")
    Double getAverageRatingForApprovedReviews();
    
    Long countByIsApproved(Boolean isApproved);
    
    Page<Review> findByIsApproved(Boolean isApproved, Pageable pageable);
    
    Page<Review> findAll(Pageable pageable);
    
    // ==================== OWNER RESPONSE TRACKING ====================
    
    @Query("SELECT r FROM Review r " +
           "WHERE r.property.propertyId = :propertyId " +
           "AND r.isApproved = TRUE " +
           "AND r.ownerResponse IS NOT NULL " +
           "ORDER BY r.ownerResponseDate DESC")
    Page<Review> findByPropertyIdWithResponse(
        @Param("propertyId") Long propertyId,
        Pageable pageable
    );
    
    @Query("SELECT r FROM Review r " +
           "WHERE r.property.propertyId = :propertyId " +
           "AND r.isApproved = TRUE " +
           "AND r.ownerResponse IS NULL " +
           "ORDER BY r.createdAt DESC")
    Page<Review> findByPropertyIdWithoutResponse(
        @Param("propertyId") Long propertyId,
        Pageable pageable
    );
    
    @Query("SELECT COUNT(r) FROM Review r " +
           "WHERE r.property.propertyId = :propertyId " +
           "AND r.isApproved = TRUE " +
           "AND r.ownerResponse IS NULL")
    Long countPendingResponsesByPropertyId(@Param("propertyId") Long propertyId);
    
    // ==================== RATING BREAKDOWN ====================
    
    @Query("SELECT " +
           "AVG(r.cleanlinessRating) as cleanlinessAvg, " +
           "AVG(r.accuracyRating) as accuracyAvg, " +
           "AVG(r.communicationRating) as communicationAvg, " +
           "AVG(r.locationRating) as locationAvg, " +
           "AVG(r.valueRating) as valueAvg " +
           "FROM Review r " +
           "WHERE r.property.propertyId = :propertyId " +
           "AND r.isApproved = TRUE")
    Object[] getRatingBreakdownByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT r FROM Review r " +
           "WHERE r.property.propertyId = :propertyId " +
           "AND r.isApproved = TRUE " +
           "AND r.overallRating >= :minRating " +
           "ORDER BY r.overallRating DESC, r.createdAt DESC")
    Page<Review> findTopRatedReviewsByPropertyId(
        @Param("propertyId") Long propertyId,
        @Param("minRating") BigDecimal minRating,
        Pageable pageable
    );

/**
 * ✅ CRITICAL FIX: Get reviews by reviewer with EAGER loading of images
 */
@Query("SELECT DISTINCT r FROM Review r " +
       "LEFT JOIN FETCH r.property p " +
       "LEFT JOIN FETCH p.images img " +
       "WHERE r.reviewer.userId = :reviewerId " +
       "ORDER BY r.createdAt DESC")
Page<Review> findByReviewerWithPropertyAndImages(
    @Param("reviewerId") Long reviewerId,
    Pageable pageable
);


}