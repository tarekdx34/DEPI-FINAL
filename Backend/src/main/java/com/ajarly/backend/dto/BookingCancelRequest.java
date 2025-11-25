package com.ajarly.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCancelRequest {
    
    @NotBlank(message = "Cancellation reason is required")
    @Size(max = 1000, message = "Cancellation reason cannot exceed 1000 characters")
    private String cancellationReason;
}