package com.ajarly.backend.service;

import com.ajarly.backend.dto.UserDto;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;  // ← CORRECT IMPORT (add .slf4j)
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j  // This is correct
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageStorageService imageStorageService;
    
    /**
     * Get user profile by userId
     */
    public UserDto.ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserDto.ProfileResponse response = UserDto.ProfileResponse.fromUser(user);
        
        // Stats are set to null in fromUser() - populate later when stats tables are ready
        
        return response;
    }
    
    /**
     * Update user profile
     */
    @Transactional
    public UserDto.ProfileResponse updateProfile(Long userId, UserDto.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update allowed fields only
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBio(request.getBio());
        user.setGovernorate(request.getGovernorate());
        user.setCity(request.getCity());
        
        User updatedUser = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);
        
        return UserDto.ProfileResponse.fromUser(updatedUser);
    }
    
    /**
     * Change user password
     */
    @Transactional
    public void changePassword(Long userId, UserDto.ChangePasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Ensure new password is different
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }
        
        // Hash and save new password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", userId);
    }
    
    /**
     * Upload user avatar/profile photo
     */
    @Transactional
    public UserDto.AvatarUploadResponse uploadAvatar(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete old avatar if exists
        if (user.getProfilePhoto() != null && !user.getProfilePhoto().isEmpty()) {
            try {
                imageStorageService.deleteImage(user.getProfilePhoto());
                log.info("Old profile photo deleted for user: {}", userId);
            } catch (Exception e) {
                log.warn("Failed to delete old profile photo: {}", e.getMessage());
            }
        }
        
        // Upload new avatar to "avatars" folder
        Map<String, Object> uploadResult = imageStorageService.uploadImage(file, "avatars");
        String avatarUrl = (String) uploadResult.get("imageUrl");
        
        // Update user profile photo
        user.setProfilePhoto(avatarUrl);
        userRepository.save(user);
        
        log.info("Profile photo uploaded successfully for user: {}", userId);
        
        return new UserDto.AvatarUploadResponse(
            avatarUrl,
            "Profile photo uploaded successfully"
        );
    }
    
    /**
     * Get user by ID (for internal use)
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}