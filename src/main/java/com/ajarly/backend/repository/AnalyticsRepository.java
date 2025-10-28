package com.ajarly.backend.repository;

import com.ajarly.backend.model.PropertyPerformanceAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalyticsRepository extends JpaRepository<PropertyPerformanceAnalytics, Long> {
    
    // Find analytics for a property within date range
    @Query("SELECT a FROM PropertyPerformanceAnalytics a " +
           "WHERE a.property.propertyId = :propertyId " +
           "AND a.analyticsDate BETWEEN :startDate AND :endDate " +
           "ORDER BY a.analyticsDate ASC")
    List<PropertyPerformanceAnalytics> findByPropertyAndDateRange(
        @Param("propertyId") Long propertyId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
    
    // Find analytics for specific property and date
    Optional<PropertyPerformanceAnalytics> findByPropertyPropertyIdAndAnalyticsDate(
        Long propertyId, LocalDate analyticsDate);
    
    // Get analytics for all owner's properties
    @Query("SELECT a FROM PropertyPerformanceAnalytics a " +
           "WHERE a.property.owner.userId = :ownerId " +
           "AND a.analyticsDate BETWEEN :startDate AND :endDate " +
           "ORDER BY a.analyticsDate ASC")
    List<PropertyPerformanceAnalytics> findByOwnerAndDateRange(
        @Param("ownerId") Long ownerId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
    
    // Platform-wide analytics
    @Query("SELECT a FROM PropertyPerformanceAnalytics a " +
           "WHERE a.analyticsDate BETWEEN :startDate AND :endDate " +
           "ORDER BY a.analyticsDate ASC")
    List<PropertyPerformanceAnalytics> findPlatformAnalytics(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
    
    // Sum metrics for a property
    @Query("SELECT " +
           "SUM(a.totalViews), " +
           "SUM(a.bookingRequests), " +
           "SUM(a.bookingConfirmations), " +
           "SUM(a.revenue) " +
           "FROM PropertyPerformanceAnalytics a " +
           "WHERE a.property.propertyId = :propertyId " +
           "AND a.analyticsDate BETWEEN :startDate AND :endDate")
    Object[] sumPropertyMetrics(
        @Param("propertyId") Long propertyId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
}