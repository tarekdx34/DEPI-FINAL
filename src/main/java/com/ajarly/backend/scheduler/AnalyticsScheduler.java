package com.ajarly.backend.scheduler;

import com.ajarly.backend.model.*;
import com.ajarly.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Analytics Scheduler
 * يقوم بحساب التحليلات اليومية للعقارات
 * يعمل كل يوم في الساعة 1 صباحاً
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AnalyticsScheduler {
    
    private final AnalyticsRepository analyticsRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    
    /**
     * حساب التحليلات اليومية لجميع العقارات
     * يعمل كل يوم في الساعة 1 صباحاً بتوقيت القاهرة
     */
    @Scheduled(cron = "0 0 1 * * *", zone = "Africa/Cairo")
    @Transactional
    public void calculateDailyAnalytics() {
        log.info("=== Starting Daily Analytics Calculation ===");
        LocalDate yesterday = LocalDate.now().minusDays(1);
        
        try {
            // Get all active and inactive properties (not deleted)
            List<Property> properties = propertyRepository.findAll().stream()
                .filter(p -> p.getStatus() != Property.PropertyStatus.deleted)
                .toList();
            
            log.info("Processing analytics for {} properties", properties.size());
            
            int successCount = 0;
            int errorCount = 0;
            
            for (Property property : properties) {
                try {
                    calculatePropertyAnalytics(property, yesterday);
                    successCount++;
                } catch (Exception e) {
                    log.error("Error calculating analytics for property {}: {}", 
                             property.getPropertyId(), e.getMessage());
                    errorCount++;
                }
            }
            
            log.info("=== Daily Analytics Calculation Completed ===");
            log.info("Success: {}, Errors: {}", successCount, errorCount);
            
        } catch (Exception e) {
            log.error("Fatal error in daily analytics calculation: {}", e.getMessage(), e);
        }
    }
    
    /**
     * حساب التحليلات لعقار واحد في يوم معين
     */
    private void calculatePropertyAnalytics(Property property, LocalDate date) {
        log.debug("Calculating analytics for property {} on {}", property.getPropertyId(), date);
        
        // Check if analytics already exist for this date
        Optional<PropertyPerformanceAnalytics> existingAnalytics = 
            analyticsRepository.findByPropertyPropertyIdAndAnalyticsDate(
                property.getPropertyId(), date);
        
        if (existingAnalytics.isPresent()) {
            log.debug("Analytics already exist for property {} on {}, skipping", 
                     property.getPropertyId(), date);
            return;
        }
        
        // Calculate metrics
        Integer totalViews = calculateDailyViews(property, date);
        Integer uniqueViews = calculateUniqueViews(property, date);
        Integer bookingRequests = calculateBookingRequests(property, date);
        Integer bookingConfirmations = calculateBookingConfirmations(property, date);
        Integer bookingCancellations = calculateBookingCancellations(property, date);
        Integer bookingRejections = calculateBookingRejections(property, date);
        BigDecimal revenue = calculateRevenue(property, date);
        BigDecimal potentialRevenue = calculatePotentialRevenue(property, date);
        Integer newReviews = calculateNewReviews(property, date);
        BigDecimal averageRating = calculateAverageRating(property, date);
        Integer contactClicks = 0; // Will be tracked when contact feature is implemented
        Integer imageViews = 0; // Will be tracked when image tracking is implemented
        
        // Create analytics record
        PropertyPerformanceAnalytics analytics = PropertyPerformanceAnalytics.builder()
            .property(property)
            .analyticsDate(date)
            .totalViews(totalViews)
            .uniqueViews(uniqueViews)
            .bookingRequests(bookingRequests)
            .bookingConfirmations(bookingConfirmations)
            .bookingCancellations(bookingCancellations)
            .bookingRejections(bookingRejections)
            .revenue(revenue)
            .potentialRevenue(potentialRevenue)
            .newReviews(newReviews)
            .averageRating(averageRating)
            .contactClicks(contactClicks)
            .imageViews(imageViews)
            .build();
        
        analyticsRepository.save(analytics);
        
        log.debug("Analytics saved for property {} on {}: Views={}, Bookings={}, Revenue={}", 
                 property.getPropertyId(), date, totalViews, bookingConfirmations, revenue);
    }
    
    // ============ Calculation Helper Methods ============
    
    /**
     * حساب المشاهدات اليومية
     * Note: في حالة عدم وجود tracking system، نستخدم viewCount الإجمالي
     */
    private Integer calculateDailyViews(Property property, LocalDate date) {
        // TODO: Implement proper view tracking with timestamps
        // For now, return 0 or implement a simple increment logic
        return 0;
    }
    
    /**
     * حساب المشاهدات الفريدة
     * Note: يتطلب tracking system متقدم لتتبع IP addresses أو User IDs
     */
    private Integer calculateUniqueViews(Property property, LocalDate date) {
        // TODO: Implement unique view tracking
        return 0;
    }
    
    /**
     * حساب طلبات الحجز التي تمت في هذا اليوم
     */
    private Integer calculateBookingRequests(Property property, LocalDate date) {
        List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(
            property.getPropertyId());
        
        return (int) bookings.stream()
            .filter(b -> b.getRequestedAt().toLocalDate().equals(date))
            .count();
    }
    
    /**
     * حساب الحجوزات المؤكدة في هذا اليوم
     */
    private Integer calculateBookingConfirmations(Property property, LocalDate date) {
        List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(
            property.getPropertyId());
        
        return (int) bookings.stream()
            .filter(b -> b.getConfirmedAt() != null && 
                        b.getConfirmedAt().toLocalDate().equals(date))
            .count();
    }
    
    /**
     * حساب الحجوزات الملغاة في هذا اليوم
     */
    private Integer calculateBookingCancellations(Property property, LocalDate date) {
        List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(
            property.getPropertyId());
        
        return (int) bookings.stream()
            .filter(b -> b.getCancelledAt() != null && 
                        b.getCancelledAt().toLocalDate().equals(date))
            .count();
    }
    
    /**
     * حساب الحجوزات المرفوضة في هذا اليوم
     */
    private Integer calculateBookingRejections(Property property, LocalDate date) {
        List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(
            property.getPropertyId());
        
        return (int) bookings.stream()
            .filter(b -> b.getRejectedAt() != null && 
                        b.getRejectedAt().toLocalDate().equals(date))
            .count();
    }
    
    /**
     * حساب الإيرادات المحققة في هذا اليوم
     * (من الحجوزات التي تم تأكيدها في هذا اليوم)
     */
    private BigDecimal calculateRevenue(Property property, LocalDate date) {
        List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(
            property.getPropertyId());
        
        return bookings.stream()
            .filter(b -> b.getConfirmedAt() != null && 
                        b.getConfirmedAt().toLocalDate().equals(date))
            .map(Booking::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * حساب الإيرادات المحتملة
     * (من جميع طلبات الحجز بغض النظر عن حالتها)
     */
    private BigDecimal calculatePotentialRevenue(Property property, LocalDate date) {
        List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(
            property.getPropertyId());
        
        return bookings.stream()
            .filter(b -> b.getRequestedAt().toLocalDate().equals(date))
            .map(Booking::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * حساب المراجعات الجديدة في هذا اليوم
     */
    private Integer calculateNewReviews(Property property, LocalDate date) {
        var reviews = reviewRepository.findByPropertyIdAndApproved(
            property.getPropertyId(), null).getContent();
        
        return (int) reviews.stream()
            .filter(r -> r.getCreatedAt().toLocalDate().equals(date))
            .count();
    }
    
    /**
     * حساب متوسط التقييم حتى هذا اليوم
     */
    private BigDecimal calculateAverageRating(Property property, LocalDate date) {
        Optional<Double> avgRating = reviewRepository.getAverageRatingByPropertyId(
            property.getPropertyId());
        
        return avgRating.map(BigDecimal::valueOf).orElse(BigDecimal.ZERO);
    }
    
    /**
     * Manual trigger for testing (can be removed in production)
     * يمكن استدعاء هذا الـ method يدوياً لأغراض الاختبار
     */
    public void triggerManualCalculation() {
        log.info("=== Manual Analytics Calculation Triggered ===");
        calculateDailyAnalytics();
    }
    
    /**
     * Calculate analytics for a specific property and date (for backfilling)
     * حساب التحليلات لعقار معين في تاريخ محدد (لملء البيانات التاريخية)
     */
    public void calculateAnalyticsForPropertyAndDate(Long propertyId, LocalDate date) {
        log.info("Calculating analytics for property {} on {}", propertyId, date);
        
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        calculatePropertyAnalytics(property, date);
    }
}