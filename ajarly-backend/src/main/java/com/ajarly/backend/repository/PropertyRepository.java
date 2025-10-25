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

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    
    // Find by owner
    Page<Property> findByOwner_UserId(Long ownerId, Pageable pageable);
    Page<Property> findByStatus(Property.PropertyStatus status, Pageable pageable);

    // Check if slug exists
    boolean existsBySlug(String slug);
    
    // Search properties with filters
    @Query("SELECT p FROM Property p WHERE " +
           "p.status = :status " +
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
    
    /**
     * Find location suggestions for autocomplete
     * Returns governorates and cities that match the query with property counts
     * Constructor matches: LocationSuggestion(String governorate, String city, Long propertyCount)
     */
    @Query("SELECT new com.ajarly.backend.dto.LocationSuggestion(" +
           "p.governorate, " +
           "p.city, " +
           "COUNT(p)) " +
           "FROM Property p " +
           "WHERE p.status = :status " +
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
     * Returns locations sorted by property count
     * Constructor matches: PopularLocationResponse(String, String, Long, Double, BigDecimal, BigDecimal)
     * Note: AVG() returns Double, not BigDecimal
     */
    @Query("SELECT new com.ajarly.backend.dto.PopularLocationResponse(" +
           "p.governorate, " +
           "p.city, " +
           "COUNT(p), " +
           "AVG(p.pricePerNight), " +
           "MIN(p.pricePerNight), " +
           "MAX(p.pricePerNight)) " +
           "FROM Property p " +
           "WHERE p.status = :status " +
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
           "WHERE p.status = :status " +
           "ORDER BY p.governorate ASC")
    List<String> findDistinctGovernoratesByStatus(@Param("status") PropertyStatus status);
    
    /**
     * Find distinct cities in a governorate that have active properties
     */
    @Query("SELECT DISTINCT p.city FROM Property p " +
           "WHERE p.governorate = :governorate " +
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
           "WHERE p.governorate = :governorate " +
           "AND p.city = :city " +
           "AND p.status = :status")
    Long countByLocation(
        @Param("governorate") String governorate,
        @Param("city") String city,
        @Param("status") PropertyStatus status
    );
}