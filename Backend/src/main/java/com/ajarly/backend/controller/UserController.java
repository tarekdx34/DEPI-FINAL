package com.ajarly.backend.controller;

import com.ajarly.backend.dto.UserDto;
import com.ajarly.backend.model.User;                      // ← ADD THIS
import com.ajarly.backend.repository.UserRepository;       // ← ADD THIS
import com.ajarly.backend.security.JwtUtil;                // ← ADD THIS
import com.ajarly.backend.service.PhoneVerificationService;
import com.ajarly.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;                                      // ← ADD THIS

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final PhoneVerificationService phoneVerificationService;
    private final UserRepository userRepository;           // ← This needs import
    private final JwtUtil jwtUtil;                         // ← ADD THIS LINE
    
    /**
     * Get authenticated user ID from security context
     */
    private Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        throw new RuntimeException("User not authenticated");
    }
    
    /**
     * GET /api/v1/users/profile - Get own profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserDto.ProfileResponse> getProfile() {
        Long userId = getAuthenticatedUserId();
        UserDto.ProfileResponse profile = userService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * PUT /api/v1/users/profile - Update profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserDto.ProfileResponse> updateProfile(
            @Valid @RequestBody UserDto.UpdateProfileRequest request) {
        Long userId = getAuthenticatedUserId();
        UserDto.ProfileResponse updatedProfile = userService.updateProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }
    
    /**
     * PUT /api/v1/users/password - Change password
     */
    @PutMapping("/password")
    public ResponseEntity<UserDto.MessageResponse> changePassword(
            @Valid @RequestBody UserDto.ChangePasswordRequest request) {
        Long userId = getAuthenticatedUserId();
        userService.changePassword(userId, request);
        return ResponseEntity.ok(
            new UserDto.MessageResponse("Password changed successfully")
        );
    }
    
    /**
     * POST /api/v1/users/upload-avatar - Upload profile photo
     */
    @PostMapping(value = "/upload-avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto.AvatarUploadResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        
        Long userId = getAuthenticatedUserId();
        
        // Validate file is provided
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile photo file is required");
        }
        
        try {
            UserDto.AvatarUploadResponse response = userService.uploadAvatar(userId, file);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error uploading avatar for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to upload profile photo: " + e.getMessage());
        }
    }
    
    /**
     * POST /api/v1/users/verify-phone - Request phone verification
     */
    @PostMapping("/verify-phone")
    public ResponseEntity<UserDto.PhoneVerificationResponse> requestPhoneVerification() {
        Long userId = getAuthenticatedUserId();
        UserDto.PhoneVerificationResponse response = 
            phoneVerificationService.sendVerificationCode(userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * POST /api/v1/users/verify-phone/confirm - Confirm verification code
     */
    @PostMapping("/verify-phone/confirm")
    public ResponseEntity<UserDto.MessageResponse> confirmPhoneVerification(
            @Valid @RequestBody UserDto.VerifyPhoneCodeRequest request) {
        Long userId = getAuthenticatedUserId();
        phoneVerificationService.verifyCode(userId, request.getCode());
        return ResponseEntity.ok(
            new UserDto.MessageResponse("Phone number verified successfully")
        );
    }
    
    /**
     * Global exception handler for this controller
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<UserDto.MessageResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
            .body(new UserDto.MessageResponse(ex.getMessage()));
    }
    
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<UserDto.MessageResponse> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new UserDto.MessageResponse(ex.getMessage()));
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<UserDto.MessageResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception in UserController: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new UserDto.MessageResponse(ex.getMessage()));
    }
    
    // ⚠️ TEMPORARY - For testing only
    @GetMapping("/debug/token")
    public ResponseEntity<?> getDebugToken() {
        User user = userRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new RuntimeException("No users found"));
        
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail());
        
        return ResponseEntity.ok(Map.of(
            "token", token,
            "userId", user.getUserId(),
            "email", user.getEmail()
        ));
    }
}