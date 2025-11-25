package com.ajarly.backend.controller;

import com.ajarly.backend.dto.PaymentDto;
import com.ajarly.backend.service.FawryPaymentService;
import com.ajarly.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Webhook Controller for Payment Gateway Callbacks
 * 
 * This controller receives notifications from payment gateways (Fawry)
 * when payment status changes.
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {
    
    private final PaymentService paymentService;
    private final FawryPaymentService fawryPaymentService;
    
    /**
     * POST /api/v1/webhooks/fawry
     * Receive Fawry payment notifications
     * 
     * Fawry sends POST requests to this endpoint when:
     * - Payment is completed
     * - Payment fails
     * - Refund is processed
     */
    @PostMapping("/fawry")
    public ResponseEntity<PaymentDto.MessageResponse> handleFawryWebhook(
            @RequestBody PaymentDto.FawryWebhookPayload payload,
            @RequestHeader(value = "Fawry-Signature", required = false) String signature
    ) {
        try {
            log.info("🔔 Received Fawry webhook - Merchant Ref: {}, Status: {}", 
                     payload.getMerchantRefNumber(), payload.getPaymentStatus());
            
            // 1. Validate webhook signature (SIMULATED)
            if (!fawryPaymentService.validateWebhookSignature(
                    payload.toString(), signature)) {
                log.error("❌ Invalid Fawry webhook signature");
                return ResponseEntity.status(401)
                    .body(new PaymentDto.MessageResponse("Invalid signature", null));
            }
            
            // 2. Process webhook based on payment status
            switch (payload.getPaymentStatus()) {
                case "PAID":
                    handlePaymentSuccess(payload);
                    break;
                    
                case "UNPAID":
                    handlePaymentFailure(payload);
                    break;
                    
                case "REFUNDED":
                    handleRefund(payload);
                    break;
                    
                default:
                    log.warn("⚠️ Unknown payment status: {}", payload.getPaymentStatus());
            }
            
            // 3. Return 200 OK to acknowledge receipt
            return ResponseEntity.ok(
                new PaymentDto.MessageResponse("Webhook processed successfully", null)
            );
            
        } catch (Exception e) {
            log.error("❌ Error processing Fawry webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(new PaymentDto.MessageResponse("Webhook processing failed", null));
        }
    }
    
    /**
     * Handle successful payment webhook
     */
    private void handlePaymentSuccess(PaymentDto.FawryWebhookPayload payload) {
        log.info("✅ Processing successful payment webhook");
        
        try {
            // Auto-confirm payment using the merchant reference number
            PaymentDto.ConfirmPaymentRequest confirmRequest = new PaymentDto.ConfirmPaymentRequest();
            confirmRequest.setTransactionReference(payload.getMerchantRefNumber());
            confirmRequest.setFawryRefNumber(payload.getFawryRefNumber());
            confirmRequest.setPaymentStatus(payload.getPaymentStatus());
            confirmRequest.setPaymentMethod(payload.getPaymentMethod());
            
            paymentService.confirmPayment(confirmRequest);
            
            log.info("✅ Payment auto-confirmed via webhook");
            
        } catch (Exception e) {
            log.error("❌ Failed to auto-confirm payment: {}", e.getMessage());
            // Don't throw - webhook should still return 200
        }
    }
    
    /**
     * Handle failed payment webhook
     */
    private void handlePaymentFailure(PaymentDto.FawryWebhookPayload payload) {
        log.warn("⚠️ Processing failed payment webhook");
        
        // TODO: Update transaction status to failed
        // TODO: Send notification to user
        // TODO: Update booking status if needed
    }
    
    /**
     * Handle refund webhook
     */
    private void handleRefund(PaymentDto.FawryWebhookPayload payload) {
        log.info("🔄 Processing refund webhook");
        
        // TODO: Update refund transaction status
        // TODO: Send refund confirmation to user
        // TODO: Update booking refund amount
    }
    
    /**
     * GET /api/v1/webhooks/test
     * Test endpoint to simulate webhook (for testing only)
     */
    @GetMapping("/test")
    public ResponseEntity<PaymentDto.MessageResponse> testWebhook() {
        log.info("🧪 Testing webhook endpoint");
        
        return ResponseEntity.ok(
            new PaymentDto.MessageResponse("Webhook endpoint is active", null)
        );
    }
}