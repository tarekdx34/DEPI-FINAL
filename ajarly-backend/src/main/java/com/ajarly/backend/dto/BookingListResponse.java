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
public class BookingListResponse {
    
    private Integer bookingId;
    private String bookingReference;
    
    // Property info (simplified)
    private Integer propertyId;
    private String propertyTitle;
    private String propertyType;
    private String propertyCity;
    private String propertyCoverImage;
    
    // Other party info (if renter, show owner; if owner, show renter)
    private Integer otherPartyId;
    private String otherPartyName;
    private String otherPartyPhone;
    
    // Dates
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkInDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkOutDate;
    
    private Integer numberOfNights;
    private Integer numberOfGuests;
    
    // Pricing
    private BigDecimal totalPrice;
    private String currency;
    
    // Status
    private String status;
    private String paymentStatus;
    
    // Timestamps
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime requestedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiresAt;
}