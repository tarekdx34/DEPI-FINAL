package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for recent activity summary in admin dashboard
 * Tracks activity from the last 7 days
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivitySummary {
    
    /**
     * Number of bookings created in the last 7 days
     */
    private Long recentBookings;
    
    /**
     * Number of user registrations in the last 7 days
     */
    private Long recentRegistrations;
    
    /**
     * Number of properties listed in the last 7 days
     */
    private Long recentPropertyListings;
    
    /**
     * Timestamp when this summary was generated
     */
    private LocalDateTime generatedAt;
}