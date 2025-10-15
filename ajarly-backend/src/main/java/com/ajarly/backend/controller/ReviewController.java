package com.ajarly.backend.controller;

import com.ajarly.backend.dto.ReviewDto;
import com.ajarly.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
     * Create a new review for a completed booking
     * POST /api/v1/reviews
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(
            @Valid @RequestBody ReviewDto.CreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId // TODO: Get from JWT
    ) {
        try {
            // TODO: Uncomment when JWT is ready
            // if (userId == null) {
            //     return buildErrorResponse("Authentication required", HttpStatus.UNAUTHORIZED);
            // }
            
            // TEMPORARY: For testing without JWT
            if (userId == null) {
                return buildErrorResponse("X-User-Id header is required for testing", HttpStatus.BAD_REQUEST);
            }
            
            ReviewDto.Response review = reviewService.createReview(request, userId);
            
            return buildSuccessResponse("Review created successfully", review, HttpStatus.CREATED);
            
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while creating the review", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get all approved reviews for a property
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
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? 
                    Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<ReviewDto.Response> reviews = reviewService.getPropertyReviews(propertyId, pageable);
            
            Map<String, Object> data = new HashMap<>();
            data.put("reviews", reviews.getContent());
            data.put("currentPage", reviews.getNumber());
            data.put("totalItems", reviews.getTotalElements());
            data.put("totalPages", reviews.getTotalPages());
            
            return buildSuccessResponse("Reviews retrieved successfully", data, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while retrieving reviews", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get property review statistics
     * GET /api/v1/reviews/property/{propertyId}/stats
     */
    @GetMapping("/property/{propertyId}/stats")
    public ResponseEntity<Map<String, Object>> getPropertyReviewStats(@PathVariable Long propertyId) {
        try {
            ReviewDto.StatsResponse stats = reviewService.getPropertyReviewStats(propertyId);
            return buildSuccessResponse("Statistics retrieved successfully", stats, HttpStatus.OK);
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while retrieving statistics", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get reviews by a specific reviewer (user)
     * GET /api/v1/reviews/reviewer/{reviewerId}
     */
    @GetMapping("/reviewer/{reviewerId}")
    public ResponseEntity<Map<String, Object>> getReviewsByReviewer(
            @PathVariable Long reviewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<ReviewDto.Response> reviews = reviewService.getReviewsByReviewer(reviewerId, pageable);
            
            Map<String, Object> data = new HashMap<>();
            data.put("reviews", reviews.getContent());
            data.put("currentPage", reviews.getNumber());
            data.put("totalItems", reviews.getTotalElements());
            data.put("totalPages", reviews.getTotalPages());
            
            return buildSuccessResponse("Reviews retrieved successfully", data, HttpStatus.OK);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while retrieving reviews", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get reviews for a specific owner (reviews they received)
     * GET /api/* Get reviews for a specific owner (reviews they received)
     * GET /api/v1/reviews/owner/{ownerId}
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<Map<String, Object>> getReviewsForOwner(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<ReviewDto.Response> reviews = reviewService.getReviewsForOwner(ownerId, pageable);
            
            Map<String, Object> data = new HashMap<>();
            data.put("reviews", reviews.getContent());
            data.put("currentPage", reviews.getNumber());
            data.put("totalItems", reviews.getTotalElements());
            data.put("totalPages", reviews.getTotalPages());
            
            return buildSuccessResponse("Reviews retrieved successfully", data, HttpStatus.OK);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while retrieving reviews", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get a single review by ID
     * GET /api/v1/reviews/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getReviewById(@PathVariable Long id) {
        try {
            ReviewDto.Response review = reviewService.getReviewById(id);
            return buildSuccessResponse("Review retrieved successfully", review, HttpStatus.OK);
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while retrieving the review", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Owner responds to a review
     * PUT /api/v1/reviews/{id}/response
     */
    @PutMapping("/{id}/response")
    public ResponseEntity<Map<String, Object>> respondToReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDto.OwnerResponseRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long ownerId // TODO: Get from JWT
    ) {
        try {
            // TODO: Uncomment when JWT is ready
            // if (ownerId == null) {
            //     return buildErrorResponse("Authentication required", HttpStatus.UNAUTHORIZED);
            // }
            
            // TEMPORARY: For testing without JWT
            if (ownerId == null) {
                return buildErrorResponse("X-User-Id header is required for testing", HttpStatus.BAD_REQUEST);
            }
            
            ReviewDto.Response review = reviewService.respondToReview(id, request, ownerId);
            
            return buildSuccessResponse("Response added successfully", review, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while adding the response", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Update owner response
     * PATCH /api/v1/reviews/{id}/response
     */
    @PatchMapping("/{id}/response")
    public ResponseEntity<Map<String, Object>> updateOwnerResponse(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDto.OwnerResponseRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long ownerId // TODO: Get from JWT
    ) {
        try {
            if (ownerId == null) {
                return buildErrorResponse("X-User-Id header is required for testing", HttpStatus.BAD_REQUEST);
            }
            
            ReviewDto.Response review = reviewService.updateOwnerResponse(id, request, ownerId);
            
            return buildSuccessResponse("Response updated successfully", review, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while updating the response", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Admin deletes a review
     * DELETE /api/v1/reviews/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId // TODO: Get from JWT and verify admin role
    ) {
        try {
            // TODO: Uncomment when JWT is ready and add admin role check
            // if (adminId == null) {
            //     return buildErrorResponse("Authentication required", HttpStatus.UNAUTHORIZED);
            // }
            // if (!userService.isAdmin(adminId)) {
            //     return buildErrorResponse("Admin access required", HttpStatus.FORBIDDEN);
            // }
            
            // TEMPORARY: For testing without JWT
            if (adminId == null) {
                return buildErrorResponse("X-User-Id header is required for testing", HttpStatus.BAD_REQUEST);
            }
            
            reviewService.deleteReview(id, adminId);
            
            return buildSuccessResponse("Review deleted successfully", null, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while deleting the review", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Check if user can review a booking
     * GET /api/v1/reviews/booking/{bookingId}/can-review
     */
    @GetMapping("/booking/{bookingId}/can-review")
    public ResponseEntity<Map<String, Object>> canReviewBooking(
            @PathVariable Integer bookingId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        try {
            if (userId == null) {
                return buildErrorResponse("X-User-Id header is required for testing", HttpStatus.BAD_REQUEST);
            }
            
            boolean canReview = reviewService.canUserReviewBooking(bookingId, userId);
            
            Map<String, Object> data = new HashMap<>();
            data.put("canReview", canReview);
            data.put("bookingId", bookingId);
            
            return buildSuccessResponse("Check completed", data, HttpStatus.OK);
        } catch (Exception e) {
            return buildErrorResponse("An error occurred while checking review eligibility", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ==================== Helper Methods ====================
    
    /**
     * Build success response
     */
    private ResponseEntity<Map<String, Object>> buildSuccessResponse(String message, Object data, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.status(status).body(response);
    }
    
    /**
     * Build error response
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("data", null);
        return ResponseEntity.status(status).body(response);
    }
}