package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Data
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private Long propertyId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @Column(name = "title_ar", nullable = false)
    private String titleAr;
    
    @Column(name = "title_en")
    private String titleEn;
    
    @Column(name = "description_ar", columnDefinition = "TEXT", nullable = false)
    private String descriptionAr;
    
    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;
    
    @Column(unique = true)
    private String slug;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    private PropertyType propertyType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "rental_type", nullable = false)
    private RentalType rentalType;
    
    @Column(nullable = false)
    private String governorate;
    
    @Column(nullable = false)
    private String city;
    
    private String neighborhood;
    
    @Column(name = "street_address", columnDefinition = "TEXT")
    private String streetAddress;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    @Column(nullable = false)
    private Integer bedrooms;
    
    @Column(nullable = false)
    private Integer bathrooms;
    
    @Column(name = "guests_capacity", nullable = false)
    private Integer guestsCapacity;
    
    @Column(name = "area_sqm")
    private Integer areaSqm;
    
    @Column(name = "floor_number")
    private Integer floorNumber;
    
    @Column(name = "total_floors")
    private Integer totalFloors;
    
    private Boolean furnished = false;
    
    @Column(name = "pets_allowed")
    private Boolean petsAllowed = false;
    
    @Column(name = "smoking_allowed")
    private Boolean smokingAllowed = false;
    
    @Column(name = "price_per_night", precision = 10, scale = 2)
    private BigDecimal pricePerNight;
    
    @Column(name = "price_per_week", precision = 10, scale = 2)
    private BigDecimal pricePerWeek;
    
    @Column(name = "price_per_month", precision = 10, scale = 2)
    private BigDecimal pricePerMonth;
    
    @Column(name = "cleaning_fee", precision = 10, scale = 2)
    private BigDecimal cleaningFee;
    
    @Column(length = 3)
    private String currency = "EGP";
    
    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit;
    
    @Column(name = "available_from")
    private LocalDate availableFrom;
    
    @Column(name = "available_to")
    private LocalDate availableTo;
    
    @Column(name = "min_rental_days")
    private Integer minRentalDays = 1;
    
    @Column(name = "instant_booking")
    private Boolean instantBooking = false;
    
    @Enumerated(EnumType.STRING)
    private PropertyStatus status = PropertyStatus.draft;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(name = "booking_request_count")
    private Integer bookingRequestCount = 0;
    
    @Column(name = "booking_confirmed_count")
    private Integer bookingConfirmedCount = 0;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_booked_at")
    private LocalDateTime lastBookedAt;

    @Column(name = "favorite_count")
    private Integer favoriteCount = 0;
    
    // ✅ Relationship with PropertyImage
    // استخدم LAZY loading عادي، لكن في الـ queries هنستخدم FETCH JOIN
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PropertyImage> images = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum PropertyType {
        apartment, chalet, villa, studio, penthouse, room, farm, camp
    }

    public enum RentalType {
        vacation, long_term, both
    }

    public enum PropertyStatus {
        draft, pending_approval, active, inactive, suspended, deleted
    }

    /**
     * ✅ ADD THIS FIELD
     * Cover image URL for the property
     */
    @Column(name = "cover_image", length = 500)
    private String coverImage;
}