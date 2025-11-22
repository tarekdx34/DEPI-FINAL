package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Integer planId;
    
    @Column(name = "name_ar", nullable = false, length = 100)
    private String nameAr;
    
    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;
    
    @Column(name = "description_ar", columnDefinition = "TEXT")
    private String descriptionAr;
    
    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;
    
    @Column(name = "price_monthly", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceMonthly;
    
    @Column(name = "price_quarterly", precision = 10, scale = 2)
    private BigDecimal priceQuarterly;
    
    @Column(name = "price_yearly", precision = 10, scale = 2)
    private BigDecimal priceYearly;
    
    // Features
    @Column(name = "max_listings")
    private Integer maxListings; // NULL = unlimited
    
    @Column(name = "featured_listings_per_month")
    private Integer featuredListingsPerMonth = 0;
    
    @Column(name = "priority_support")
    private Boolean prioritySupport = false;
    
    @Column(name = "verification_badge")
    private Boolean verificationBadge = false;
    
    @Column(name = "analytics_access")
    private Boolean analyticsAccess = false;
    
    @Column(name = "custom_branding")
    private Boolean customBranding = false;
    
    @Column(name = "api_access")
    private Boolean apiAccess = false;
    
    @Column(name = "plan_order")
    private Integer planOrder = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_popular")
    private Boolean isPopular = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}