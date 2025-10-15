package com.ajarly.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRejectRequest {
    
    @NotBlank(message = "Rejection reason is required")
    @Size(max = 1000, message = "Rejection reason cannot exceed 1000 characters")
    private String rejectionReason;
}