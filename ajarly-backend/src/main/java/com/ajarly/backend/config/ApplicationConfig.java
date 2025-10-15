package com.ajarly.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Application Configuration
 * Enables scheduling for background tasks like auto-expiring bookings
 */
@Configuration
@EnableScheduling
public class ApplicationConfig {
    // Scheduling is now enabled for the application
    // The @Scheduled annotations in BookingScheduler will work
}