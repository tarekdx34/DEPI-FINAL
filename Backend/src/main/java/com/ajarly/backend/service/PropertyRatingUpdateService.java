package com.ajarly.backend.service;

import com.ajarly.backend.model.Property;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyRatingUpdateService {
    
    private final PropertyRepository propertyRepository;
    private final ReviewRepository reviewRepository;
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updatePropertyRating(Long propertyId) {
        log.info("🔄 Updating property rating for ID: {}", propertyId);
        
        try {
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found: " + propertyId));
            
            Long reviewCount = reviewRepository.countApprovedByPropertyId(propertyId);
            
            if (reviewCount == null || reviewCount == 0) {
                property.setAverageRating(BigDecimal.ZERO);
                property.setTotalReviews(0);
            } else {
                Double avgRating = reviewRepository.getAverageRatingByPropertyId(propertyId).orElse(0.0);
                BigDecimal roundedRating = BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP);
                
                property.setAverageRating(roundedRating);
                property.setTotalReviews(reviewCount.intValue());
            }
            
            propertyRepository.save(property);
            log.info("✅ Rating updated: {} stars from {} reviews", property.getAverageRating(), property.getTotalReviews());
            
        } catch (Exception e) {
            log.error("❌ Rating update failed for property {}: {}", propertyId, e.getMessage());
            throw e;
        }
    }
}