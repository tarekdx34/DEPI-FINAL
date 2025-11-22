package com.ajarly.backend.dto;

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
public class DashboardStatsResponse {
    private Long totalUsers;
    private Long totalProperties;
    private Long totalBookings;
    private BigDecimal totalRevenue;
    private Long pendingApprovalsCount;
    private Long bannedUsersCount;
    private Long activeProperties;
    private RecentActivitySummary recentActivity;
}
