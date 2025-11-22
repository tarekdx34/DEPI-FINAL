package com.ajarly.backend.service;

import com.ajarly.backend.dto.FavoriteDto;
import com.ajarly.backend.model.Favorite;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.FavoriteRepository;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {
    
    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    
    /**
     * Add a property to user's favorites
     */
    @Transactional
    public FavoriteDto.FavoriteResponse addFavorite(Long propertyId, Long userId, String notes) {
        log.info("Adding property {} to favorites for user {}", propertyId, userId);
        
        // Check if already favorited
        if (favoriteRepository.existsByUser_UserIdAndProperty_PropertyId(userId, propertyId)) {
            throw new RuntimeException("Property is already in your favorites");
        }
        
        // Fetch user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Fetch property
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        // Check if property is active
        if (property.getStatus() != Property.PropertyStatus.active) {
            throw new RuntimeException("Cannot favorite inactive property");
        }
        
        // Create favorite
        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProperty(property);
        favorite.setNotes(notes);
        
        Favorite saved = favoriteRepository.save(favorite);
        
        // Update property favorite count
        updatePropertyFavoriteCount(propertyId);
        
        log.info("Property {} added to favorites successfully", propertyId);
        return mapToResponse(saved);
    }
    
    /**
     * Remove a property from user's favorites
     */
    @Transactional
    public void removeFavorite(Long propertyId, Long userId) {
        log.info("Removing property {} from favorites for user {}", propertyId, userId);
        
        // Check if favorite exists
        Favorite favorite = favoriteRepository.findByUser_UserIdAndProperty_PropertyId(userId, propertyId)
            .orElseThrow(() -> new RuntimeException("Favorite not found"));
        
        favoriteRepository.delete(favorite);
        
        // Update property favorite count
        updatePropertyFavoriteCount(propertyId);
        
        log.info("Property {} removed from favorites successfully", propertyId);
    }
    
    /**
     * Get all favorites for a user with pagination
     */
    @Transactional(readOnly = true)
    public Page<FavoriteDto.FavoriteResponse> getUserFavorites(Long userId, Pageable pageable) {
        log.info("Fetching favorites for user {}", userId);
        
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        
        Page<Favorite> favorites = favoriteRepository.findByUser_UserId(userId, pageable);
        
        return favorites.map(this::mapToResponse);
    }
    
    /**
     * Check if a property is favorited by a user
     */
    @Transactional(readOnly = true)
    public FavoriteDto.CheckResponse isFavorited(Long propertyId, Long userId) {
        log.info("Checking if property {} is favorited by user {}", propertyId, userId);
        
        FavoriteDto.CheckResponse response = new FavoriteDto.CheckResponse();
        
        Favorite favorite = favoriteRepository.findByUser_UserIdAndProperty_PropertyId(userId, propertyId)
            .orElse(null);
        
        response.setIsFavorited(favorite != null);
        response.setFavoriteId(favorite != null ? favorite.getFavoriteId() : null);
        
        return response;
    }
    
    /**
     * Update the favorite count for a property
     */
    @Transactional
    public void updatePropertyFavoriteCount(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        long favoriteCount = favoriteRepository.countByProperty_PropertyId(propertyId);
        property.setFavoriteCount((int) favoriteCount);
        propertyRepository.save(property);
        
        log.debug("Updated favorite count for property {}: {}", propertyId, favoriteCount);
    }
    
    /**
     * Map Favorite entity to response DTO
     */
    private FavoriteDto.FavoriteResponse mapToResponse(Favorite favorite) {
        FavoriteDto.FavoriteResponse response = new FavoriteDto.FavoriteResponse();
        response.setFavoriteId(favorite.getFavoriteId());
        response.setNotes(favorite.getNotes());
        response.setCreatedAt(favorite.getCreatedAt());
        
        // Map property summary
        Property property = favorite.getProperty();
        FavoriteDto.FavoriteResponse.PropertySummary propertySummary = 
            new FavoriteDto.FavoriteResponse.PropertySummary();
        
        propertySummary.setPropertyId(property.getPropertyId());
        propertySummary.setTitleAr(property.getTitleAr());
        propertySummary.setTitleEn(property.getTitleEn());
        propertySummary.setSlug(property.getSlug());
        propertySummary.setPropertyType(property.getPropertyType());
        propertySummary.setGovernorate(property.getGovernorate());
        propertySummary.setCity(property.getCity());
        propertySummary.setBedrooms(property.getBedrooms());
        propertySummary.setBathrooms(property.getBathrooms());
        propertySummary.setPricePerNight(property.getPricePerNight());
        propertySummary.setPricePerMonth(property.getPricePerMonth());
        propertySummary.setCurrency(property.getCurrency());
        propertySummary.setStatus(property.getStatus());
        propertySummary.setAverageRating(property.getAverageRating());
        propertySummary.setTotalReviews(property.getTotalReviews());
        propertySummary.setIsFeatured(property.getIsFeatured());
        
        // Get cover image if available
        if (!property.getImages().isEmpty()) {
            propertySummary.setCoverImage(property.getImages().get(0).getImageUrl());
        }
        
        response.setProperty(propertySummary);
        
        return response;
    }
}