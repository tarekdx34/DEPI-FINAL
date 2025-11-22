package com.ajarly.backend.service;

import com.ajarly.backend.dto.UserDto;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhoneVerificationService {
    
    private final UserRepository userRepository;
    private static final int CODE_EXPIRY_MINUTES = 10;
    private static final SecureRandom random = new SecureRandom();
    
    /**
     * Send verification code to user's phone
     */
    @Transactional
    public UserDto.PhoneVerificationResponse sendVerificationCode(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if phone is already verified
        if (Boolean.TRUE.equals(user.getPhoneVerified())) {
            throw new IllegalStateException("Phone number is already verified");
        }
        
        // Generate 6-digit code
        String verificationCode = generateVerificationCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(CODE_EXPIRY_MINUTES);
        
        // Save code and expiry to database
        user.setPhoneVerificationCode(verificationCode);
        user.setPhoneVerificationCodeExpiresAt(expiresAt);  // ← FIXED: Added "Code"
        userRepository.save(user);
        
        // TODO: Integrate with SMS provider (Twilio, SNS, etc.)
        // For now, just log it (remove in production!)
        log.info("===== PHONE VERIFICATION CODE =====");
        log.info("User ID: {}", userId);
        log.info("Phone: {}", user.getPhoneNumber());
        log.info("Code: {}", verificationCode);
        log.info("Expires At: {}", expiresAt);
        log.info("===================================");
        
        // In production, send SMS here:
        // smsService.sendSMS(user.getPhoneNumber(), 
        //     "Your Ajarly verification code is: " + verificationCode);
        
        return new UserDto.PhoneVerificationResponse(
            "Verification code sent to " + maskPhoneNumber(user.getPhoneNumber()),
            expiresAt
        );
    }
    
    /**
     * Verify phone code
     */
    @Transactional
    public void verifyCode(Long userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if already verified
        if (Boolean.TRUE.equals(user.getPhoneVerified())) {
            throw new IllegalStateException("Phone number is already verified");
        }
        
        // Check if code exists
        if (user.getPhoneVerificationCode() == null) {
            throw new IllegalArgumentException("No verification code found. Please request a new code.");
        }
        
        // Check if code is expired
        if (user.getPhoneVerificationCodeExpiresAt() == null ||   // ← FIXED: Added "Code"
            user.getPhoneVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new code.");
        }
        
        // Verify code matches
        if (!code.equals(user.getPhoneVerificationCode())) {
            throw new IllegalArgumentException("Invalid verification code");
        }
        
        // Mark phone as verified
        user.setPhoneVerified(true);
        user.setPhoneVerificationCode(null); // Clear code after successful verification
        user.setPhoneVerificationCodeExpiresAt(null);  // ← FIXED: Added "Code"
        userRepository.save(user);
        
        log.info("Phone number verified successfully for user: {}", userId);
    }
    
    /**
     * Generate a random 6-digit verification code
     */
    private String generateVerificationCode() {
        int code = 100000 + random.nextInt(900000); // Range: 100000-999999
        return String.valueOf(code);
    }
    
    /**
     * Mask phone number for security (show last 4 digits only)
     * Example: +201234567890 -> +2012****7890
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 8) {
            return phoneNumber;
        }
        
        int visibleDigits = 4;
        int maskLength = phoneNumber.length() - visibleDigits - 4; // Keep country code
        
        if (maskLength <= 0) {
            return phoneNumber;
        }
        
        return phoneNumber.substring(0, 4) + 
               "*".repeat(maskLength) + 
               phoneNumber.substring(phoneNumber.length() - visibleDigits);
    }
}