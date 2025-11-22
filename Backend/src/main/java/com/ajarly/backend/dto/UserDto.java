package com.ajarly.backend.dto;

import com.ajarly.backend.model.User;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserDto {
    
    // Request: Update Profile
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        
        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
        private String firstName;
        
        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
        private String lastName;
        
        @Size(max = 500, message = "Bio cannot exceed 500 characters")
        private String bio;
        
        @Size(max = 100, message = "Governorate name is too long")
        private String governorate;
        
        @Size(max = 100, message = "City name is too long")
        private String city;
    }
    
    // Request: Change Password
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        
        @NotBlank(message = "Current password is required")
        private String oldPassword;
        
        @NotBlank(message = "New password is required")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
            message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
        )
        private String newPassword;
        
        @NotBlank(message = "Password confirmation is required")
        private String confirmPassword;
    }
    
    // Request: Phone Verification
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhoneVerificationRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
        private String phoneNumber;
    }
    
    // Request: Verify Phone Code
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyPhoneCodeRequest {
        @NotBlank(message = "Verification code is required")
        @Pattern(regexp = "^[0-9]{6}$", message = "Verification code must be 6 digits")
        private String code;
    }
    
    // Response: User Profile
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileResponse {
        private Long userId;
        private String email;
        private String phoneNumber;
        private Boolean phoneVerified;
        private Boolean emailVerified;
        private String userType;
        private String firstName;
        private String lastName;
        private String profilePhoto;
        private String bio;
        private String governorate;
        private String city;
        private Boolean isActive;
        private Boolean nationalIdVerified;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;
        
        // Statistics (optional - set to null if not available)
        private Integer totalBookings;
        private Integer totalListings;
        
        public static ProfileResponse fromUser(User user) {
            ProfileResponse response = new ProfileResponse();
            response.setUserId(user.getUserId());
            response.setEmail(user.getEmail());
            response.setPhoneNumber(user.getPhoneNumber());
            response.setPhoneVerified(user.getPhoneVerified());
            response.setEmailVerified(user.getEmailVerified());
            response.setUserType(user.getUserType().name());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setProfilePhoto(user.getProfilePhoto());
            response.setBio(user.getBio());
            response.setGovernorate(user.getGovernorate());
            response.setCity(user.getCity());
            response.setIsActive(user.getIsActive());
            response.setNationalIdVerified(user.getNationalIdVerified());
            response.setCreatedAt(user.getCreatedAt());
            response.setLastLogin(user.getLastLogin());
            // Set stats to null - will be populated later
            response.setTotalBookings(null);
            response.setTotalListings(null);
            return response;
        }
    }
    
    // Response: Simple Success Message
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
    
    // Response: Avatar Upload
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvatarUploadResponse {
        private String profilePhoto;
        private String message;
    }
    
    // Response: Phone Verification Sent
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhoneVerificationResponse {
        private String message;
        private LocalDateTime expiresAt;
    }
}