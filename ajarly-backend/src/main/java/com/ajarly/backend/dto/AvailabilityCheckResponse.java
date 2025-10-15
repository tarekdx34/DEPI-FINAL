package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityCheckResponse {
    private Boolean available;
    private String message;
    private LocalDate unavailableFrom;
    private LocalDate unavailableTo;
}