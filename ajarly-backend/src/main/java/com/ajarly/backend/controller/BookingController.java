package com.ajarly.backend.controller;

import com.ajarly.backend.dto.*;
import com.ajarly.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Booking Controller
 * 
 * NOTE: JWT Authentication is commented out for testing purposes.
 * Using X-User-Id header instead. Uncomment JWT authentication before production.
 * 
 * TODO: Before production deployment:
 * 1. Uncomment @PreAuthorize annotations
 * 2. Replace X-User-Id header with JWT token parsing
 * 3. Use Authentication principal to get userId
 * 4. Remove X-User-Id header parameter
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
// @PreAuthorize("isAuthenticated()") // TODO: Uncomment for production
public class BookingController {
    
    private final BookingService bookingService;
    
    // TODO: For production, inject AuthenticationFacade or similar to get current user
    // private final AuthenticationFacade authenticationFacade;
    
    /**
     * Create a new booking request
     * POST /api/v1/bookings
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        // TODO: In production, get userId from JWT token
        // For now, using header for testing
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("Creating booking request for property {} by user {}", request.getPropertyId(), userId);
        
        BookingResponse booking = bookingService.createBooking(request, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(booking, "Booking request created successfully"));
    }
    
    /**
     * Get user's bookings (as renter)
     * GET /api/v1/bookings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingListResponse>>> getUserBookings(
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("Fetching bookings for renter {}", userId);
        
        List<BookingListResponse> bookings = bookingService.getRenterBookings(userId, status);
        
        return ResponseEntity.ok(ApiResponse.success(bookings, 
            "Fetched " + bookings.size() + " bookings"));
    }
    
    /**
     * Get bookings received by owner
     * GET /api/v1/bookings/owner
     */
    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<List<BookingListResponse>>> getOwnerBookings(
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("Fetching bookings for owner {}", userId);
        
        List<BookingListResponse> bookings = bookingService.getOwnerBookings(userId, status);
        
        return ResponseEntity.ok(ApiResponse.success(bookings, 
            "Fetched " + bookings.size() + " bookings"));
    }
    
    /**
     * Get upcoming bookings for renter
     * GET /api/v1/bookings/upcoming
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<BookingListResponse>>> getUpcomingBookings(
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("Fetching upcoming bookings for renter {}", userId);
        
        List<BookingListResponse> bookings = bookingService.getUpcomingRenterBookings(userId);
        
        return ResponseEntity.ok(ApiResponse.success(bookings, 
            "Fetched " + bookings.size() + " upcoming bookings"));
    }
    
    /**
     * Get upcoming bookings for owner
     * GET /api/v1/bookings/owner/upcoming
     */
    @GetMapping("/owner/upcoming")
    public ResponseEntity<ApiResponse<List<BookingListResponse>>> getOwnerUpcomingBookings(
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("Fetching upcoming bookings for owner {}", userId);
        
        List<BookingListResponse> bookings = bookingService.getUpcomingOwnerBookings(userId);
        
        return ResponseEntity.ok(ApiResponse.success(bookings, 
            "Fetched " + bookings.size() + " upcoming bookings"));
    }
    
    /**
     * Get booking details by ID
     * GET /api/v1/bookings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("Fetching booking {} for user {}", id, userId);
        
        BookingResponse booking = bookingService.getBookingById(id, userId);
        
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking details retrieved"));
    }
    
    /**
     * Confirm a booking (owner only)
     * PUT /api/v1/bookings/{id}/confirm
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @PathVariable Integer id,
            @RequestBody(required = false) BookingConfirmRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("Owner {} confirming booking {}", userId, id);
        
        BookingResponse booking = bookingService.confirmBooking(id, userId, request);
        
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking confirmed successfully"));
    }
    
    /**
     * Reject a booking (owner only)
     * PUT /api/v1/bookings/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable Integer id,
            @Valid @RequestBody BookingRejectRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("Owner {} rejecting booking {}", userId, id);
        
        BookingResponse booking = bookingService.rejectBooking(id, userId, request);
        
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking rejected"));
    }
    
    /**
     * Cancel a booking (renter or owner)
     * PUT /api/v1/bookings/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Integer id,
            @Valid @RequestBody BookingCancelRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
        }
        
        log.info("User {} cancelling booking {}", userId, id);
        
        BookingResponse booking = bookingService.cancelBooking(id, userId, request);
        
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking cancelled successfully"));
    }
    
    /**
     * Check property availability
     * GET /api/v1/bookings/availability/check
     */
    @GetMapping("/availability/check")
    public ResponseEntity<ApiResponse<AvailabilityCheckResponse>> checkAvailability(
            @RequestParam Integer propertyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        
        log.info("Checking availability for property {} from {} to {}", propertyId, checkIn, checkOut);
        
        AvailabilityCheckResponse availability = bookingService.checkAvailability(propertyId, checkIn, checkOut);
        
        return ResponseEntity.ok(ApiResponse.success(availability, 
            availability.getAvailable() ? "Property is available" : "Property is not available"));
    }
}