package com.ajarly.backend.repository;

import com.ajarly.backend.model.Favorite;
import com.ajarly.backend.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    /**
     * Find all favorites for a specific user with pagination
     * Fixed: Changed PropertyStatus.active to Property.PropertyStatus.active
     */
    @Query("SELECT f FROM Favorite f " +
           "JOIN FETCH f.property p " +
           "WHERE f.user.userId = :userId " +
           "AND p.status = com.ajarly.backend.model.Property$PropertyStatus.active " +
           "ORDER BY f.createdAt DESC")
    Page<Favorite> findByUser_UserId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Check if a property is already favorited by a user
     */
    boolean existsByUser_UserIdAndProperty_PropertyId(Long userId, Long propertyId);
    
    /**
     * Find a specific favorite by user and property
     */
    Optional<Favorite> findByUser_UserIdAndProperty_PropertyId(Long userId, Long propertyId);
    
    /**
     * Delete a favorite by user and property
     */
    void deleteByUser_UserIdAndProperty_PropertyId(Long userId, Long propertyId);
    
    /**
     * Count favorites for a specific property
     */
    long countByProperty_PropertyId(Long propertyId);
}