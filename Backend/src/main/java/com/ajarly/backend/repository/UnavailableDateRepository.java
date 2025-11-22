package com.ajarly.backend.repository;

import com.ajarly.backend.model.UnavailableDate;
import com.ajarly.backend.model.UnavailableDate.UnavailableReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UnavailableDateRepository extends JpaRepository<UnavailableDate, Integer> {
    
    // Find all unavailable dates for a property (UPDATED to use Long)
    List<UnavailableDate> findByPropertyPropertyId(Long propertyId);
    
    // Find unavailable dates for a property within a date range (UPDATED to use Long)
    @Query("SELECT ud FROM UnavailableDate ud WHERE ud.property.propertyId = :propertyId " +
           "AND ((ud.unavailableFrom <= :endDate AND ud.unavailableTo >= :startDate))")
    List<UnavailableDate> findByPropertyAndDateRange(
        @Param("propertyId") Long propertyId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
    
    // Check if property is available for specific dates (UPDATED to use Long)
    @Query("SELECT COUNT(ud) > 0 FROM UnavailableDate ud " +
           "WHERE ud.property.propertyId = :propertyId " +
           "AND ((ud.unavailableFrom <= :checkIn AND ud.unavailableTo > :checkIn) " +
           "OR (ud.unavailableFrom < :checkOut AND ud.unavailableTo >= :checkOut) " +
           "OR (ud.unavailableFrom >= :checkIn AND ud.unavailableTo <= :checkOut))")
    Boolean hasUnavailableDates(
        @Param("propertyId") Long propertyId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut);
    
    // Find by booking
    Optional<UnavailableDate> findByBookingBookingId(Integer bookingId);
    
    // Delete by booking (for cancellations)
    void deleteByBookingBookingId(Integer bookingId);
    
    // Find upcoming unavailable dates for a property (UPDATED to use Long)
    @Query("SELECT ud FROM UnavailableDate ud WHERE ud.property.propertyId = :propertyId " +
           "AND ud.unavailableTo >= :today ORDER BY ud.unavailableFrom ASC")
    List<UnavailableDate> findUpcomingUnavailableDates(
        @Param("propertyId") Long propertyId,
        @Param("today") LocalDate today);
    
    // Find by property and reason (UPDATED to use Long)
    List<UnavailableDate> findByPropertyPropertyIdAndReason(
        Long propertyId, UnavailableReason reason);
}