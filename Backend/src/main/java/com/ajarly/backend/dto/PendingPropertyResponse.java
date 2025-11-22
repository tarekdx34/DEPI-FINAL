package com.ajarly.backend.dto;

import com.ajarly.backend.model.Property;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingPropertyResponse {
    private Long propertyId;
    private String titleAr;
    private String titleEn;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private Property.PropertyType propertyType;
    private Property.RentalType rentalType;
    private String governorate;
    private String city;
    private Integer bedrooms;
    private Integer bathrooms;
    private BigDecimal pricePerNight;
    private String descriptionAr;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}