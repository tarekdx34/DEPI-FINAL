package com.ajarly.backend.controller;

import com.ajarly.backend.dto.ApiResponse;
import com.ajarly.backend.dto.OwnerDashboardResponse;
import com.ajarly.backend.dto.PlatformAnalyticsResponse;
import com.ajarly.backend.dto.PropertyAnalyticsResponse;
import com.ajarly.backend.exception.ResourceNotFoundException;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.UserRepository;
import com.ajarly.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Analytics Controller
 * يوفر endpoints للتحليلات والإحصائيات
 */
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    
    /**
     * GET /api/v1/analytics/property/{id}
     * الحصول على تحليلات أداء عقار معين
     */
    @GetMapping("/property/{id}")
    public ResponseEntity<ApiResponse<PropertyAnalyticsResponse>> getPropertyPerformance(
            @PathVariable("id") Long propertyId,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("GET /api/v1/analytics/property/{} - Start: {}, End: {}", propertyId, startDate, endDate);
        
        try {
            // Verify property exists
            Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
            
            // Get current user
            Long currentUserId = getCurrentUserId();
            log.info("Current User ID: {}", currentUserId);
            log.info("Property Owner ID: {}", property.getOwner().getUserId());
            
            // Check authorization
            if (!property.getOwner().getUserId().equals(currentUserId) && !isAdmin()) {
                log.error("Authorization failed - Current: {}, Owner: {}", 
                         currentUserId, property.getOwner().getUserId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to view analytics for this property"));
            }
            
            // Set default dates if not provided
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            if (startDate == null) {
                startDate = endDate.minusDays(30);
            }
            
            // Validate date range
            if (startDate.isAfter(endDate)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Start date cannot be after end date"));
            }
            
            PropertyAnalyticsResponse analytics = analyticsService.getPropertyPerformance(
                propertyId, startDate, endDate);
            
            return ResponseEntity.ok(
                ApiResponse.success(analytics, "Property analytics retrieved successfully"));
            
        } catch (ResourceNotFoundException e) {
            log.error("Property not found: {}", propertyId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching property analytics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve property analytics: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/v1/analytics/owner/dashboard
     * الحصول على لوحة تحكم المالك (Owner Dashboard)
     */
    @GetMapping("/owner/dashboard")
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<OwnerDashboardResponse>> getOwnerDashboard() {
        log.info("GET /api/v1/analytics/owner/dashboard");
        
        try {
            Long currentUserId = getCurrentUserId();
            log.info("Fetching dashboard for user ID: {}", currentUserId);
            
            OwnerDashboardResponse dashboard = analyticsService.getOwnerDashboard(currentUserId);
            
            return ResponseEntity.ok(
                ApiResponse.success(dashboard, "Owner dashboard retrieved successfully"));
            
        } catch (ResourceNotFoundException e) {
            log.error("Owner not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching owner dashboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve owner dashboard: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/v1/analytics/admin/platform
     * الحصول على تحليلات المنصة بالكامل (Admin Only)
     * 
     * ✅ FIXED: Changed path and PreAuthorize annotation
     */
    @GetMapping("/admin/platform")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlatformAnalyticsResponse>> getPlatformAnalytics(
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("GET /api/v1/analytics/admin/platform - Start: {}, End: {}", startDate, endDate);
        
        try {
            // Log current user for debugging
            Long currentUserId = getCurrentUserId();
            log.info("Admin analytics requested by user ID: {}", currentUserId);
            
            // Set default dates if not provided
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            if (startDate == null) {
                startDate = endDate.minusDays(30);
            }
            
            // Validate date range
            if (startDate.isAfter(endDate)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Start date cannot be after end date"));
            }
            
            PlatformAnalyticsResponse analytics = analyticsService.getPlatformAnalytics(
                startDate, endDate);
            
            return ResponseEntity.ok(
                ApiResponse.success(analytics, "Platform analytics retrieved successfully"));
            
        } catch (Exception e) {
            log.error("Error fetching platform analytics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve platform analytics: " + e.getMessage()));
        }
    }
    
    // ============ Helper Methods ============
    
    /**
     * الحصول على معرف المستخدم الحالي من Spring Security Authentication
     * 
     * FIXED: Now correctly extracts user ID from JWT authentication
     */
    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new ResourceNotFoundException("No authenticated user found");
            }
            
            // The principal should be the user ID as Long (set by JwtAuthenticationFilter)
            Object principal = authentication.getPrincipal();
            log.debug("Authentication principal: {} (type: {})", principal, principal.getClass().getName());
            
            // If principal is already a Long (from our JWT filter)
            if (principal instanceof Long) {
                return (Long) principal;
            }
            
            // If it's a String, try to parse as Long
            if (principal instanceof String) {
                String principalStr = (String) principal;
                try {
                    return Long.parseLong(principalStr);
                } catch (NumberFormatException e) {
                    // If it's not a number, it might be an email - look up user
                    log.debug("Principal is not a number, attempting email lookup: {}", principalStr);
                    var user = userRepository.findByEmail(principalStr)
                        .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found with email: " + principalStr));
                    return user.getUserId();
                }
            }
            
            throw new ResourceNotFoundException("Unable to extract user ID from principal type: " 
                + principal.getClass().getName());
            
        } catch (Exception e) {
            log.error("Error extracting user ID from authentication", e);
            throw new ResourceNotFoundException("Unable to determine current user: " + e.getMessage());
        }
    }
    
    /**
     * التحقق من صلاحية Admin
     * ✅ FIXED: Check for ROLE_ADMIN instead of just "admin"
     */
    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
            .anyMatch(auth -> 
                auth.getAuthority().equals("ROLE_ADMIN") || 
                auth.getAuthority().equals("ADMIN"));
    }
}