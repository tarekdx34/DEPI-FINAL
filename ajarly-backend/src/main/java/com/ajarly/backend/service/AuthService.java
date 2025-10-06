package com.ajarly.backend.service;

import com.ajarly.backend.dto.AuthDto;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.UserRepository;
import com.ajarly.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already registered");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUserType(request.getUserType());
        user.setGovernorate(request.getGovernorate());
        user.setCity(request.getCity());
        
        User savedUser = userRepository.save(user);
        
        String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getEmail());
        
        return new AuthDto.AuthResponse(
            token,
            "Bearer",
            savedUser.getUserId(),
            savedUser.getEmail(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            savedUser.getUserType()
        );
    }
    
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }
        
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail());
        
        return new AuthDto.AuthResponse(
            token,
            "Bearer",
            user.getUserId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getUserType()
        );
    }
}