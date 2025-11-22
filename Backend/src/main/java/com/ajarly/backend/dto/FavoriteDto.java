package com.ajarly.backend.dto;

import com.ajarly.backend.model.Property;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FavoriteDto {
    
    /**
     * Request DTO for adding a property to favorites
     */
    @Data
    public static class AddRequest {
        @NotNull(message = "Property ID is required")
        private Long propertyId;
        
        @Size(max = 500, message = "Notes cannot exceed 500 characters")
        private String notes;
    }
    
    /**
     * Response DTO for favorite with property summary
     */
    @Data
    public static class FavoriteResponse {
        private Long favoriteId;
        private PropertySummary property;
        private String notes;
        private LocalDateTime createdAt;
        
        @Data
        public static class PropertySummary {
            private Long propertyId;
            private String titleAr;
            private String titleEn;
            private String slug;
            private Property.PropertyType propertyType;
            private String governorate;
            private String city;
            private Integer bedrooms;
            private Integer bathrooms;
            private BigDecimal pricePerNight;
            private BigDecimal pricePerMonth;
            private String currency;
            private Property.PropertyStatus status;
            private BigDecimal averageRating;
            private Integer totalReviews;
            private Boolean isFeatured;
            private String coverImage;
        }
    }
    
    /**
     * Simple response for checking if property is favorited
     */
    @Data
    public static class CheckResponse {
        private Boolean isFavorited;
        private Long favoriteId;
    }
}