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
     * Extract userId from JWT token (set by JwtAuthenticationFilter)
     */
    private Long getUserIdFromRequest(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return (Long) userId;
    }
    
    /**
     * Create a new review for a completed booking
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
    
    /**
     * Get all approved reviews for a property
     * GET /api/v1/reviews/property/{propertyId}
     * PUBLIC - No authentication required
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
     * PUBLIC - No authentication required
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
     * PUBLIC - No authentication required
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
     * GET /api/v1/reviews/owner/{ownerId}
     * PUBLIC - No authentication required
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
     * PUBLIC - No authentication required
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> respondToReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDto.OwnerResponseRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            Long ownerId = getUserIdFromRequest(httpRequest);
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateOwnerResponse(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDto.OwnerResponseRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            Long ownerId = getUserIdFromRequest(httpRequest);
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Long id,
            HttpServletRequest httpRequest
    ) {
        try {
            Long adminId = getUserIdFromRequest(httpRequest);
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> canReviewBooking(
            @PathVariable Integer bookingId,
            HttpServletRequest httpRequest
    ) {
        try {
            Long userId = getUserIdFromRequest(httpRequest);
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