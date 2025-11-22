package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "unavailable_dates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnavailableDate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unavailable_id")
    private Integer unavailableId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @Column(name = "unavailable_from", nullable = false)
    private LocalDate unavailableFrom;
    
    @Column(name = "unavailable_to", nullable = false)
    private LocalDate unavailableTo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reason")
    private UnavailableReason reason = UnavailableReason.owner_blocked;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    // Enum
    public enum UnavailableReason {
        booked, owner_blocked, maintenance, seasonal_closure
    }
}