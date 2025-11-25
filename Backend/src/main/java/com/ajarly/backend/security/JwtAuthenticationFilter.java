package com.ajarly.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * ✅ FIXED VERSION - JWT Authentication Filter
 * 
 * CRITICAL FIXES:
 * 1. Always add ROLE_ prefix for Spring Security
 * 2. Convert role to UPPERCASE for consistency
 * 3. Enhanced logging for debugging
 * 4. Better error handling
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        log.debug("🔐 JWT Filter processing: {} {}", method, requestURI);
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt)) {
                log.debug("📄 JWT Token found, validating...");
                
                if (jwtUtil.validateToken(jwt)) {
                    Long userId = jwtUtil.getUserIdFromToken(jwt);
                    String role = jwtUtil.getRoleFromToken(jwt);
                    
                    log.info("✅ Valid JWT - User ID: {}, Raw Role: '{}'", userId, role);
                    
                    // ✅ CRITICAL: Set userId as request attribute
                    request.setAttribute("userId", userId);
                    
                    // ✅ CRITICAL: Build authorities with proper format
                    List<SimpleGrantedAuthority> authorities = buildAuthorities(role);
                    
                    // ✅ Create authentication object
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    
                    // ✅ Set in security context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    log.info("✅ Authentication set successfully:");
                    log.info("   - User ID: {}", userId);
                    log.info("   - Authorities: {}", authorities);
                    
                } else {
                    log.warn("⚠️ Invalid JWT token for request: {}", requestURI);
                }
            } else {
                log.debug("ℹ️ No JWT token found for: {}", requestURI);
            }
            
        } catch (Exception ex) {
            log.error("❌ JWT Authentication failed for {}: {}", requestURI, ex.getMessage());
            log.error("   Exception: ", ex);
            // Don't throw - let Spring Security handle it
        }
        
        // ✅ Always continue the filter chain
        filterChain.doFilter(request, response);
    }
    
    /**
     * ✅ Build authorities list with proper Spring Security format
     */
    private List<SimpleGrantedAuthority> buildAuthorities(String role) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        if (role != null && !role.trim().isEmpty()) {
            // Remove any existing "ROLE_" prefix and whitespace
            String cleanRole = role.trim()
                                   .toUpperCase()
                                   .replace("ROLE_", "");
            
            // Add with ROLE_ prefix (Spring Security requirement)
            String authority = "ROLE_" + cleanRole;
            authorities.add(new SimpleGrantedAuthority(authority));
            
            log.debug("🔑 Created authority: {} (from raw role: {})", authority, role);
            
            // ✅ BONUS: Add the clean role as well (for flexibility)
            authorities.add(new SimpleGrantedAuthority(cleanRole));
            
        } else {
            log.warn("⚠️ No role provided in JWT token");
        }
        
        return authorities;
    }
    
    /**
     * ✅ Extract JWT from Authorization header
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken)) {
            log.debug("📋 Authorization header: {}", 
                     bearerToken.substring(0, Math.min(20, bearerToken.length())) + "...");
            
            if (bearerToken.startsWith("Bearer ")) {
                return bearerToken.substring(7);
            } else {
                log.warn("⚠️ Authorization header doesn't start with 'Bearer '");
            }
        }
        
        return null;
    }
    
    /**
     * ✅ Skip filter for public endpoints (optimization)
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Skip JWT filter for public auth endpoints
        return path.startsWith("/api/v1/auth/") && 
               !path.contains("/admin/");
    }
}