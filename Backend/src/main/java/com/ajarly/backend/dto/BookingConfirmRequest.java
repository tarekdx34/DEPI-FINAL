package com.ajarly.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmRequest {
    
    @Size(max = 1000, message = "Owner response cannot exceed 1000 characters")
    private String ownerResponse;
}