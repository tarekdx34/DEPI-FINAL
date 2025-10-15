package com.ajarly.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;  // ← تأكد من هذا السطر

@SpringBootApplication
@EnableScheduling  // ← ADD THIS ANNOTATION
public class AjarlyBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AjarlyBackendApplication.class, args);
        System.out.println("🚀 Ajarly Backend Server Started Successfully!");
        System.out.println("📊 Analytics Scheduler Enabled - Running daily at 1:00 AM");
    }
}