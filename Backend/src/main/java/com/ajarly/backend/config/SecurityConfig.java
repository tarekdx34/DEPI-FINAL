package com.ajarly.backend.config;

import com.ajarly.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

/**
 * ✅ FIXED VERSION - Security Configuration
 * 
 * CRITICAL FIXES:
 * 1. Admin endpoints now work with both "ADMIN" and "admin" roles
 * 2. Review admin endpoints properly secured
 * 3. Better endpoint ordering to prevent conflicts
 * 4. Enhanced CORS for development
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
       // log.info("🔧 Configuring Security Filter Chain...");
        
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // ========== PUBLIC ENDPOINTS ==========
                        .requestMatchers("/", "/health").permitAll()  // ADD THIS LINE

                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/locations/**").permitAll()
                        .requestMatchers("/api/v1/search/**").permitAll()
                        
                        // ========== ADMIN ENDPOINTS (Must be BEFORE other /api/v1/** matchers) ==========
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "admin")
                        
                        // Analytics admin endpoints
                        .requestMatchers("/api/v1/analytics/admin/**").hasAnyRole("ADMIN", "admin")
                        
                        // Reports admin endpoints
                    
                        .requestMatchers("/api/v1/reviews/admin/**").hasAnyRole("ADMIN", "admin")  // ✅ ADDED
                        
                        // ========== PROPERTIES ==========
                        .requestMatchers(HttpMethod.GET, "/api/v1/properties/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/properties/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/properties/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/properties/**").authenticated()
                        
                        // ========== REVIEWS (Fixed ordering) ==========
                        // Specific routes FIRST, then general patterns
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/property/**").permitAll()  // ✅ FIXED
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/user/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/{id}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/reviews").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/reviews/**").authenticated()
                        
                        // ========== OTHER AUTHENTICATED ENDPOINTS ==========
                        .requestMatchers("/api/v1/users/**").authenticated()
                        .requestMatchers("/api/v1/bookings/**").authenticated()
                        .requestMatchers("/api/v1/favorites/**").authenticated()
                        .requestMatchers("/api/v1/payments/**").authenticated()
                        .requestMatchers("/api/v1/subscriptions/**").authenticated()
                        .requestMatchers("/api/v1/analytics/**").authenticated()
                        .requestMatchers("/api/v1/reports/**").authenticated()
                        
                        // ========== DEFAULT ==========
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

      //  log.info("✅ Security Filter Chain configured successfully");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
      //  log.info("🌐 Configuring CORS...");
        
        CorsConfiguration configuration = new CorsConfiguration();
        
        // ✅ Allow all origins (for development)
        configuration.setAllowedOrigins(Arrays.asList("*"));
        
        // ✅ Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // ✅ Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // ✅ Expose Authorization header
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        // ✅ Don't allow credentials with wildcard origin
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
      //  log.info("✅ CORS configured: Allow all origins, methods, and headers");
        
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
     //   log.info("🔐 Creating BCryptPasswordEncoder...");
        return new BCryptPasswordEncoder();
    }
}