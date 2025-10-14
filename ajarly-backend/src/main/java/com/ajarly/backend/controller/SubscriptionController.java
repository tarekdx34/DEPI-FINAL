package com.ajarly.backend.controller;

import com.ajarly.backend.dto.SubscriptionDto;
import com.ajarly.backend.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    
    /**
     * GET /api/v1/subscriptions/plans
     * Get all available subscription plans
     */
    @GetMapping("/plans")
    public ResponseEntity<?> getPlans() {
        List<SubscriptionDto.PlanResponse> plans = subscriptionService.getAllPlans();
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Subscription plans retrieved successfully",
            "message_ar", "تم جلب خطط الاشتراك بنجاح",
            "data", plans
        ));
    }
    
    /**
     * POST /api/v1/subscriptions/subscribe
     * Subscribe to a plan
     */
    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(
            @Valid @RequestBody SubscriptionDto.SubscribeRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "User authentication required. Please provide X-User-Id header."
            ));
        }
        
        SubscriptionDto.SubscriptionResponse subscription = 
            subscriptionService.subscribe(userId.longValue(), request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "message", "Subscription activated successfully",
            "message_ar", "تم تفعيل الاشتراك بنجاح",
            "data", subscription
        ));
    }
    
    /**
     * GET /api/v1/subscriptions/current
     * Get current active subscription
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentSubscription(
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "User authentication required. Please provide X-User-Id header."
            ));
        }
        
        try {
            SubscriptionDto.SubscriptionResponse subscription = 
                subscriptionService.getCurrentSubscription(userId.longValue());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", subscription
            ));
        } catch (Exception e) {
            // User has no active subscription
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "No active subscription found",
                "message_ar", "لا يوجد اشتراك نشط",
                "data", null
            ));
        }
    }
    
    /**
     * PUT /api/v1/subscriptions/cancel
     * Cancel current subscription
     */
    @PutMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(
            @Valid @RequestBody SubscriptionDto.CancelRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "User authentication required. Please provide X-User-Id header."
            ));
        }
        
        subscriptionService.cancelSubscription(userId.longValue(), request);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Subscription cancelled successfully. You can continue using premium features until the end of your billing period.",
            "message_ar", "تم إلغاء الاشتراك بنجاح. يمكنك الاستمرار في استخدام المميزات حتى نهاية فترة الفوترة."
        ));
    }
    
    /**
     * GET /api/v1/subscriptions/limits
     * Check subscription limits (for property creation validation)
     */
    @GetMapping("/limits")
    public ResponseEntity<?> checkLimits(
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "User authentication required. Please provide X-User-Id header."
            ));
        }
        
        SubscriptionDto.SubscriptionLimitsResponse limits = 
            subscriptionService.checkSubscriptionLimits(userId.longValue());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", limits
        ));
    }
}