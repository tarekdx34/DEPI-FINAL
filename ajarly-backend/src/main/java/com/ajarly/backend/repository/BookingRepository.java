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
    
    // Find by booking reference
    Optional<Booking> findByBookingReference(String bookingReference);
    
    // Find by renter
    List<Booking> findByRenterUserIdOrderByRequestedAtDesc(Long renterId);
    
    // Find by renter with status
    List<Booking> findByRenterUserIdAndStatusOrderByRequestedAtDesc(
        Long renterId, BookingStatus status);
    
    // Find by owner (owner is directly on booking)
    List<Booking> findByOwnerUserIdOrderByRequestedAtDesc(Long ownerId);
    
    // Find by owner with status
    List<Booking> findByOwnerUserIdAndStatusOrderByRequestedAtDesc(
        Long ownerId, BookingStatus status);
    
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
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.property.propertyId = :propertyId " +
           "AND b.status IN ('pending', 'confirmed') " +
           "AND ((b.checkInDate <= :checkIn AND b.checkOutDate > :checkIn) " +
           "OR (b.checkInDate < :checkOut AND b.checkOutDate >= :checkOut) " +
           "OR (b.checkInDate >= :checkIn AND b.checkOutDate <= :checkOut))")
    Boolean hasOverlappingBookings(
        @Param("propertyId") Long propertyId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut);
    
    // Find overlapping bookings (for confirmation check)
    @Query("SELECT b FROM Booking b WHERE b.property.propertyId = :propertyId " +
           "AND b.status IN ('pending', 'confirmed') " +
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
    
    // Find upcoming bookings for a renter
    @Query("SELECT b FROM Booking b WHERE b.renter.userId = :renterId " +
           "AND b.checkInDate >= :today AND b.status = 'confirmed' " +
           "ORDER BY b.checkInDate ASC")
    List<Booking> findUpcomingBookingsForRenter(
        @Param("renterId") Long renterId,
        @Param("today") LocalDate today);
    
    // Find upcoming bookings for an owner
    @Query("SELECT b FROM Booking b WHERE b.owner.userId = :ownerId " +
           "AND b.checkInDate >= :today AND b.status = 'confirmed' " +
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