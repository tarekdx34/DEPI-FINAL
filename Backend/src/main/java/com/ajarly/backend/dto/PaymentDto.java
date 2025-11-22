package com.ajarly.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {
    
    // ========== CREATE PAYMENT INTENT ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePaymentIntentRequest {
        @NotNull(message = "Booking ID is required")
        private Integer bookingId;
        
        @NotNull(message = "Payment method is required")
        private String paymentMethod; // fawry, credit_card, vodafone_cash
        
        private String customerEmail;
        private String customerPhone;
        private String customerName;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentIntentResponse {
        private String transactionReference;
        private String fawryReferenceNumber; // For Fawry payment code
        private BigDecimal amount;
        private String currency;
        private String status;
        private String paymentMethod;
        private String paymentUrl; // URL to redirect user for payment
        private String qrCode; // QR code for mobile wallets
        private LocalDateTime expiresAt;
        private String message;
    }
    
    // ========== CONFIRM PAYMENT ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfirmPaymentRequest {
        @NotBlank(message = "Transaction reference is required")
        private String transactionReference;
        
        // For simulated payments (testing only)
        private Boolean simulateSuccess;
        
        // Fawry webhook data
        private String fawryRefNumber;
        private String merchantRefNumber;
        private String paymentStatus;
        private String paymentMethod;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentConfirmResponse {
        private Integer transactionId;
        private String transactionReference;
        private String status;
        private BigDecimal amount;
        private String paymentMethod;
        private LocalDateTime completedAt;
        private String message;
        private BookingUpdateInfo bookingInfo;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingUpdateInfo {
        private Integer bookingId;
        private String bookingStatus;
        private String paymentStatus;
    }
    
    // ========== REFUND ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefundRequest {
        @NotNull(message = "Booking ID is required")
        private Integer bookingId;
        
        @NotNull(message = "Refund amount is required")
        @DecimalMin(value = "0.01", message = "Refund amount must be greater than 0")
        private BigDecimal refundAmount;
        
        @NotBlank(message = "Refund reason is required")
        private String reason;
        
        private Boolean adminApproved; // Admin can override auto-approval
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefundResponse {
        private Integer transactionId;
        private String transactionReference;
        private BigDecimal refundAmount;
        private String status;
        private String reason;
        private LocalDateTime processedAt;
        private String message;
    }
    
    // ========== PAYMENT HISTORY ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentHistoryResponse {
        private Integer transactionId;
        private String transactionReference;
        private String transactionType;
        private BigDecimal amount;
        private String currency;
        private String paymentMethod;
        private String status;
        private String bookingReference;
        private String propertyTitle;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
    }
    
    // ========== FAWRY WEBHOOK ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FawryWebhookPayload {
        private String requestId;
        private String fawryRefNumber;
        private String merchantRefNumber;
        private String customerMobile;
        private String customerMail;
        private String paymentAmount;
        private String orderAmount;
        private String fawryFees;
        private String paymentMethod;
        private String paymentStatus; // PAID, UNPAID, REFUNDED
        private String paymentTime;
        private String orderStatus;
        private String messageSignature;
    }
    
    // ========== MESSAGE RESPONSE ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
        private Object data;
    }
}