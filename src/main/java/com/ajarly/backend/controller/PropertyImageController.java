package com.ajarly.backend.controller;

import com.ajarly.backend.dto.PropertyImageResponse;
import com.ajarly.backend.service.PropertyImageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Property Image Controller - Feature 3
 * 
 * Handles image upload, deletion, and management for properties
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class PropertyImageController {
    
    private final PropertyImageService propertyImageService;
    
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
     * Upload images for a property
     * POST /api/v1/properties/{propertyId}/images
     */
    @PostMapping("/properties/{propertyId}/images")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long propertyId,
            @RequestParam("files") List<MultipartFile> files,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("User {} uploading {} images for property {}", userId, files.size(), propertyId);
            
            List<PropertyImageResponse> uploadedImages = propertyImageService.uploadImages(
                propertyId, 
                files, 
                userId
            );
            
            Map<String, Object> response = Map.of(
                "uploadedCount", uploadedImages.size(),
                "images", uploadedImages
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Images uploaded successfully",
                "message_ar", "تم رفع الصور بنجاح",
                "data", response
            ));
            
        } catch (RuntimeException e) {
            log.error("Error uploading images for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get all images for a property (PUBLIC - No authentication required)
     * GET /api/v1/properties/{propertyId}/images
     */
    @GetMapping("/properties/{propertyId}/images")
    public ResponseEntity<?> getPropertyImages(@PathVariable Long propertyId) {
        try {
            log.info("Fetching images for property {}", propertyId);
            
            List<PropertyImageResponse> images = propertyImageService.getPropertyImages(propertyId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", images
            ));
            
        } catch (RuntimeException e) {
            log.error("Error fetching images for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Delete an image
     * DELETE /api/v1/properties/images/{imageId}
     */
    @DeleteMapping("/properties/images/{imageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteImage(
            @PathVariable Long imageId,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("User {} deleting image {}", userId, imageId);
            
            propertyImageService.deleteImage(imageId, userId);
            
            Map<String, Object> response = Map.of(
                "imageId", imageId,
                "deleted", true,
                "message", "Image deleted successfully"
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Image deleted successfully",
                "message_ar", "تم حذف الصورة بنجاح",
                "data", response
            ));
            
        } catch (RuntimeException e) {
            log.error("Error deleting image {}: {}", imageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Set an image as cover
     * PUT /api/v1/properties/images/{imageId}/cover
     */
    @PutMapping("/properties/images/{imageId}/cover")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> setCoverImage(
            @PathVariable Long imageId,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("User {} setting image {} as cover", userId, imageId);
            
            PropertyImageResponse coverImage = propertyImageService.setCoverImage(imageId, userId);
            
            Map<String, Object> response = Map.of(
                "imageId", coverImage.getImageId(),
                "imageUrl", coverImage.getImageUrl(),
                "isCover", true,
                "message", "Cover image set successfully"
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cover image set successfully",
                "message_ar", "تم تعيين صورة الغلاف بنجاح",
                "data", response
            ));
            
        } catch (RuntimeException e) {
            log.error("Error setting cover image {}: {}", imageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get a single image by ID
     * GET /api/v1/properties/images/{imageId}
     */
    @GetMapping("/properties/images/{imageId}")
    public ResponseEntity<?> getImageById(@PathVariable Long imageId) {
        try {
            log.info("Fetching image {}", imageId);
            
            PropertyImageResponse image = propertyImageService.getImageById(imageId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", image
            ));
            
        } catch (RuntimeException e) {
            log.error("Error fetching image {}: {}", imageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}