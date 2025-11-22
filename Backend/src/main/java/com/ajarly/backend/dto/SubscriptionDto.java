package com.ajarly.backend.dto;

import com.ajarly.backend.model.SubscriptionPlan;
import com.ajarly.backend.model.UserSubscription;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class SubscriptionDto {
    
    // ========== REQUEST DTOs ==========
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscribeRequest {
        
        @NotNull(message = "Plan ID is required")
        private Integer planId;
        
        @NotNull(message = "Billing period is required")
        @Pattern(regexp = "monthly|quarterly|yearly", message = "Billing period must be monthly, quarterly, or yearly")
        private String billingPeriod;
        
        @NotNull(message = "Payment method is required")
        @Pattern(regexp = "cash|credit_card|fawry|vodafone_cash|bank_transfer", 
                 message = "Invalid payment method")
        private String paymentMethod;
        
        // Optional: For future payment gateway integration
        private String paymentToken;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancelRequest {
        
        @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
        private String reason;
    }
    
    // ========== RESPONSE DTOs ==========
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanResponse {
        private Integer planId;
        private String nameAr;
        private String nameEn;
        private String descriptionAr;
        private String descriptionEn;
        
        private BigDecimal priceMonthly;
        private BigDecimal priceQuarterly;
        private BigDecimal priceYearly;
        
        // Features
        private Integer maxListings;
        private Integer featuredListingsPerMonth;
        private Boolean prioritySupport;
        private Boolean verificationBadge;
        private Boolean analyticsAccess;
        private Boolean customBranding;
        private Boolean apiAccess;
        
        private Boolean isPopular;
        private Integer planOrder;
        
        // Savings calculation
        private BigDecimal quarterlySavings;
        private BigDecimal yearlySavings;
        
        public static PlanResponse fromEntity(SubscriptionPlan plan) {
            PlanResponse response = new PlanResponse();
            response.setPlanId(plan.getPlanId());
            response.setNameAr(plan.getNameAr());
            response.setNameEn(plan.getNameEn());
            response.setDescriptionAr(plan.getDescriptionAr());
            response.setDescriptionEn(plan.getDescriptionEn());
            
            response.setPriceMonthly(plan.getPriceMonthly());
            response.setPriceQuarterly(plan.getPriceQuarterly());
            response.setPriceYearly(plan.getPriceYearly());
            
            response.setMaxListings(plan.getMaxListings());
            response.setFeaturedListingsPerMonth(plan.getFeaturedListingsPerMonth());
            response.setPrioritySupport(plan.getPrioritySupport());
            response.setVerificationBadge(plan.getVerificationBadge());
            response.setAnalyticsAccess(plan.getAnalyticsAccess());
            response.setCustomBranding(plan.getCustomBranding());
            response.setApiAccess(plan.getApiAccess());
            
            response.setIsPopular(plan.getIsPopular());
            response.setPlanOrder(plan.getPlanOrder());
            
            // Calculate savings
            if (plan.getPriceQuarterly() != null && plan.getPriceMonthly() != null) {
                BigDecimal monthlyTotal = plan.getPriceMonthly().multiply(new BigDecimal("3"));
                response.setQuarterlySavings(monthlyTotal.subtract(plan.getPriceQuarterly()));
            }
            
            if (plan.getPriceYearly() != null && plan.getPriceMonthly() != null) {
                BigDecimal monthlyTotal = plan.getPriceMonthly().multiply(new BigDecimal("12"));
                response.setYearlySavings(monthlyTotal.subtract(plan.getPriceYearly()));
            }
            
            return response;
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionResponse {
        private Integer subscriptionId;
        private PlanResponse plan;
        private String billingPeriod;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private BigDecimal amountPaid;
        private String currency;
        private String paymentMethod;
        private Boolean autoRenew;
        private Integer listingsUsed;
        private Integer featuredListingsUsed;
        private LocalDateTime createdAt;
        
        // Additional info
        private Integer daysRemaining;
        private Boolean isExpiringSoon; // Less than 7 days
        
        public static SubscriptionResponse fromEntity(UserSubscription subscription) {
            SubscriptionResponse response = new SubscriptionResponse();
            response.setSubscriptionId(subscription.getSubscriptionId());
            response.setPlan(PlanResponse.fromEntity(subscription.getPlan()));
            response.setBillingPeriod(subscription.getBillingPeriod().name());
            response.setStartDate(subscription.getStartDate());
            response.setEndDate(subscription.getEndDate());
            response.setStatus(subscription.getStatus().name());
            response.setAmountPaid(subscription.getAmountPaid());
            response.setCurrency(subscription.getCurrency());
            response.setPaymentMethod(subscription.getPaymentMethod());
            response.setAutoRenew(subscription.getAutoRenew());
            response.setListingsUsed(subscription.getListingsUsed());
            response.setFeaturedListingsUsed(subscription.getFeaturedListingsUsed());
            response.setCreatedAt(subscription.getCreatedAt());
            
            // Calculate days remaining
            LocalDate now = LocalDate.now();
            if (subscription.getEndDate().isAfter(now)) {
                long days = java.time.temporal.ChronoUnit.DAYS.between(now, subscription.getEndDate());
                response.setDaysRemaining((int) days);
                response.setIsExpiringSoon(days <= 7);
            } else {
                response.setDaysRemaining(0);
                response.setIsExpiringSoon(false);
            }
            
            return response;
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionLimitsResponse {
        private Boolean hasActiveSubscription;
        private String planName;
        private Integer maxListings;
        private Integer listingsUsed;
        private Integer listingsRemaining;
        private Boolean canCreateMore;
        
        private Integer featuredListingsPerMonth;
        private Integer featuredListingsUsed;
        private Integer featuredListingsRemaining;
        
        private Boolean prioritySupport;
        private Boolean verificationBadge;
        private Boolean analyticsAccess;
    }
}