package com.ajarly.backend.repository;

import com.ajarly.backend.model.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {
    

      // ✅ Existing method
    Optional<PropertyImage> findFirstByPropertyPropertyIdAndIsCoverTrue(Long propertyId);
    
    // ✅ ADD THIS NEW METHOD
    Optional<PropertyImage> findFirstByPropertyPropertyId(Long propertyId);
    /**
     * Find all images for a specific property, ordered by imageOrder
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.property.propertyId = :propertyId ORDER BY pi.imageOrder ASC")
    List<PropertyImage> findByPropertyId(@Param("propertyId") Long propertyId);
    
    /**
     * Find the cover image for a property
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.property.propertyId = :propertyId AND pi.isCover = true")
    Optional<PropertyImage> findCoverImageByPropertyId(@Param("propertyId") Long propertyId);
    
    /**
     * Delete an image by imageId
     */
    @Modifying
    @Query("DELETE FROM PropertyImage pi WHERE pi.imageId = :imageId")
    void deleteByImageId(@Param("imageId") Long imageId);
    
    /**
     * Count total images for a property
     */
    @Query("SELECT COUNT(pi) FROM PropertyImage pi WHERE pi.property.id = :propertyId")
    Long countByPropertyId(@Param("propertyId") Long propertyId);
    
    /**
     * Find image by imageId with property details
     */
    @Query("SELECT pi FROM PropertyImage pi JOIN FETCH pi.property WHERE pi.imageId = :imageId")
    Optional<PropertyImage> findByIdWithProperty(@Param("imageId") Long imageId);
    
    /**
     * Check if image exists for a property
     */
    @Query("SELECT CASE WHEN COUNT(pi) > 0 THEN true ELSE false END FROM PropertyImage pi WHERE pi.imageId = :imageId AND pi.property.id = :propertyId")
    boolean existsByImageIdAndPropertyId(@Param("imageId") Long imageId, @Param("propertyId") Long propertyId);

    
    /**
     * ✅ Alternative: Get any image if no cover exists
     */
    Optional<PropertyImage> findFirstByPropertyPropertyIdOrderByImageOrderAsc(Long propertyId);

    
}