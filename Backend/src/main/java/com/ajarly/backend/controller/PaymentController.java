package com.ajarly.backend.controller;

import com.ajarly.backend.dto.PaymentDto;
import com.ajarly.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    
    /**
     * Get authenticated user ID from security context
     */
    private Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        throw new RuntimeException("User not authenticated");
    }
    
    /**
     * POST /api/v1/payments/create
     * Create payment intent for a booking
     */
    @PostMapping("/create")
    public ResponseEntity<PaymentDto.PaymentIntentResponse> createPaymentIntent(
            @Valid @RequestBody PaymentDto.CreatePaymentIntentRequest request
    ) {
        try {
            Long userId = getAuthenticatedUserId();
            log.info("Creating payment intent - User: {}, Booking: {}", userId, request.getBookingId());
            
            PaymentDto.PaymentIntentResponse response = paymentService.createPaymentIntent(userId, request);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error creating payment intent: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * POST /api/v1/payments/confirm
     * Confirm payment after user completes it
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentDto.PaymentConfirmResponse> confirmPayment(
            @Valid @RequestBody PaymentDto.ConfirmPaymentRequest request
    ) {
        try {
            log.info("Confirming payment - Transaction: {}", request.getTransactionReference());
            
            PaymentDto.PaymentConfirmResponse response = paymentService.confirmPayment(request);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error confirming payment: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * POST /api/v1/payments/refund
     * Process refund for a booking
     */
    @PostMapping("/refund")
    public ResponseEntity<PaymentDto.RefundResponse> processRefund(
            @Valid @RequestBody PaymentDto.RefundRequest request
    ) {
        try {
            Long userId = getAuthenticatedUserId();
            log.info("Processing refund - User: {}, Booking: {}", userId, request.getBookingId());
            
            PaymentDto.RefundResponse response = paymentService.processRefund(userId, request);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error processing refund: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * GET /api/v1/payments/history
     * Get payment history for authenticated user
     */
    @GetMapping("/history")
    public ResponseEntity<List<PaymentDto.PaymentHistoryResponse>> getPaymentHistory() {
        try {
            Long userId = getAuthenticatedUserId();
            log.info("Fetching payment history for user: {}", userId);
            
            List<PaymentDto.PaymentHistoryResponse> history = paymentService.getPaymentHistory(userId);
            return ResponseEntity.ok(history);
            
        } catch (RuntimeException e) {
            log.error("Error fetching payment history: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * GET /api/v1/payments/transaction/{reference}
     * Get transaction details by reference
     */
    @GetMapping("/transaction/{reference}")
    public ResponseEntity<PaymentDto.MessageResponse> getTransactionDetails(
            @PathVariable String reference
    ) {
        try {
            log.info("Fetching transaction details: {}", reference);
            
            // TODO: Implement getTransactionByReference method in service
            return ResponseEntity.ok(new PaymentDto.MessageResponse(
                "Transaction details endpoint - to be implemented",
                null
            ));
            
        } catch (RuntimeException e) {
            log.error("Error fetching transaction: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Global exception handler for payment errors
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<PaymentDto.MessageResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Payment error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new PaymentDto.MessageResponse(ex.getMessage(), null));
    }
}