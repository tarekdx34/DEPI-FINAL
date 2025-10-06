// src/main/java/com/ajarly/backend/repository/PropertyRepository.java

package com.ajarly.backend.repository;

import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.Property.PropertyStatus;
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
public interface PropertyRepository extends JpaRepository<Property, Long> {
    
    // Find by owner
    Page<Property> findByOwner_UserId(Long ownerId, Pageable pageable);
    
    // Find by status
    Page<Property> findByStatus(PropertyStatus status, Pageable pageable);
    
    // Find active properties
    Page<Property> findByStatusAndGovernorateAndCity(
        PropertyStatus status, 
        String governorate, 
        String city, 
        Pageable pageable
    );
    
    // Search with filters
    @Query("SELECT p FROM Property p WHERE " +
           "p.status = :status AND " +
           "(:governorate IS NULL OR p.governorate = :governorate) AND " +
           "(:city IS NULL OR p.city = :city) AND " +
           "(:propertyType IS NULL OR p.propertyType = :propertyType) AND " +
           "(:minPrice IS NULL OR p.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.pricePerNight <= :maxPrice) AND " +
           "(:bedrooms IS NULL OR p.bedrooms >= :bedrooms)")
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
    
    // Find featured properties
    Page<Property> findByStatusAndIsFeaturedTrue(PropertyStatus status, Pageable pageable);
    
    // Check if slug exists
    boolean existsBySlug(String slug);
    
    // Find by slug
    Optional<Property> findBySlug(String slug);
}