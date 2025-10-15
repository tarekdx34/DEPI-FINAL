package com.ajarly.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {
    
    @NotNull(message = "Property ID is required")
    private Integer propertyId;
    
    @NotNull(message = "Check-in date is required")
    @Future(message = "Check-in date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkInDate;
    
    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkOutDate;
    
    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "At least 1 guest is required")
    @Max(value = 50, message = "Maximum 50 guests allowed")
    private Integer numberOfGuests;
    
    @Min(value = 1, message = "At least 1 adult is required")
    private Integer numberOfAdults = 1;
    
    @Min(value = 0, message = "Number of children cannot be negative")
    private Integer numberOfChildren = 0;
    
    @Size(max = 1000, message = "Special requests cannot exceed 1000 characters")
    private String specialRequests;
}