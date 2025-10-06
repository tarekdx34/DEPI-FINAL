// src/main/java/com/ajarly/backend/dto/PropertyDto.java

package com.ajarly.backend.dto;

import com.ajarly.backend.model.Property;
import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PropertyDto {
    
    // Request DTO for creating property
    @Data
    public static class CreateRequest {
        @NotBlank(message = "Arabic title is required")
        @Size(min = 10, max = 255)
        private String titleAr;
        
        @Size(max = 255)
        private String titleEn;
        
        @NotBlank(message = "Arabic description is required")
        @Size(min = 50, max = 5000)
        private String descriptionAr;
        
        @Size(max = 5000)
        private String descriptionEn;
        
        @NotNull(message = "Property type is required")
        private Property.PropertyType propertyType;
        
        @NotNull(message = "Rental type is required")
        private Property.RentalType rentalType;
        
        @NotBlank(message = "Governorate is required")
        private String governorate;
        
        @NotBlank(message = "City is required")
        private String city;
        
        private String neighborhood;
        private String streetAddress;
        
        @DecimalMin("0.0")
        private BigDecimal latitude;
        
        @DecimalMin("0.0")
        private BigDecimal longitude;
        
        @NotNull(message = "Bedrooms is required")
        @Min(0)
        @Max(20)
        private Integer bedrooms;
        
        @NotNull(message = "Bathrooms is required")
        @Min(0)
        @Max(20)
        private Integer bathrooms;
        
        @NotNull(message = "Guest capacity is required")
        @Min(1)
        @Max(50)
        private Integer guestsCapacity;
        
        @Min(10)
        @Max(10000)
        private Integer areaSqm;
        
        private Integer floorNumber;
        private Integer totalFloors;
        private Boolean furnished;
        private Boolean petsAllowed;
        private Boolean smokingAllowed;
        
        @DecimalMin("50.0")
        @DecimalMax("1000000.0")
        private BigDecimal pricePerNight;
        
        private BigDecimal pricePerWeek;
        private BigDecimal pricePerMonth;
        private BigDecimal cleaningFee;
        private BigDecimal securityDeposit;
        
        private LocalDate availableFrom;
        private LocalDate availableTo;
        
        @Min(1)
        private Integer minRentalDays;
        
        private Boolean instantBooking;
    }
    
    // Response DTO
    @Data
    public static class Response {
        private Long propertyId;
        private String titleAr;
        private String titleEn;
        private String descriptionAr;
        private String descriptionEn;
        private String slug;
        private Property.PropertyType propertyType;
        private Property.RentalType rentalType;
        private String governorate;
        private String city;
        private String neighborhood;
        private Integer bedrooms;
        private Integer bathrooms;
        private Integer guestsCapacity;
        private Integer areaSqm;
        private Boolean furnished;
        private BigDecimal pricePerNight;
        private BigDecimal pricePerMonth;
        private String currency;
        private Property.PropertyStatus status;
        private Boolean isVerified;
        private Integer viewCount;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Boolean isFeatured;
        private OwnerInfo owner;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        @Data
        public static class OwnerInfo {
            private Long userId;
            private String name;
            private String phone;
            private Boolean verified;
        }
    }
    
    // Simple/List Response
    @Data
    public static class ListResponse {
        private Long propertyId;
        private String titleAr;
        private String slug;
        private Property.PropertyType propertyType;
        private String governorate;
        private String city;
        private Integer bedrooms;
        private Integer bathrooms;
        private BigDecimal pricePerNight;
        private String currency;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Boolean isFeatured;
        private String coverImage;
    }
}