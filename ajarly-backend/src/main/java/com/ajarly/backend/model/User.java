package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "phone_number", unique = true, nullable = false)
    private String phoneNumber;
    
    @Column(name = "phone_verified")
    private Boolean phoneVerified = false;
    
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    // ADDED: Profile photo field (optional, can be null)
    @Column(name = "profile_photo", length = 500)
    private String profilePhoto;
    
    private String governorate;
    private String city;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "national_id_verified")
    private Boolean nationalIdVerified = false;
    
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @Column(name = "banned_at")
    private LocalDateTime bannedAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(name = "last_activity")
    private LocalDateTime lastActivity;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum UserType {
        renter, landlord, broker, admin;
        
        public String getValue() {
            return this.name();
        }
    }
}