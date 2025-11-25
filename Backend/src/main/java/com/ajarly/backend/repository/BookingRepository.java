package com.ajarly.backend.repository;

import com.ajarly.backend.model.Booking;
import com.ajarly.backend.model.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH b.renter r " +
           "LEFT JOIN FETCH b.owner o " +
           "WHERE b.bookingId = :bookingId " +
           "AND (p.deleted = false OR p.deleted IS NULL)")
    Optional<Booking> findByIdWithDetails(@Param("bookingId") Integer bookingId);
    // Find by booking reference
    Optional<Booking> findByBookingReference(String bookingReference);
    
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH b.renter r " +
           "LEFT JOIN FETCH b.owner o " +
           "WHERE b.bookingReference = :reference " +
           "AND (p.deleted = false OR p.deleted IS NULL)")
    Optional<Booking> findByBookingReferenceWithDetails(@Param("reference") String reference);
    // ✅ FIXED: Find by renter with JOIN FETCH including images
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH b.renter r " +
           "LEFT JOIN FETCH b.owner o " +
           "WHERE b.renter.userId = :renterId " +
           "AND (p.deleted = false OR p.deleted IS NULL) " +
           "ORDER BY b.requestedAt DESC")
    List<Booking> findByRenterUserIdOrderByRequestedAtDesc(@Param("renterId") Long renterId);
    
    // ✅ FIXED: Find by renter with status and JOIN FETCH including images
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH b.renter r " +
           "LEFT JOIN FETCH b.owner o " +
           "WHERE b.renter.userId = :renterId " +
           "AND b.status = :status " +
           "AND (p.deleted = false OR p.deleted IS NULL) " +
           "ORDER BY b.requestedAt DESC")
    List<Booking> findByRenterUserIdAndStatusOrderByRequestedAtDesc(
        @Param("renterId") Long renterId, 
        @Param("status") BookingStatus status);
    
    // ✅ FIXED: Find by owner with JOIN FETCH including images
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH b.renter r " +
           "LEFT JOIN FETCH b.owner o " +
           "WHERE b.owner.userId = :ownerId " +
           "AND (p.deleted = false OR p.deleted IS NULL) " +
           "ORDER BY b.requestedAt DESC")
    List<Booking> findByOwnerUserIdOrderByRequestedAtDesc(@Param("ownerId") Long ownerId);
    
    // ✅ FIXED: Find by owner with status and JOIN FETCH including images
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH b.renter r " +
           "LEFT JOIN FETCH b.owner o " +
           "WHERE b.owner.userId = :ownerId " +
           "AND b.status = :status " +
           "AND (p.deleted = false OR p.deleted IS NULL) " +
           "ORDER BY b.requestedAt DESC")
    List<Booking> findByOwnerUserIdAndStatusOrderByRequestedAtDesc(
        @Param("ownerId") Long ownerId, 
        @Param("status") BookingStatus status);
    
    // Find by property
    List<Booking> findByPropertyPropertyIdOrderByRequestedAtDesc(Long propertyId);
    
    // Find by property and status
    List<Booking> findByPropertyPropertyIdAndStatusOrderByRequestedAtDesc(
        Long propertyId, BookingStatus status);
    
    // Find by status
    List<Booking> findByStatusOrderByRequestedAtDesc(BookingStatus status);
    
    // Find expired bookings (for auto-expiry job)
    @Query("SELECT b FROM Booking b WHERE b.status = 'pending' AND b.expiresAt < :now")
    List<Booking> findExpiredBookings(@Param("now") LocalDateTime now);
    
    // Check if dates are available for a property (no overlapping bookings)
    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
           "LEFT JOIN b.property p " +
           "WHERE b.property.propertyId = :propertyId " +
           "AND b.status IN ('pending', 'confirmed') " +
           "AND (p.deleted = false OR p.deleted IS NULL) " +
           "AND ((b.checkInDate <= :checkIn AND b.checkOutDate > :checkIn) " +
           "OR (b.checkInDate < :checkOut AND b.checkOutDate >= :checkOut) " +
           "OR (b.checkInDate >= :checkIn AND b.checkOutDate <= :checkOut))")
    Boolean hasOverlappingBookings(
        @Param("propertyId") Long propertyId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut);
    
    // Find overlapping bookings (for confirmation check)
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "WHERE b.property.propertyId = :propertyId " +
           "AND b.status IN ('pending', 'confirmed') " +
           "AND (p.deleted = false OR p.deleted IS NULL) " +
           "AND ((b.checkInDate <= :checkIn AND b.checkOutDate > :checkIn) " +
           "OR (b.checkInDate < :checkOut AND b.checkOutDate >= :checkOut) " +
           "OR (b.checkInDate >= :checkIn AND b.checkOutDate <= :checkOut))")
    List<Booking> findOverlappingBookings(
        @Param("propertyId") Long propertyId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut);
    
    // Count bookings by status for a property
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.property.propertyId = :propertyId AND b.status = :status")
    Long countByPropertyIdAndStatus(
        @Param("propertyId") Long propertyId, 
        @Param("status") BookingStatus status);
    
    // ✅ FIXED: Find upcoming bookings for a renter with JOIN FETCH including images
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH b.renter r " +
           "LEFT JOIN FETCH b.owner o " +
           "WHERE b.renter.userId = :renterId " +
           "AND b.checkInDate >= :today " +
           "AND b.status = 'confirmed' " +
           "AND (p.deleted = false OR p.deleted IS NULL) " +
           "ORDER BY b.checkInDate ASC")
    List<Booking> findUpcomingBookingsForRenter(
        @Param("renterId") Long renterId,
        @Param("today") LocalDate today);
    
    // ✅ FIXED: Find upcoming bookings for an owner with JOIN FETCH including images
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.property p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH b.renter r " +
           "LEFT JOIN FETCH b.owner o " +
           "WHERE b.owner.userId = :ownerId " +
           "AND b.checkInDate >= :today " +
           "AND b.status = 'confirmed' " +
           "AND (p.deleted = false OR p.deleted IS NULL) " +
           "ORDER BY b.checkInDate ASC")
    List<Booking> findUpcomingBookingsForOwner(
        @Param("ownerId") Long ownerId,
        @Param("today") LocalDate today);
    
    // Find past bookings for a renter
    @Query("SELECT b FROM Booking b WHERE b.renter.userId = :renterId " +
           "AND b.checkOutDate < :today " +
           "ORDER BY b.checkOutDate DESC")
    List<Booking> findPastBookingsForRenter(
        @Param("renterId") Long renterId,
        @Param("today") LocalDate today);
    
    // Find bookings that should be marked as completed (check-out date passed)
    @Query("SELECT b FROM Booking b WHERE b.status = 'confirmed' " +
           "AND b.checkOutDate < :today")
    List<Booking> findBookingsToComplete(@Param("today") LocalDate today);
    
    // Count total bookings for a user (as renter)
    Long countByRenterUserId(Long renterId);
    
    // Count total bookings for a property owner
    Long countByOwnerUserId(Long ownerId);
}