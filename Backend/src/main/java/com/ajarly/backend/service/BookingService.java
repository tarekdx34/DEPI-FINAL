package com.ajarly.backend.service;

import com.ajarly.backend.dto.*;
import com.ajarly.backend.exception.ResourceNotFoundException;
import com.ajarly.backend.exception.BusinessException;
import com.ajarly.backend.model.*;
import com.ajarly.backend.model.Booking.BookingStatus;
import com.ajarly.backend.model.UnavailableDate.UnavailableReason;
import com.ajarly.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final UnavailableDateRepository unavailableDateRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    
    private static final BigDecimal SERVICE_FEE_PERCENT = new BigDecimal("10.0");
    private static final int MIN_RENTAL_DAYS = 1;
    private static final int MAX_RENTAL_DAYS = 365;
    private static final int BOOKING_EXPIRY_HOURS = 48;
    
    /**
     * Create a new booking request
     */
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, Integer renterId) {
        log.info("Creating booking for property {} by renter {}", request.getPropertyId(), renterId);
        
        // Validate dates
        validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());
        
        // Calculate number of nights
        long numberOfNights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (numberOfNights < MIN_RENTAL_DAYS || numberOfNights > MAX_RENTAL_DAYS) {
            throw new BusinessException(
                String.format("Rental duration must be between %d and %d days", MIN_RENTAL_DAYS, MAX_RENTAL_DAYS)
            );
        }
        
        // Get property
        Property property = propertyRepository.findById(Long.valueOf(request.getPropertyId()))
            .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + request.getPropertyId()));
        
        // Check if property is active
        if (!property.getStatus().equals(Property.PropertyStatus.active)) {
            throw new BusinessException("Property is not available for booking");
        }
        
        // Validate number of guests
        if (request.getNumberOfGuests() > property.getGuestsCapacity()) {
            throw new BusinessException(
                String.format("Property capacity is %d guests, but %d guests requested", 
                    property.getGuestsCapacity(), request.getNumberOfGuests())
            );
        }
        
        // Check property availability
        checkPropertyAvailability(request.getPropertyId(), request.getCheckInDate(), request.getCheckOutDate());
        
        // Get renter
        User renter = userRepository.findById(Long.valueOf(renterId))
            .orElseThrow(() -> new ResourceNotFoundException("Renter not found"));
        
        // Get owner
        User owner = property.getOwner();
        
        // Prevent self-booking
        if (renterId.equals(owner.getUserId().intValue())) {
            throw new BusinessException("You cannot book your own property");
        }
        
        // Calculate pricing
        BigDecimal pricePerNight = property.getPricePerNight();
        BigDecimal subtotal = pricePerNight.multiply(BigDecimal.valueOf(numberOfNights));
        BigDecimal cleaningFee = property.getCleaningFee() != null ? property.getCleaningFee() : BigDecimal.ZERO;
        BigDecimal serviceFee = subtotal.multiply(SERVICE_FEE_PERCENT)
            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal totalPrice = subtotal.add(cleaningFee).add(serviceFee);
        
        // Create booking
        Booking booking = new Booking();
        booking.setBookingReference(generateBookingReference());
        booking.setProperty(property);
        booking.setRenter(renter);
        booking.setOwner(owner);
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumberOfNights((int) numberOfNights);
        booking.setNumberOfGuests(request.getNumberOfGuests());
        booking.setNumberOfAdults(request.getNumberOfAdults());
        booking.setNumberOfChildren(request.getNumberOfChildren());
        booking.setPricePerNight(pricePerNight);
        booking.setSubtotal(subtotal);
        booking.setCleaningFee(cleaningFee);
        booking.setServiceFee(serviceFee);
        booking.setTotalPrice(totalPrice);
        booking.setSecurityDeposit(property.getSecurityDeposit() != null ? property.getSecurityDeposit() : BigDecimal.ZERO);
        booking.setCurrency(property.getCurrency());
        booking.setStatus(BookingStatus.pending);
        booking.setPaymentStatus(Booking.PaymentStatus.unpaid);
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setRequestedAt(LocalDateTime.now());
        booking.setExpiresAt(LocalDateTime.now().plusHours(BOOKING_EXPIRY_HOURS));
        
        // Save booking
        booking = bookingRepository.save(booking);
        
        log.info("Booking created successfully with reference: {}", booking.getBookingReference());
        
        // Update property statistics
        property.setBookingRequestCount(property.getBookingRequestCount() + 1);
        propertyRepository.save(property);
        
        return mapToBookingResponse(booking);
    }
    
    /**
     * Confirm a booking (by owner)
     */
    @Transactional
    public BookingResponse confirmBooking(Integer bookingId, Integer ownerId, BookingConfirmRequest request) {
        log.info("Confirming booking {} by owner {}", bookingId, ownerId);
        
        // ✅ FIXED: Use findByIdWithDetails
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        // Verify owner
        if (!booking.getOwner().getUserId().equals(Long.valueOf(ownerId))) {
            throw new BusinessException("You are not authorized to confirm this booking");
        }
        
        // Check if booking is pending
        if (!booking.getStatus().equals(BookingStatus.pending)) {
            throw new BusinessException("Only pending bookings can be confirmed");
        }
        
        // Check if booking has expired
        if (booking.getExpiresAt() != null && booking.getExpiresAt().isBefore(LocalDateTime.now())) {
            booking.setStatus(BookingStatus.expired);
            bookingRepository.save(booking);
            throw new BusinessException("Booking has expired");
        }
        
        // Double-check availability - EXCLUDE CURRENT BOOKING
        checkPropertyAvailabilityExcludingBooking(
            booking.getProperty().getPropertyId().intValue(), 
            booking.getCheckInDate(), 
            booking.getCheckOutDate(),
            bookingId
        );
        
        // Update booking status
        booking.setStatus(BookingStatus.confirmed);
        booking.setConfirmedAt(LocalDateTime.now());
        booking.setOwnerResponse(request != null ? request.getOwnerResponse() : null);
        
        booking = bookingRepository.save(booking);
        
        // Add to unavailable dates
        UnavailableDate unavailableDate = new UnavailableDate();
        unavailableDate.setProperty(booking.getProperty());
        unavailableDate.setBooking(booking);
        unavailableDate.setUnavailableFrom(booking.getCheckInDate());
        unavailableDate.setUnavailableTo(booking.getCheckOutDate());
        unavailableDate.setReason(UnavailableReason.booked);
        unavailableDate.setCreatedBy(booking.getOwner());
        unavailableDateRepository.save(unavailableDate);
        
        // Update property statistics
        Property property = booking.getProperty();
        property.setBookingConfirmedCount(property.getBookingConfirmedCount() + 1);
        propertyRepository.save(property);
        
        log.info("Booking {} confirmed successfully", bookingId);
        
        return mapToBookingResponse(booking);
    }
    
    /**
     * Reject a booking (by owner)
     */
    @Transactional
    public BookingResponse rejectBooking(Integer bookingId, Integer ownerId, BookingRejectRequest request) {
        log.info("Rejecting booking {} by owner {}", bookingId, ownerId);
        
        // ✅ FIXED: Use findByIdWithDetails
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        // Verify owner
        if (!booking.getOwner().getUserId().equals(Long.valueOf(ownerId))) {
            throw new BusinessException("You are not authorized to reject this booking");
        }
        
        // Check if booking is pending
        if (!booking.getStatus().equals(BookingStatus.pending)) {
            throw new BusinessException("Only pending bookings can be rejected");
        }
        
        // Update booking status
        booking.setStatus(BookingStatus.rejected);
        booking.setRejectedAt(LocalDateTime.now());
        booking.setRejectionReason(request.getRejectionReason());
        
        booking = bookingRepository.save(booking);
        
        log.info("Booking {} rejected successfully", bookingId);
        
        return mapToBookingResponse(booking);
    }
    
    /**
     * Cancel a booking (by renter or owner)
     */
    @Transactional
    public BookingResponse cancelBooking(Integer bookingId, Integer userId, BookingCancelRequest request) {
        log.info("Cancelling booking {} by user {}", bookingId, userId);
        
        // ✅ FIXED: Use findByIdWithDetails
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        // Verify user is either renter or owner
        boolean isRenter = booking.getRenter().getUserId().equals(Long.valueOf(userId));
        boolean isOwner = booking.getOwner().getUserId().equals(Long.valueOf(userId));
        
        if (!isRenter && !isOwner) {
            throw new BusinessException("You are not authorized to cancel this booking");
        }
        
        // Check if booking can be cancelled
        if (booking.getStatus().equals(BookingStatus.cancelled_by_renter) || 
            booking.getStatus().equals(BookingStatus.cancelled_by_owner) ||
            booking.getStatus().equals(BookingStatus.completed) ||
            booking.getStatus().equals(BookingStatus.rejected) ||
            booking.getStatus().equals(BookingStatus.expired)) {
            throw new BusinessException("This booking cannot be cancelled");
        }
        
        // Calculate cancellation fee if needed (simple logic: 20% if within 7 days of check-in)
        BigDecimal cancellationFee = BigDecimal.ZERO;
        if (booking.getStatus().equals(BookingStatus.confirmed)) {
            long daysUntilCheckIn = ChronoUnit.DAYS.between(LocalDate.now(), booking.getCheckInDate());
            if (daysUntilCheckIn < 7) {
                cancellationFee = booking.getTotalPrice().multiply(new BigDecimal("0.20"))
                    .setScale(2, RoundingMode.HALF_UP);
            }
        }
        
        // Update booking status
        if (isRenter) {
            booking.setStatus(BookingStatus.cancelled_by_renter);
        } else {
            booking.setStatus(BookingStatus.cancelled_by_owner);
        }
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(request.getCancellationReason());
        booking.setCancellationFee(cancellationFee);
        booking.setRefundAmount(booking.getTotalPrice().subtract(cancellationFee));
        
        booking = bookingRepository.save(booking);
        
        // Remove from unavailable dates if confirmed
        unavailableDateRepository.deleteByBookingBookingId(bookingId);
        
        log.info("Booking {} cancelled successfully", bookingId);
        
        return mapToBookingResponse(booking);
    }
    
    /**
     * Get booking by ID
     */
    public BookingResponse getBookingById(Integer bookingId, Integer userId) {
        // ✅ FIXED: Use findByIdWithDetails
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        // Verify user has access to this booking
        if (!booking.getRenter().getUserId().equals(Long.valueOf(userId)) && 
            !booking.getOwner().getUserId().equals(Long.valueOf(userId))) {
            throw new BusinessException("You do not have permission to view this booking");
        }
        
        return mapToBookingResponse(booking);
    }
    
    /**
     * Get all bookings for a renter
     */
    public List<BookingListResponse> getRenterBookings(Integer renterId, String status) {
        List<Booking> bookings;
        
        if (status != null && !status.isEmpty()) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status);
            bookings = bookingRepository.findByRenterUserIdAndStatusOrderByRequestedAtDesc(Long.valueOf(renterId), bookingStatus);
        } else {
            bookings = bookingRepository.findByRenterUserIdOrderByRequestedAtDesc(Long.valueOf(renterId));
        }
        
        return bookings.stream()
            .map(b -> mapToBookingListResponse(b, true))
            .collect(Collectors.toList());
    }
    
    /**
     * Get all bookings for an owner
     */
    public List<BookingListResponse> getOwnerBookings(Integer ownerId, String status) {
        List<Booking> bookings;
        
        if (status != null && !status.isEmpty()) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status);
            bookings = bookingRepository.findByOwnerUserIdAndStatusOrderByRequestedAtDesc(Long.valueOf(ownerId), bookingStatus);
        } else {
            bookings = bookingRepository.findByOwnerUserIdOrderByRequestedAtDesc(Long.valueOf(ownerId));
        }
        
        return bookings.stream()
            .map(b -> mapToBookingListResponse(b, false))
            .collect(Collectors.toList());
    }
    
    /**
     * Get upcoming bookings for a renter
     */
    public List<BookingListResponse> getUpcomingRenterBookings(Integer renterId) {
        List<Booking> bookings = bookingRepository.findUpcomingBookingsForRenter(Long.valueOf(renterId), LocalDate.now());
        return bookings.stream()
            .map(b -> mapToBookingListResponse(b, true))
            .collect(Collectors.toList());
    }
    
    /**
     * Get upcoming bookings for an owner
     */
    public List<BookingListResponse> getUpcomingOwnerBookings(Integer ownerId) {
        List<Booking> bookings = bookingRepository.findUpcomingBookingsForOwner(Long.valueOf(ownerId), LocalDate.now());
        return bookings.stream()
            .map(b -> mapToBookingListResponse(b, false))
            .collect(Collectors.toList());
    }
    
    /**
     * Check property availability
     */
    public AvailabilityCheckResponse checkAvailability(Integer propertyId, LocalDate checkIn, LocalDate checkOut) {
        try {
            checkPropertyAvailability(propertyId, checkIn, checkOut);
            return new AvailabilityCheckResponse(true, "Property is available for the selected dates", null, null);
        } catch (BusinessException e) {
            List<UnavailableDate> conflicts = unavailableDateRepository.findByPropertyAndDateRange(
                Long.valueOf(propertyId), checkIn, checkOut);
            
            if (!conflicts.isEmpty()) {
                UnavailableDate firstConflict = conflicts.get(0);
                return new AvailabilityCheckResponse(
                    false, 
                    e.getMessage(),
                    firstConflict.getUnavailableFrom(),
                    firstConflict.getUnavailableTo()
                );
            }
            
            return new AvailabilityCheckResponse(false, e.getMessage(), null, null);
        }
    }
    
    /**
     * Auto-expire pending bookings (scheduled task)
     */
    @Transactional
    public void autoExpireBookings() {
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(LocalDateTime.now());
        
        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.expired);
            bookingRepository.save(booking);
            log.info("Auto-expired booking {}", booking.getBookingReference());
        }
        
        if (!expiredBookings.isEmpty()) {
            log.info("Auto-expired {} bookings", expiredBookings.size());
        }
    }
    
    /**
     * Auto-complete bookings (scheduled task)
     */
    @Transactional
    public void autoCompleteBookings() {
        List<Booking> bookingsToComplete = bookingRepository.findBookingsToComplete(LocalDate.now());
        
        for (Booking booking : bookingsToComplete) {
            booking.setStatus(BookingStatus.completed);
            booking.setCompletedAt(LocalDateTime.now());
            bookingRepository.save(booking);
            log.info("Auto-completed booking {}", booking.getBookingReference());
        }
        
        if (!bookingsToComplete.isEmpty()) {
            log.info("Auto-completed {} bookings", bookingsToComplete.size());
        }
    }
    
    // ========== PRIVATE HELPER METHODS ==========
    
    private void validateBookingDates(LocalDate checkIn, LocalDate checkOut) {
        LocalDate today = LocalDate.now();
        
        if (checkIn.isBefore(today)) {
            throw new BusinessException("Check-in date cannot be in the past");
        }
        
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new BusinessException("Check-out date must be after check-in date");
        }
    }
    
    private void checkPropertyAvailability(Integer propertyId, LocalDate checkIn, LocalDate checkOut) {
        Boolean hasUnavailable = unavailableDateRepository.hasUnavailableDates(Long.valueOf(propertyId), checkIn, checkOut);
        if (Boolean.TRUE.equals(hasUnavailable)) {
            throw new BusinessException("Property is not available for the selected dates");
        }
        
        Boolean hasOverlapping = bookingRepository.hasOverlappingBookings(Long.valueOf(propertyId), checkIn, checkOut);
        if (Boolean.TRUE.equals(hasOverlapping)) {
            throw new BusinessException("Property has overlapping bookings for the selected dates");
        }
    }
    
    private void checkPropertyAvailabilityExcludingBooking(Integer propertyId, LocalDate checkIn, LocalDate checkOut, Integer excludeBookingId) {
        Boolean hasUnavailable = unavailableDateRepository.hasUnavailableDates(Long.valueOf(propertyId), checkIn, checkOut);
        if (Boolean.TRUE.equals(hasUnavailable)) {
            throw new BusinessException("Property is not available for the selected dates");
        }
        
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(Long.valueOf(propertyId), checkIn, checkOut);
        
        boolean hasOtherOverlaps = overlappingBookings.stream()
            .anyMatch(b -> !b.getBookingId().equals(excludeBookingId));
        
        if (hasOtherOverlaps) {
            throw new BusinessException("Property has overlapping bookings for the selected dates");
        }
    }
    
    private String generateBookingReference() {
        int year = LocalDateTime.now().getYear();
        long count = bookingRepository.count() + 1;
        return String.format("AJ-%d-%06d", year, count);
    }
    
    private BookingResponse mapToBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        
        response.setBookingId(booking.getBookingId());
        response.setBookingReference(booking.getBookingReference());
        
        Property property = booking.getProperty();
        BookingResponse.PropertyBasicInfo propertyInfo = new BookingResponse.PropertyBasicInfo();
        propertyInfo.setPropertyId(property.getPropertyId().intValue());
        propertyInfo.setTitleAr(property.getTitleAr());
        propertyInfo.setTitleEn(property.getTitleEn());
        propertyInfo.setPropertyType(property.getPropertyType().name());
        propertyInfo.setGovernorate(property.getGovernorate());
        propertyInfo.setCity(property.getCity());
        propertyInfo.setAddress(property.getStreetAddress());
        
        property.getImages().stream()
            .filter(PropertyImage::getIsCover)
            .findFirst()
            .ifPresent(img -> propertyInfo.setCoverImageUrl(img.getImageUrl()));
        
        response.setProperty(propertyInfo);
        
        User renter = booking.getRenter();
        BookingResponse.UserBasicInfo renterInfo = new BookingResponse.UserBasicInfo();
        renterInfo.setUserId(renter.getUserId().intValue());
        renterInfo.setFirstName(renter.getFirstName());
        renterInfo.setLastName(renter.getLastName());
        renterInfo.setEmail(renter.getEmail());
        renterInfo.setPhoneNumber(renter.getPhoneNumber());
        renterInfo.setProfilePhoto(renter.getProfilePhoto());
        renterInfo.setNationalIdVerified(renter.getNationalIdVerified());
        response.setRenter(renterInfo);
        
        User owner = booking.getOwner();
        BookingResponse.UserBasicInfo ownerInfo = new BookingResponse.UserBasicInfo();
        ownerInfo.setUserId(owner.getUserId().intValue());
        ownerInfo.setFirstName(owner.getFirstName());
        ownerInfo.setLastName(owner.getLastName());
        ownerInfo.setEmail(owner.getEmail());
        ownerInfo.setPhoneNumber(owner.getPhoneNumber());
        ownerInfo.setProfilePhoto(owner.getProfilePhoto());
        ownerInfo.setNationalIdVerified(owner.getNationalIdVerified());
        response.setOwner(ownerInfo);
        
        response.setCheckInDate(booking.getCheckInDate());
        response.setCheckOutDate(booking.getCheckOutDate());
        response.setNumberOfNights(booking.getNumberOfNights());
        response.setNumberOfGuests(booking.getNumberOfGuests());
        response.setNumberOfAdults(booking.getNumberOfAdults());
        response.setNumberOfChildren(booking.getNumberOfChildren());
        
        response.setPricePerNight(booking.getPricePerNight());
        response.setSubtotal(booking.getSubtotal());
        response.setCleaningFee(booking.getCleaningFee());
        response.setServiceFee(booking.getServiceFee());
        response.setDiscountAmount(booking.getDiscountAmount());
        response.setTotalPrice(booking.getTotalPrice());
        response.setSecurityDeposit(booking.getSecurityDeposit());
        response.setCurrency(booking.getCurrency());
        
        response.setStatus(booking.getStatus().name());
        response.setPaymentStatus(booking.getPaymentStatus().name());
        response.setPaymentMethod(booking.getPaymentMethod() != null ? booking.getPaymentMethod().name() : null);
        
        response.setSpecialRequests(booking.getSpecialRequests());
        response.setOwnerResponse(booking.getOwnerResponse());
        response.setRejectionReason(booking.getRejectionReason());
        response.setCancellationReason(booking.getCancellationReason());
        response.setCancellationFee(booking.getCancellationFee());
        response.setRefundAmount(booking.getRefundAmount());
        
        response.setRequestedAt(booking.getRequestedAt());
        response.setConfirmedAt(booking.getConfirmedAt());
        response.setRejectedAt(booking.getRejectedAt());
        response.setCancelledAt(booking.getCancelledAt());
        response.setCompletedAt(booking.getCompletedAt());
        response.setExpiresAt(booking.getExpiresAt());
        
        return response;
    }
    
    private BookingListResponse mapToBookingListResponse(Booking booking, boolean isRenterView) {
        BookingListResponse response = new BookingListResponse();
        
        try {
            response.setBookingId(booking.getBookingId());
            response.setBookingReference(booking.getBookingReference());
            response.setPropertyId(booking.getPropertyId());
            
            try {
                Property property = booking.getProperty();
                if (property != null && !Boolean.TRUE.equals(property.getDeleted())) {
                    response.setPropertyTitle(property.getTitleAr());
                    response.setPropertyType(property.getPropertyType().name());
                    response.setPropertyCity(property.getCity());
                    
                    if (property.getImages() != null && !property.getImages().isEmpty()) {
                        property.getImages().stream()
                            .filter(PropertyImage::getIsCover)
                            .findFirst()
                            .ifPresent(img -> response.setPropertyCoverImage(img.getImageUrl()));
                    }
                } else {
                    response.setPropertyTitle("Property No Longer Available");
                    response.setPropertyType("N/A");
                    response.setPropertyCity("N/A");
                }
            } catch (Exception e) {
                log.warn("Could not load property for booking {}: {}", booking.getBookingId(), e.getMessage());
                response.setPropertyTitle("Property Unavailable");
                response.setPropertyType("N/A");
                response.setPropertyCity("N/A");
            }
            
            User otherParty = isRenterView ? booking.getOwner() : booking.getRenter();
            response.setOtherPartyId(otherParty.getUserId().intValue());
            response.setOtherPartyName(otherParty.getFirstName() + " " + otherParty.getLastName());
            response.setOtherPartyPhone(otherParty.getPhoneNumber());
            
            response.setCheckInDate(booking.getCheckInDate());
            response.setCheckOutDate(booking.getCheckOutDate());
            response.setNumberOfNights(booking.getNumberOfNights());
            response.setNumberOfGuests(booking.getNumberOfGuests());
            
            response.setTotalPrice(booking.getTotalPrice());
            response.setCurrency(booking.getCurrency());
            
            response.setStatus(booking.getStatus().name());
            response.setPaymentStatus(booking.getPaymentStatus().name());
            
            response.setRequestedAt(booking.getRequestedAt());
            response.setExpiresAt(booking.getExpiresAt());
            
        } catch (Exception e) {
            log.error("Error mapping booking {} to list response: {}", 
                     booking != null ? booking.getBookingId() : "null", e.getMessage());
            throw new RuntimeException("Error processing booking data", e);
        }
        
        return response;
    }
}