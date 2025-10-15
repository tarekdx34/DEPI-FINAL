package com.ajarly.backend.dto;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReviewDto {
    
    // Create Review Request
    @Data
    public static class CreateRequest {
        @NotNull(message = "Booking ID is required")
        private Integer bookingId;
        
        @NotNull(message = "Overall rating is required")
        @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
        @DecimalMax(value = "5.0", message = "Rating must be at most 5.0")
        private BigDecimal overallRating;
        
        @Min(value = 1, message = "Cleanliness rating must be at least 1")
        @Max(value = 5, message = "Cleanliness rating must be at most 5")
        private Integer cleanlinessRating;
        
        @Min(value = 1, message = "Accuracy rating must be at least 1")
        @Max(value = 5, message = "Accuracy rating must be at most 5")
        private Integer accuracyRating;
        
        @Min(value = 1, message = "Communication rating must be at least 1")
        @Max(value = 5, message = "Communication rating must be at most 5")
        private Integer communicationRating;
        
        @Min(value = 1, message = "Location rating must be at least 1")
        @Max(value = 5, message = "Location rating must be at most 5")
        private Integer locationRating;
        
        @Min(value = 1, message = "Value rating must be at least 1")
        @Max(value = 5, message = "Value rating must be at most 5")
        private Integer valueRating;
        
        @Size(max = 255, message = "Review title must not exceed 255 characters")
        private String reviewTitle;
        
        @NotBlank(message = "Review text is required")
        @Size(min = 10, max = 2000, message = "Review text must be between 10 and 2000 characters")
        private String reviewText;
        
        @Size(max = 1000, message = "Pros must not exceed 1000 characters")
        private String pros;
        
        @Size(max = 1000, message = "Cons must not exceed 1000 characters")
        private String cons;
    }
    
    // Owner Response Request
    @Data
    public static class OwnerResponseRequest {
        @NotBlank(message = "Response text is required")
        @Size(min = 10, max = 1000, message = "Response must be between 10 and 1000 characters")
        private String ownerResponse;
    }
    
    // Review Response
    @Data
    public static class Response {
        private Long reviewId;
        private Integer bookingId;
        private Long propertyId;
        private String propertyTitle;
        
        private ReviewerInfo reviewer;
        private ReviewerInfo reviewee;
        
        private BigDecimal overallRating;
        private Integer cleanlinessRating;
        private Integer accuracyRating;
        private Integer communicationRating;
        private Integer locationRating;
        private Integer valueRating;
        
        private String reviewTitle;
        private String reviewText;
        private String pros;
        private String cons;
        
        private String ownerResponse;
        private LocalDateTime ownerResponseDate;
        
        private Boolean isApproved;
        private Integer helpfulCount;
        private Integer notHelpfulCount;
        
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    // Reviewer Information
    @Data
    public static class ReviewerInfo {
        private Long userId;
        private String firstName;
        private String lastName;
        private String profilePhoto;
        private Boolean verified;
        private Integer totalReviews;
    }
    
    // Simple Review Response for List
    @Data
    public static class ListResponse {
        private Long reviewId;
        private ReviewerInfo reviewer;
        private BigDecimal overallRating;
        private String reviewTitle;
        private String reviewText;
        private String ownerResponse;
        private Integer helpfulCount;
        private LocalDateTime createdAt;
    }
    
    // Statistics Response
    @Data
    public static class StatsResponse {
        private Long totalReviews;
        private BigDecimal averageRating;
        private RatingBreakdown ratingBreakdown;
        
        @Data
        public static class RatingBreakdown {
            private Double cleanlinessAvg;
            private Double accuracyAvg;
            private Double communicationAvg;
            private Double locationAvg;
            private Double valueAvg;
        }
    }
}