package com.ajarly.backend.controller;

import com.ajarly.backend.dto.FavoriteDto;
import com.ajarly.backend.service.FavoriteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Favorite/Wishlist Controller
 * 
 * Handles user favorites (wishlist) operations
 * Uses JWT authentication from request attributes
 */
@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    
    /**
     * Extract userId from JWT token (set by JwtAuthenticationFilter)
     */
    private Long getUserIdFromRequest(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return (Long) userId;
    }
    
    /**
     * Add a property to favorites
     * POST /api/v1/favorites
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addFavorite(
            @Valid @RequestBody FavoriteDto.AddRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("User {} adding property {} to favorites", userId, request.getPropertyId());
            
            FavoriteDto.FavoriteResponse favorite = favoriteService.addFavorite(
                request.getPropertyId(), 
                userId, 
                request.getNotes()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Property added to favorites successfully",
                "message_ar", "تمت إضافة العقار إلى المفضلة بنجاح",
                "data", favorite
            ));
            
        } catch (RuntimeException e) {
            log.error("Error adding favorite: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get user's favorites with pagination
     * GET /api/v1/favorites
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("Fetching favorites for user {}", userId);
            
            Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<FavoriteDto.FavoriteResponse> favorites = 
                favoriteService.getUserFavorites(userId, pageable);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Favorites retrieved successfully",
                "data", favorites.getContent(),
                "pagination", Map.of(
                    "currentPage", favorites.getNumber(),
                    "totalPages", favorites.getTotalPages(),
                    "totalItems", favorites.getTotalElements(),
                    "itemsPerPage", favorites.getSize(),
                    "hasNext", favorites.hasNext(),
                    "hasPrevious", favorites.hasPrevious()
                )
            ));
            
        } catch (RuntimeException e) {
            log.error("Error fetching favorites: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Remove a property from favorites
     * DELETE /api/v1/favorites/{propertyId}
     */
    @DeleteMapping("/{propertyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeFavorite(
            @PathVariable Long propertyId,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("User {} removing property {} from favorites", userId, propertyId);
            
            favoriteService.removeFavorite(propertyId, userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Property removed from favorites successfully",
                "message_ar", "تمت إزالة العقار من المفضلة بنجاح"
            ));
            
        } catch (RuntimeException e) {
            log.error("Error removing favorite: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Check if a property is in user's favorites
     * GET /api/v1/favorites/check/{propertyId}
     */
    @GetMapping("/check/{propertyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> checkFavorite(
            @PathVariable Long propertyId,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("Checking if property {} is favorited by user {}", propertyId, userId);
            
            FavoriteDto.CheckResponse checkResponse = 
                favoriteService.isFavorited(propertyId, userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", checkResponse
            ));
            
        } catch (RuntimeException e) {
            log.error("Error checking favorite: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}