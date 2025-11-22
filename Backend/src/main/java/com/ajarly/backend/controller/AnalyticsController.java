package com.ajarly.backend.controller;

import com.ajarly.backend.dto.ApiResponse;
import com.ajarly.backend.dto.OwnerDashboardResponse;
import com.ajarly.backend.dto.PlatformAnalyticsResponse;
import com.ajarly.backend.dto.PropertyAnalyticsResponse;
import com.ajarly.backend.exception.ResourceNotFoundException;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.Review;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.ReviewRepository;
import com.ajarly.backend.repository.UserRepository;
import com.ajarly.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
    private final ReviewRepository reviewRepository;
    
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
            Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
            
            Long currentUserId = getCurrentUserId();
            log.info("Current User ID: {}", currentUserId);
            log.info("Property Owner ID: {}", property.getOwner().getUserId());
            
            if (!property.getOwner().getUserId().equals(currentUserId) && !isAdmin()) {
                log.error("Authorization failed - Current: {}, Owner: {}", 
                         currentUserId, property.getOwner().getUserId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to view analytics for this property"));
            }
            
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            if (startDate == null) {
                startDate = endDate.minusDays(30);
            }
            
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
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            if (startDate == null) {
                startDate = endDate.minusDays(30);
            }
            
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
    
    // ============================================
    // ✅ NEW ADMIN ENDPOINTS FOR RATING MANAGEMENT
    // ============================================
    
    /**
     * ✅ POST /api/v1/analytics/admin/recalculate-ratings
     * Recalculate all property ratings
     * 
     * Use this endpoint to fix any rating discrepancies
     */
    @PostMapping("/admin/recalculate-ratings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recalculateAllRatings() {
        log.info("🔄 Admin triggered rating recalculation");
        
        try {
            List<Property> allProperties = propertyRepository.findAll();
            log.info("📊 Found {} properties to recalculate", allProperties.size());
            
            int updated = 0;
            int failed = 0;
            Map<String, String> errors = new HashMap<>();
            
            for (Property property : allProperties) {
                try {
                    // Get approved reviews for this property
                    Optional<Double> avgRatingOpt = reviewRepository
                        .getAverageRatingByPropertyId(property.getPropertyId());
                    
                    Long totalReviewsCount = reviewRepository
                        .countApprovedByPropertyId(property.getPropertyId());
                    
                    double avgRating = avgRatingOpt.orElse(0.0);
                    int totalReviews = totalReviewsCount != null ? totalReviewsCount.intValue() : 0;
                    
                    // Update property
                    BigDecimal newRating = BigDecimal.valueOf(avgRating)
                        .setScale(2, RoundingMode.HALF_UP);
                    
                    property.setAverageRating(newRating);
                    property.setTotalReviews(totalReviews);
                    
                    propertyRepository.save(property);
                    
                    log.debug("✅ Property {} updated: rating={}, reviews={}", 
                             property.getPropertyId(), newRating, totalReviews);
                    
                    updated++;
                    
                } catch (Exception e) {
                    failed++;
                    errors.put("property_" + property.getPropertyId(), e.getMessage());
                    log.error("❌ Failed to update property {}: {}", 
                             property.getPropertyId(), e.getMessage());
                }
            }
            
            // Build response
            Map<String, Object> result = new HashMap<>();
            result.put("totalProperties", allProperties.size());
            result.put("updated", updated);
            result.put("failed", failed);
            result.put("errors", errors);
            result.put("timestamp", LocalDate.now());
            
            log.info("✅ Recalculation completed: {} updated, {} failed", updated, failed);
            
            return ResponseEntity.ok(
                ApiResponse.success(result, "Property ratings recalculated successfully")
            );
            
        } catch (Exception e) {
            log.error("❌ Rating recalculation failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to recalculate ratings: " + e.getMessage()));
        }
    }
    
    /**
     * ✅ GET /api/v1/analytics/property/{id}/rating-details
     * Get detailed rating info for a property
     */
    @GetMapping("/property/{id}/rating-details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPropertyRatingDetails(
            @PathVariable("id") Long propertyId) {
        
        log.info("📊 Fetching rating details for property: {}", propertyId);
        
        try {
            Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
            
            // Check authorization
            Long currentUserId = getCurrentUserId();
            if (!property.getOwner().getUserId().equals(currentUserId) && !isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Not authorized to view this property's details"));
            }
            
            // Get reviews
            List<Review> reviews = reviewRepository
                .findByPropertyIdAndApproved(propertyId, Pageable.unpaged())
                .getContent();
            
            // Calculate statistics
            Optional<Double> avgRatingOpt = reviewRepository
                .getAverageRatingByPropertyId(propertyId);
            Long totalReviewsCount = reviewRepository
                .countApprovedByPropertyId(propertyId);
            
            // Build detailed response
            Map<String, Object> details = new HashMap<>();
            details.put("propertyId", propertyId);
            details.put("propertyTitle", property.getTitleEn());
            details.put("currentRating", property.getAverageRating());
            details.put("currentReviewCount", property.getTotalReviews());
            details.put("calculatedRating", avgRatingOpt.orElse(0.0));
            details.put("calculatedReviewCount", totalReviewsCount);
            details.put("reviewsInDatabase", reviews.size());
            
            // Add individual review ratings
            List<Map<String, Object>> reviewDetails = reviews.stream()
                .map(r -> {
                    Map<String, Object> rd = new HashMap<>();
                    rd.put("reviewId", r.getReviewId());
                    rd.put("rating", r.getOverallRating());
                    rd.put("isApproved", r.getIsApproved());
                    rd.put("createdAt", r.getCreatedAt());
                    rd.put("reviewerName", r.getReviewer().getFirstName() + " " + r.getReviewer().getLastName());
                    return rd;
                })
                .collect(Collectors.toList());
            
            details.put("reviews", reviewDetails);
            
            // Check if there's a mismatch
            BigDecimal calculatedRating = BigDecimal.valueOf(avgRatingOpt.orElse(0.0))
                .setScale(2, RoundingMode.HALF_UP);
            boolean mismatch = !property.getAverageRating().equals(calculatedRating);
            details.put("hasMismatch", mismatch);
            
            if (mismatch) {
                details.put("mismatchInfo", Map.of(
                    "stored", property.getAverageRating(),
                    "calculated", calculatedRating,
                    "difference", property.getAverageRating().subtract(calculatedRating)
                ));
            }
            
            return ResponseEntity.ok(
                ApiResponse.success(details, "Rating details retrieved successfully")
            );
            
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching rating details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve rating details"));
        }
    }
    
    /**
     * ✅ POST /api/v1/analytics/property/{id}/fix-rating
     * Fix rating for a specific property
     */
    @PostMapping("/property/{id}/fix-rating")
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> fixPropertyRating(
            @PathVariable("id") Long propertyId) {
        
        log.info("🔧 Fixing rating for property: {}", propertyId);
        
        try {
            Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
            
            // Check authorization
            Long currentUserId = getCurrentUserId();
            if (!property.getOwner().getUserId().equals(currentUserId) && !isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Not authorized to fix this property's rating"));
            }
            
            // Get old values
            BigDecimal oldRating = property.getAverageRating();
            Integer oldReviewCount = property.getTotalReviews();
            
            // Calculate new values
            Optional<Double> avgRatingOpt = reviewRepository
                .getAverageRatingByPropertyId(propertyId);
            Long totalReviewsCount = reviewRepository
                .countApprovedByPropertyId(propertyId);
            
            double avgRating = avgRatingOpt.orElse(0.0);
            int totalReviews = totalReviewsCount != null ? totalReviewsCount.intValue() : 0;
            
            BigDecimal newRating = BigDecimal.valueOf(avgRating)
                .setScale(2, RoundingMode.HALF_UP);
            
            // Update property
            property.setAverageRating(newRating);
            property.setTotalReviews(totalReviews);
            propertyRepository.save(property);
            
            // Build response
            Map<String, Object> result = new HashMap<>();
            result.put("propertyId", propertyId);
            result.put("propertyTitle", property.getTitleEn());
            result.put("oldRating", oldRating);
            result.put("newRating", newRating);
            result.put("oldReviewCount", oldReviewCount);
            result.put("newReviewCount", totalReviews);
            result.put("wasFixed", !oldRating.equals(newRating) || !oldReviewCount.equals(totalReviews));
            
            log.info("✅ Property {} rating fixed: {} -> {}", 
                     propertyId, oldRating, newRating);
            
            return ResponseEntity.ok(
                ApiResponse.success(result, "Property rating fixed successfully")
            );
            
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fixing property rating", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fix property rating"));
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
            
            String principal = authentication.getName();
            log.debug("Authentication principal: {}", principal);
            
            // Try to parse as Long (user ID)
            try {
                return Long.parseLong(principal);
            } catch (NumberFormatException e) {
                // If it's not a number, it might be an email - look up user
                log.debug("Principal is not a number, attempting email lookup: {}", principal);
                var user = userRepository.findByEmail(principal)
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + principal));
                return user.getUserId();
            }
            
        } catch (Exception e) {
            log.error("Error extracting user ID from authentication", e);
            throw new ResourceNotFoundException("Unable to determine current user: " + e.getMessage());
        }
    }
    
    /**
     * التحقق من صلاحية Admin
     */
    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }
}