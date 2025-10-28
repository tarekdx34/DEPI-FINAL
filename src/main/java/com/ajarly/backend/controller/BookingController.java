package com.ajarly.backend.controller;

import com.ajarly.backend.dto.*;
import com.ajarly.backend.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Booking Controller - JWT Authentication Enabled
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class BookingController {
    
    private final BookingService bookingService;
    
    /**
     * Helper method to extract userId from JWT (set by JwtAuthenticationFilter)
     */
    private Integer getUserIdFromRequest(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userId.intValue();
    }
    
    /**
     * Create a new booking request
     * POST /api/v1/bookings
     * 
     * FIXED: Changed from hasAnyRole to hasAnyAuthority
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('renter', 'landlord', 'broker', 'ROLE_renter', 'ROLE_landlord', 'ROLE_broker')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BookingListResponse>>> getUserBookings(
            @RequestParam(required = false) String status,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
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
    @PreAuthorize("hasAnyAuthority('landlord', 'broker', 'ROLE_landlord', 'ROLE_broker')")
    public ResponseEntity<ApiResponse<List<BookingListResponse>>> getOwnerBookings(
            @RequestParam(required = false) String status,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BookingListResponse>>> getUpcomingBookings(
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
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
    @PreAuthorize("hasAnyAuthority('landlord', 'broker', 'ROLE_landlord', 'ROLE_broker')")
    public ResponseEntity<ApiResponse<List<BookingListResponse>>> getOwnerUpcomingBookings(
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
        log.info("Fetching booking {} for user {}", id, userId);
        
        BookingResponse booking = bookingService.getBookingById(id, userId);
        
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking details retrieved"));
    }
    
    /**
     * Confirm a booking (owner only)
     * PUT /api/v1/bookings/{id}/confirm
     */
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyAuthority('landlord', 'broker', 'ROLE_landlord', 'ROLE_broker')")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @PathVariable Integer id,
            @RequestBody(required = false) BookingConfirmRequest request,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
        log.info("Owner {} confirming booking {}", userId, id);
        
        BookingResponse booking = bookingService.confirmBooking(id, userId, request);
        
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking confirmed successfully"));
    }
    
    /**
     * Reject a booking (owner only)
     * PUT /api/v1/bookings/{id}/reject
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('landlord', 'broker', 'ROLE_landlord', 'ROLE_broker')")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable Integer id,
            @Valid @RequestBody BookingRejectRequest request,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
        log.info("Owner {} rejecting booking {}", userId, id);
        
        BookingResponse booking = bookingService.rejectBooking(id, userId, request);
        
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking rejected"));
    }
    
    /**
     * Cancel a booking (renter or owner)
     * PUT /api/v1/bookings/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Integer id,
            @Valid @RequestBody BookingCancelRequest request,
            HttpServletRequest httpRequest) {
        
        Integer userId = getUserIdFromRequest(httpRequest);
        
        log.info("User {} cancelling booking {}", userId, id);
        
        BookingResponse booking = bookingService.cancelBooking(id, userId, request);
        
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking cancelled successfully"));
    }
    
    /**
     * Check property availability (No authentication required)
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