package com.ajarly.backend.scheduler;

import com.ajarly.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for booking management
 * - Auto-expire pending bookings after 48 hours
 * - Auto-complete bookings after check-out date
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingScheduler {
    
    private final BookingService bookingService;
    
    /**
     * Auto-expire pending bookings that haven't been confirmed
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    public void autoExpireBookings() {
        log.info("Running scheduled task: Auto-expire pending bookings");
        try {
            bookingService.autoExpireBookings();
            log.info("Auto-expire task completed successfully");
        } catch (Exception e) {
            log.error("Error during auto-expire task", e);
        }
    }
    
    /**
     * Auto-complete bookings where check-out date has passed
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *") // Every day at 2:00 AM
    public void autoCompleteBookings() {
        log.info("Running scheduled task: Auto-complete bookings");
        try {
            bookingService.autoCompleteBookings();
            log.info("Auto-complete task completed successfully");
        } catch (Exception e) {
            log.error("Error during auto-complete task", e);
        }
    }
}