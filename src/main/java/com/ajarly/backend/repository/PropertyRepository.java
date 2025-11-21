package com.ajarly.backend.repository;

import com.ajarly.backend.dto.LocationSuggestion;
import com.ajarly.backend.dto.PopularLocationResponse;
import com.ajarly.backend.model.Property;
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
    
    // ========== Methods المفقودة من PropertyService ==========
    boolean existsBySlug(String slug);
    
    Page<Property> findByStatus(Property.PropertyStatus status, Pageable pageable);
    Long countByStatus(Property.PropertyStatus status);
    
    @Query("SELECT DISTINCT p FROM Property p LEFT JOIN FETCH p.images WHERE p.owner.userId = :ownerId")
    Page<Property> findByOwner_UserId(@Param("ownerId") Long ownerId, Pageable pageable);
    
    @Query("SELECT DISTINCT p FROM Property p LEFT JOIN FETCH p.images " +
           "WHERE (:status IS NULL OR p.status = :status) " +
           "AND (:governorate IS NULL OR p.governorate = :governorate) " +
           "AND (:city IS NULL OR p.city = :city) " +
           "AND (:propertyType IS NULL OR p.propertyType = :propertyType) " +
           "AND (:minPrice IS NULL OR p.pricePerNight >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice) " +
           "AND (:bedrooms IS NULL OR p.bedrooms = :bedrooms)")
    Page<Property> searchPropertiesWithImages(
        @Param("status") Property.PropertyStatus status,
        @Param("governorate") String governorate,
        @Param("city") String city,
        @Param("propertyType") Property.PropertyType propertyType,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("bedrooms") Integer bedrooms,
        Pageable pageable
    );
    
    @Query("SELECT DISTINCT p FROM Property p LEFT JOIN FETCH p.images WHERE p.propertyId = :propertyId")
    Property findByIdWithImages(@Param("propertyId") Long propertyId);

    /**
     * البحث عن اقتراحات المواقع (Autocomplete)
     */
    @Query("""
        SELECT new com.ajarly.backend.dto.LocationSuggestion(
            p.governorate,
            p.city,
            COUNT(p.propertyId)
        )
        FROM Property p
        WHERE p.status = :status
        AND (
            LOWER(p.governorate) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%'))
        )
        GROUP BY p.governorate, p.city
        ORDER BY COUNT(p.propertyId) DESC
    """)
    List<LocationSuggestion> findLocationSuggestions(
        @Param("query") String query,
        @Param("status") Property.PropertyStatus status
    );

    /**
     * الحصول على المواقع الشعبية مع الإحصائيات
     */
    @Query("""
        SELECT new com.ajarly.backend.dto.PopularLocationResponse(
            p.governorate,
            p.city,
            COUNT(p.propertyId),
            AVG(p.pricePerNight),
            MIN(p.pricePerNight),
            MAX(p.pricePerNight)
        )
        FROM Property p
        WHERE p.status = :status
        GROUP BY p.governorate, p.city
        ORDER BY COUNT(p.propertyId) DESC
    """)
    List<PopularLocationResponse> findPopularLocations(
        @Param("status") Property.PropertyStatus status,
        Pageable pageable
    );

    /**
     * الحصول على قائمة المحافظات المتاحة
     */
    @Query("""
        SELECT DISTINCT p.governorate
        FROM Property p
        WHERE p.status = :status
        ORDER BY p.governorate ASC
    """)
    List<String> findDistinctGovernoratesByStatus(
        @Param("status") Property.PropertyStatus status
    );

    /**
     * الحصول على المدن في محافظة معينة
     */
    @Query("""
        SELECT DISTINCT p.city
        FROM Property p
        WHERE p.governorate = :governorate
        AND p.status = :status
        ORDER BY p.city ASC
    """)
    List<String> findDistinctCitiesByGovernorateAndStatus(
        @Param("governorate") String governorate,
        @Param("status") Property.PropertyStatus status
    );

    /**
     * عد العقارات في موقع معين
     */
    @Query("""
        SELECT COUNT(p.propertyId)
        FROM Property p
        WHERE p.governorate = :governorate
        AND p.city = :city
        AND p.status = :status
    """)
    Long countByLocation(
        @Param("governorate") String governorate,
        @Param("city") String city,
        @Param("status") Property.PropertyStatus status
    );

    // ✅ Add this method to your PropertyRepository interface

/**
 * Find all properties by owner user ID
 * 
 * @param ownerId The owner's user ID
 * @return List of properties owned by this user
 */
List<Property> findByOwnerUserId(Long ownerId);

/**
 * Alternative: Find active properties by owner
 * 
 * @param ownerId The owner's user ID
 * @param status The property status
 * @return List of properties
 */
List<Property> findByOwnerUserIdAndStatus(Long ownerId, Property.PropertyStatus status);
}