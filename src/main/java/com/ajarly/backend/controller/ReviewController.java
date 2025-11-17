package com.ajarly.backend.controller;

import com.ajarly.backend.dto.ReviewDto;
import com.ajarly.backend.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    /**
     * Extract userId from JWT token
     */
    private Long getUserIdFromRequest(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return (Long) userId;
    }
    
    // ==================== PUBLIC ENDPOINTS ====================
    
    /**
     * ✅ Get reviews for a specific property - PUBLIC ENDPOINT
     * GET /api/v1/reviews/property/{propertyId}
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<Map<String, Object>> getPropertyReviews(
            @PathVariable Long propertyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        System.out.println("\n🎯 ========================================");
        System.out.println("🎯 GET PROPERTY REVIEWS ENDPOINT CALLED");
        System.out.println("🎯 Property ID: " + propertyId);
        System.out.println("🎯 Page: " + page + ", Size: " + size);
        System.out.println("🎯 ========================================\n");
        
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") 
                    ? Sort.Direction.ASC 
                    : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<ReviewDto.Response> reviews = reviewService.getPropertyReviews(propertyId, pageable);
            
            Map<String, Object> data = new HashMap<>();
            data.put("content", reviews.getContent());
            data.put("currentPage", reviews.getNumber());
            data.put("totalElements", reviews.getTotalElements());
            data.put("totalPages", reviews.getTotalPages());
            data.put("pageSize", reviews.getSize());
            data.put("hasNext", reviews.hasNext());
            data.put("hasPrevious", reviews.hasPrevious());
            
            System.out.println("✅ Returning " + reviews.getContent().size() + " reviews for property " + propertyId);
            
            return buildSuccessResponse("Reviews retrieved successfully", data, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("❌ Error getting property reviews: " + e.getMessage());
            e.printStackTrace();
            return buildErrorResponse("Failed to retrieve reviews: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ==================== AUTHENTICATED ENDPOINTS ====================
    
    /**
     * Create a new review
     * POST /api/v1/reviews
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> createReview(
            @Valid @RequestBody ReviewDto.CreateRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            ReviewDto.Response review = reviewService.createReview(request, userId);
            return buildSuccessResponse("Review created successfully", review, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while creating the review", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ==================== ADMIN ENDPOINTS ====================
    
    /**
     * ✅ Admin approves a review
     * PUT /api/v1/reviews/{id}/approve
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approveReview(
            @PathVariable Long id,
            HttpServletRequest httpRequest
    ) {
        System.out.println("\n🎯 ========================================");
        System.out.println("🎯 APPROVE REVIEW ENDPOINT CALLED");
        System.out.println("🎯 Review ID: " + id);
        System.out.println("🎯 ========================================\n");
        
        try {
            Long adminId = getUserIdFromRequest(httpRequest);
            System.out.println("✅ Admin ID from token: " + adminId);
            
            ReviewDto.Response review = reviewService.approveReview(id, adminId);
            
            System.out.println("✅ Service returned successfully");
            System.out.println("   Review approved: " + review.getIsApproved());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review approved successfully");
            response.put("data", review);
            
            System.out.println("\n✅ ======================================");
            System.out.println("✅ SENDING SUCCESS RESPONSE");
            System.out.println("✅ ======================================\n");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("\n❌ ======================================");
            System.err.println("❌ RUNTIME ERROR IN CONTROLLER");
            System.err.println("❌ Message: " + e.getMessage());
            System.err.println("❌ ======================================\n");
            e.printStackTrace();
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
            
        } catch (Exception e) {
            System.err.println("\n❌ ======================================");
            System.err.println("❌ UNEXPECTED ERROR IN CONTROLLER");
            System.err.println("❌ Message: " + e.getMessage());
            System.err.println("❌ ======================================\n");
            e.printStackTrace();
            return buildErrorResponse(
                "An error occurred while approving the review: " + e.getMessage(), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    /**
     * ✅ Admin rejects a review
     * PUT /api/v1/reviews/{id}/reject
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectReview(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody,
            HttpServletRequest httpRequest
    ) {
        System.out.println("🎯 REJECT REVIEW ENDPOINT - Review ID: " + id);
        
        try {
            Long adminId = getUserIdFromRequest(httpRequest);
            String reason = (requestBody != null && requestBody.containsKey("reason")) 
                    ? requestBody.get("reason") 
                    : "Does not meet guidelines";
            
            ReviewDto.Response review = reviewService.rejectReview(id, reason, adminId);
            
            return buildSuccessResponse("Review rejected successfully", review, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Reject error: " + e.getMessage());
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("❌ Unexpected reject error: " + e.getMessage());
            e.printStackTrace();
            return buildErrorResponse(
                "An error occurred while rejecting the review", 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    /**
     * ✅ Admin gets all reviews
     * GET /api/v1/reviews/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllReviewsForAdmin(
            @RequestParam(required = false) Boolean isApproved,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        System.out.println("\n🎯 ========================================");
        System.out.println("🎯 GET ALL REVIEWS ENDPOINT CALLED");
        System.out.println("🎯 Filter: isApproved = " + isApproved);
        System.out.println("🎯 Page: " + page + ", Size: " + size);
        System.out.println("🎯 ========================================\n");
        
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") 
                    ? Sort.Direction.ASC 
                    : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            System.out.println("🔄 Calling reviewService.getAllReviewsForAdmin...");
            
            Page<ReviewDto.Response> reviews = reviewService.getAllReviewsForAdmin(isApproved, pageable);
            
            System.out.println("✅ Service returned " + reviews.getContent().size() + " reviews");
            
            Map<String, Object> data = new HashMap<>();
            data.put("content", reviews.getContent());
            data.put("currentPage", reviews.getNumber());
            data.put("totalElements", reviews.getTotalElements());
            data.put("totalPages", reviews.getTotalPages());
            data.put("pageSize", reviews.getSize());
            data.put("hasNext", reviews.hasNext());
            data.put("hasPrevious", reviews.hasPrevious());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reviews retrieved successfully");
            response.put("data", data);
            
            System.out.println("\n✅ ======================================");
            System.out.println("✅ SENDING " + reviews.getContent().size() + " REVIEWS");
            System.out.println("✅ ======================================\n");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("\n❌ ======================================");
            System.err.println("❌ GET REVIEWS ERROR");
            System.err.println("❌ Message: " + e.getMessage());
            System.err.println("❌ ======================================\n");
            e.printStackTrace();
            
            return buildErrorResponse(
                "An error occurred while retrieving reviews: " + e.getMessage(), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    /**
     * ✅ Admin gets review statistics
     * GET /api/v1/reviews/admin/stats
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getReviewStatsForAdmin() {
        System.out.println("🎯 GET REVIEW STATS ENDPOINT CALLED");
        
        try {
            Map<String, Object> stats = reviewService.getReviewStatsForAdmin();
            
            System.out.println("✅ Stats retrieved successfully");
            
            return buildSuccessResponse("Statistics retrieved successfully", stats, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("❌ Stats error: " + e.getMessage());
            e.printStackTrace();
            
            return buildErrorResponse(
                "An error occurred while retrieving statistics", 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    // ==================== Helper Methods ====================
    
    /**
     * Build success response
     */
    private ResponseEntity<Map<String, Object>> buildSuccessResponse(
            String message, 
            Object data, 
            HttpStatus status
    ) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.status(status).body(response);
    }
    
    /**
     * Build error response
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            String message, 
            HttpStatus status
    ) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("data", null);
        return ResponseEntity.status(status).body(response);
    }
}