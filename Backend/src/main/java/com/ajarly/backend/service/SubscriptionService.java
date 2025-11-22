package com.ajarly.backend.service;

import com.ajarly.backend.dto.SubscriptionDto;
import com.ajarly.backend.exception.GlobalExceptionHandler;
import com.ajarly.backend.exception.ResourceNotFoundException;
import com.ajarly.backend.model.*;
import com.ajarly.backend.repository.SubscriptionPlanRepository;
import com.ajarly.backend.repository.TransactionRepository;
import com.ajarly.backend.repository.UserRepository;
import com.ajarly.backend.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {
    
    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    
    /**
     * Get all active subscription plans
     */
    public List<SubscriptionDto.PlanResponse> getAllPlans() {
        log.info("Fetching all active subscription plans");
        
        return planRepository.findByIsActiveTrueOrderByPlanOrderAsc()
            .stream()
            .map(SubscriptionDto.PlanResponse::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Subscribe user to a plan
     */
    @Transactional
    public SubscriptionDto.SubscriptionResponse subscribe(
            Long userId, 
            SubscriptionDto.SubscribeRequest request) {
        
        log.info("Processing subscription for user {} to plan {}", userId, request.getPlanId());
        
        // 1. Validate user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // 2. Check if user already has active subscription
        Optional<UserSubscription> existingSubscription = 
            subscriptionRepository.findActiveSubscriptionByUserId(userId, LocalDate.now());
        
        if (existingSubscription.isPresent()) {
            throw new IllegalArgumentException(
                "You already have an active subscription. Please cancel it first before subscribing to a new plan."
            );
        }
        
        // 3. Validate plan
        SubscriptionPlan plan = planRepository.findByPlanIdAndIsActiveTrue(request.getPlanId())
            .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
        
        // 4. Calculate price based on billing period
        BigDecimal price = calculatePrice(plan, request.getBillingPeriod());
        
        // 5. Calculate dates
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = calculateEndDate(startDate, request.getBillingPeriod());
        
        // 6. Create payment transaction (fake for now)
        Transaction transaction = createPaymentTransaction(user, price, request.getPaymentMethod());
        
        // 7. Create subscription
        UserSubscription subscription = new UserSubscription();
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setBillingPeriod(parseBillingPeriod(request.getBillingPeriod()));
        subscription.setStartDate(startDate);
        subscription.setEndDate(endDate);
        subscription.setStatus(UserSubscription.SubscriptionStatus.active);
        subscription.setAmountPaid(price);
        subscription.setCurrency("EGP");
        subscription.setPaymentMethod(request.getPaymentMethod());
        subscription.setTransactionId(transaction.getTransactionReference());
        subscription.setAutoRenew(true);
        
        subscription = subscriptionRepository.save(subscription);
        
        log.info("Subscription created successfully for user {}: {}", userId, subscription.getSubscriptionId());
        
        return SubscriptionDto.SubscriptionResponse.fromEntity(subscription);
    }
    
    /**
     * Get current active subscription for user
     */
    public SubscriptionDto.SubscriptionResponse getCurrentSubscription(Long userId) {
        log.info("Fetching current subscription for user {}", userId);
        
        UserSubscription subscription = subscriptionRepository
            .findActiveSubscriptionByUserId(userId, LocalDate.now())
            .orElseThrow(() -> new ResourceNotFoundException(
                "No active subscription found. Subscribe to a plan to unlock premium features!"
            ));
        
        return SubscriptionDto.SubscriptionResponse.fromEntity(subscription);
    }
    
    /**
     * Cancel user's subscription
     */
    @Transactional
    public void cancelSubscription(Long userId, SubscriptionDto.CancelRequest request) {
        log.info("Cancelling subscription for user {}", userId);
        
        UserSubscription subscription = subscriptionRepository
            .findActiveSubscriptionByUserId(userId, LocalDate.now())
            .orElseThrow(() -> new ResourceNotFoundException("No active subscription found to cancel"));
        
        subscription.setStatus(UserSubscription.SubscriptionStatus.cancelled);
        subscription.setCancelledAt(LocalDateTime.now());
        subscription.setCancellationReason(request.getReason());
        subscription.setAutoRenew(false);
        
        subscriptionRepository.save(subscription);
        
        log.info("Subscription cancelled successfully for user {}", userId);
    }
    
    /**
     * Check subscription limits for property creation
     */
    public SubscriptionDto.SubscriptionLimitsResponse checkSubscriptionLimits(Long userId) {
        log.info("Checking subscription limits for user {}", userId);
        
        SubscriptionDto.SubscriptionLimitsResponse response = new SubscriptionDto.SubscriptionLimitsResponse();
        
        Optional<UserSubscription> subscriptionOpt = 
            subscriptionRepository.findActiveSubscriptionByUserId(userId, LocalDate.now());
        
        if (subscriptionOpt.isEmpty()) {
            // User has no subscription - default to free tier
            response.setHasActiveSubscription(false);
            response.setPlanName("Free");
            response.setMaxListings(3);
            response.setListingsUsed(0); // This should be fetched from properties count
            response.setListingsRemaining(3);
            response.setCanCreateMore(true);
            response.setFeaturedListingsPerMonth(0);
            response.setFeaturedListingsUsed(0);
            response.setFeaturedListingsRemaining(0);
            response.setPrioritySupport(false);
            response.setVerificationBadge(false);
            response.setAnalyticsAccess(false);
        } else {
            UserSubscription subscription = subscriptionOpt.get();
            SubscriptionPlan plan = subscription.getPlan();
            
            response.setHasActiveSubscription(true);
            response.setPlanName(plan.getNameEn());
            response.setMaxListings(plan.getMaxListings()); // null = unlimited
            response.setListingsUsed(subscription.getListingsUsed());
            
            if (plan.getMaxListings() == null) {
                response.setListingsRemaining(null); // Unlimited
                response.setCanCreateMore(true);
            } else {
                int remaining = plan.getMaxListings() - subscription.getListingsUsed();
                response.setListingsRemaining(remaining);
                response.setCanCreateMore(remaining > 0);
            }
            
            response.setFeaturedListingsPerMonth(plan.getFeaturedListingsPerMonth());
            response.setFeaturedListingsUsed(subscription.getFeaturedListingsUsed());
            int featuredRemaining = plan.getFeaturedListingsPerMonth() - subscription.getFeaturedListingsUsed();
            response.setFeaturedListingsRemaining(Math.max(0, featuredRemaining));
            
            response.setPrioritySupport(plan.getPrioritySupport());
            response.setVerificationBadge(plan.getVerificationBadge());
            response.setAnalyticsAccess(plan.getAnalyticsAccess());
        }
        
        return response;
    }
    
    /**
     * Increment listings used count (call this when user creates a property)
     */
    @Transactional
    public void incrementListingsUsed(Long userId) {
        subscriptionRepository.findActiveSubscriptionByUserId(userId, LocalDate.now())
            .ifPresent(subscription -> {
                subscription.setListingsUsed(subscription.getListingsUsed() + 1);
                subscriptionRepository.save(subscription);
            });
    }
    
    /**
     * Scheduled task to auto-expire subscriptions
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void autoExpireSubscriptions() {
        log.info("Running scheduled task: Auto-expire subscriptions");
        
        List<UserSubscription> expiredSubscriptions = 
            subscriptionRepository.findExpiredSubscriptions(LocalDate.now());
        
        for (UserSubscription subscription : expiredSubscriptions) {
            subscription.setStatus(UserSubscription.SubscriptionStatus.expired);
            subscriptionRepository.save(subscription);
            log.info("Expired subscription {} for user {}", 
                subscription.getSubscriptionId(), 
                subscription.getUser().getUserId());
        }
        
        log.info("Auto-expired {} subscriptions", expiredSubscriptions.size());
    }
    
    // ========== HELPER METHODS ==========
    
    private BigDecimal calculatePrice(SubscriptionPlan plan, String billingPeriod) {
        return switch (billingPeriod.toLowerCase()) {
            case "monthly" -> plan.getPriceMonthly();
            case "quarterly" -> plan.getPriceQuarterly() != null ? 
                plan.getPriceQuarterly() : plan.getPriceMonthly().multiply(new BigDecimal("3"));
            case "yearly" -> plan.getPriceYearly() != null ? 
                plan.getPriceYearly() : plan.getPriceMonthly().multiply(new BigDecimal("12"));
            default -> throw new IllegalArgumentException("Invalid billing period");
        };
    }
    
    private LocalDate calculateEndDate(LocalDate startDate, String billingPeriod) {
        return switch (billingPeriod.toLowerCase()) {
            case "monthly" -> startDate.plusMonths(1);
            case "quarterly" -> startDate.plusMonths(3);
            case "yearly" -> startDate.plusYears(1);
            default -> throw new IllegalArgumentException("Invalid billing period");
        };
    }
    
    private UserSubscription.BillingPeriod parseBillingPeriod(String period) {
        return switch (period.toLowerCase()) {
            case "monthly" -> UserSubscription.BillingPeriod.monthly;
            case "quarterly" -> UserSubscription.BillingPeriod.quarterly;
            case "yearly" -> UserSubscription.BillingPeriod.yearly;
            default -> throw new IllegalArgumentException("Invalid billing period");
        };
    }
    
    private Transaction createPaymentTransaction(User user, BigDecimal amount, String paymentMethod) {
        Transaction transaction = new Transaction();
        transaction.setTransactionReference("SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transaction.setUser(user);
        transaction.setTransactionType(Transaction.TransactionType.subscription_payment);
        transaction.setAmount(amount);
        transaction.setCurrency("EGP");
        transaction.setPaymentMethod(parsePaymentMethod(paymentMethod));
        transaction.setStatus(Transaction.TransactionStatus.completed); // Fake payment
        transaction.setCompletedAt(LocalDateTime.now());
        transaction.setPlatformFeeAmount(BigDecimal.ZERO);
        
        return transactionRepository.save(transaction);
    }
    
    private Transaction.PaymentMethod parsePaymentMethod(String method) {
        return switch (method.toLowerCase()) {
            case "cash" -> Transaction.PaymentMethod.cash;
            case "credit_card" -> Transaction.PaymentMethod.credit_card;
            case "fawry" -> Transaction.PaymentMethod.fawry;
            case "vodafone_cash" -> Transaction.PaymentMethod.vodafone_cash;
            case "bank_transfer" -> Transaction.PaymentMethod.bank_transfer;
            default -> Transaction.PaymentMethod.cash;
        };
    }
}