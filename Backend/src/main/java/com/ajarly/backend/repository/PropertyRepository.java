package com.ajarly.backend.repository;

import com.ajarly.backend.dto.LocationSuggestion;
import com.ajarly.backend.dto.PopularLocationResponse;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.Property.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    
    // ============================================
    // SOFT DELETE SUPPORT
    // ============================================
    
    /**
     * Find by ID excluding soft-deleted properties
     */
    @Query("SELECT p FROM Property p WHERE p.propertyId = :id AND (p.deleted = false OR p.deleted IS NULL)")
    Optional<Property> findByIdNotDeleted(@Param("id") Long id);
    
    /**
     * Find all excluding soft-deleted properties
     */
    @Query("SELECT p FROM Property p WHERE p.deleted = false OR p.deleted IS NULL")
    List<Property> findAllNotDeleted();
    
    /**
     * Find by owner excluding soft-deleted properties
     */
    @Query("SELECT p FROM Property p WHERE p.owner.userId = :ownerId AND (p.deleted = false OR p.deleted IS NULL)")
    Page<Property> findByOwnerIdNotDeleted(@Param("ownerId") Long ownerId, Pageable pageable);
    
    /**
     * Count non-deleted properties
     */
    @Query("SELECT COUNT(p) FROM Property p WHERE p.deleted = false OR p.deleted IS NULL")
    long countNotDeleted();
    
    
    /**
     * ✅ Find properties by status with owner eagerly loaded (prevents lazy loading exception)
     */
    @Query("SELECT DISTINCT p FROM Property p " +
        "LEFT JOIN FETCH p.owner " +
        "WHERE p.status = :status " +
        "AND (p.deleted = false OR p.deleted IS NULL)")
    Page<Property> findByStatusWithOwner(
        @Param("status") PropertyStatus status, 
        Pageable pageable
    );
    // ============================================
    // BASIC FINDER METHODS
    // ============================================
    
    /**
     * Find properties by owner user ID
     */
    Page<Property> findByOwner_UserId(Long ownerId, Pageable pageable);
    
    /**
     * Find properties by status
     */
    Page<Property> findByStatus(PropertyStatus status, Pageable pageable);
    
    /**
     * Count properties by status
     */
    Long countByStatus(PropertyStatus status);
    
    /**
     * Check if slug exists
     */
    boolean existsBySlug(String slug);
    
    /**
     * Find all properties by owner user ID (without pagination)
     */
    List<Property> findByOwnerUserId(Long ownerId);
    
    /**
     * Find properties by owner and status
     */
    List<Property> findByOwnerUserIdAndStatus(Long ownerId, PropertyStatus status);
    
    // ============================================
    // SEARCH QUERIES
    // ============================================
    
    /**
     * Search properties with filters and soft delete check
     */
    @Query("SELECT p FROM Property p WHERE " +
           "(p.deleted = false OR p.deleted IS NULL) " +
           "AND p.status = :status " +
           "AND (:governorate IS NULL OR p.governorate = :governorate) " +
           "AND (:city IS NULL OR p.city = :city) " +
           "AND (:propertyType IS NULL OR p.propertyType = :propertyType) " +
           "AND (:minPrice IS NULL OR p.pricePerNight >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice) " +
           "AND (:bedrooms IS NULL OR p.bedrooms >= :bedrooms)")
    Page<Property> searchProperties(
        @Param("status") PropertyStatus status,
        @Param("governorate") String governorate,
        @Param("city") String city,
        @Param("propertyType") Property.PropertyType propertyType,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("bedrooms") Integer bedrooms,
        Pageable pageable
    );
    
    // ============================================
    // LOCATION QUERIES
    // ============================================
    
    /**
     * Find location suggestions for autocomplete
     */
    @Query("SELECT new com.ajarly.backend.dto.LocationSuggestion(" +
           "p.governorate, " +
           "p.city, " +
           "COUNT(p)) " +
           "FROM Property p " +
           "WHERE (p.deleted = false OR p.deleted IS NULL) " +
           "AND p.status = :status " +
           "AND (LOWER(p.governorate) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "GROUP BY p.governorate, p.city " +
           "ORDER BY COUNT(p) DESC")
    List<LocationSuggestion> findLocationSuggestions(
        @Param("query") String query,
        @Param("status") PropertyStatus status
    );
    
    /**
     * Find popular locations with statistics
     */
    @Query("SELECT new com.ajarly.backend.dto.PopularLocationResponse(" +
           "p.governorate, " +
           "p.city, " +
           "COUNT(p), " +
           "AVG(p.pricePerNight), " +
           "MIN(p.pricePerNight), " +
           "MAX(p.pricePerNight)) " +
           "FROM Property p " +
           "WHERE (p.deleted = false OR p.deleted IS NULL) " +
           "AND p.status = :status " +
           "GROUP BY p.governorate, p.city " +
           "ORDER BY COUNT(p) DESC")
    List<PopularLocationResponse> findPopularLocations(
        @Param("status") PropertyStatus status,
        Pageable pageable
    );
    
    /**
     * Find distinct governorates that have active properties
     */
    @Query("SELECT DISTINCT p.governorate FROM Property p " +
           "WHERE (p.deleted = false OR p.deleted IS NULL) " +
           "AND p.status = :status " +
           "ORDER BY p.governorate ASC")
    List<String> findDistinctGovernoratesByStatus(@Param("status") PropertyStatus status);
    
    /**
     * Find distinct cities in a governorate that have active properties
     */
    @Query("SELECT DISTINCT p.city FROM Property p " +
           "WHERE (p.deleted = false OR p.deleted IS NULL) " +
           "AND p.governorate = :governorate " +
           "AND p.status = :status " +
           "ORDER BY p.city ASC")
    List<String> findDistinctCitiesByGovernorateAndStatus(
        @Param("governorate") String governorate,
        @Param("status") PropertyStatus status
    );
    
    /**
     * Count properties by location
     */
    @Query("SELECT COUNT(p) FROM Property p " +
           "WHERE (p.deleted = false OR p.deleted IS NULL) " +
           "AND p.governorate = :governorate " +
           "AND p.city = :city " +
           "AND p.status = :status")
    Long countByLocation(
        @Param("governorate") String governorate,
        @Param("city") String city,
        @Param("status") PropertyStatus status
    );
    
    // ============================================
    // IMAGE-RELATED QUERIES
    // ============================================
    
    /**
     * Find property by ID with images using JOIN FETCH
     */
    @Query("SELECT DISTINCT p FROM Property p LEFT JOIN FETCH p.images WHERE p.propertyId = :propertyId")
    Property findByIdWithImages(@Param("propertyId") Long propertyId);
    
    /**
     * Search properties with images using JOIN FETCH
     */
    @Query("SELECT DISTINCT p FROM Property p LEFT JOIN FETCH p.images WHERE " +
           "(p.deleted = false OR p.deleted IS NULL) " +
           "AND p.status = :status " +
           "AND (:governorate IS NULL OR p.governorate = :governorate) " +
           "AND (:city IS NULL OR p.city = :city) " +
           "AND (:propertyType IS NULL OR p.propertyType = :propertyType) " +
           "AND (:minPrice IS NULL OR p.pricePerNight >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice) " +
           "AND (:bedrooms IS NULL OR p.bedrooms >= :bedrooms)")
    Page<Property> searchPropertiesWithImages(
        @Param("status") PropertyStatus status,
        @Param("governorate") String governorate,
        @Param("city") String city,
        @Param("propertyType") Property.PropertyType propertyType,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("bedrooms") Integer bedrooms,
        Pageable pageable
    );
}