package com.ajarly.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    
    private Integer bookingId;
    private String bookingReference;
    
    // Property info
    private PropertyBasicInfo property;
    
    // Renter info
    private UserBasicInfo renter;
    
    // Owner info
    private UserBasicInfo owner;
    
    // Dates
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkInDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkOutDate;
    
    private Integer numberOfNights;
    private Integer numberOfGuests;
    private Integer numberOfAdults;
    private Integer numberOfChildren;
    
    // Pricing
    private BigDecimal pricePerNight;
    private BigDecimal subtotal;
    private BigDecimal cleaningFee;
    private BigDecimal serviceFee;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;
    private BigDecimal securityDeposit;
    private String currency;
    
    // Status
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    
    // Communication
    private String specialRequests;
    private String ownerResponse;
    private String rejectionReason;
    private String cancellationReason;
    private BigDecimal cancellationFee;
    private BigDecimal refundAmount;
    
    // Timestamps
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime requestedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime confirmedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime rejectedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime cancelledAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiresAt;
    
    // Nested classes for related entities
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyBasicInfo {
        private Integer propertyId;
        private String titleAr;
        private String titleEn;
        private String propertyType;
        private String governorate;
        private String city;
        private String address;
        private String coverImageUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBasicInfo {
        private Integer userId;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String profilePhoto;
        private Boolean nationalIdVerified;
    }
}