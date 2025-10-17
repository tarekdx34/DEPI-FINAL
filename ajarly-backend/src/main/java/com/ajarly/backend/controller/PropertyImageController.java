package com.ajarly.backend.controller;

import com.ajarly.backend.dto.*;
import com.ajarly.backend.service.PropertyImageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Property Image Controller
 * 
 * Uses JWT authentication from request attributes
 */
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
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
     * POST /api/properties/{propertyId}/images
     */
    @PostMapping(value = "/{propertyId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ImageUploadResponse> uploadImages(
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
            
            ImageUploadResponse response = ImageUploadResponse.builder()
                .success(true)
                .message(String.format("Successfully uploaded %d image(s)", uploadedImages.size()))
                .images(uploadedImages)
                .totalImages(uploadedImages.size())
                .build();
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            ImageUploadResponse response = ImageUploadResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build();
            return ResponseEntity.badRequest().body(response);
            
        } catch (RuntimeException e) {
            log.error("Error uploading images: {}", e.getMessage());
            ImageUploadResponse response = ImageUploadResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all images for a property (public endpoint)
     * GET /api/properties/{propertyId}/images
     */
    @GetMapping("/{propertyId}/images")
    public ResponseEntity<List<PropertyImageResponse>> getPropertyImages(
            @PathVariable Long propertyId) {
        
        try {
            log.info("Fetching images for property {}", propertyId);
            
            List<PropertyImageResponse> images = propertyImageService.getPropertyImages(propertyId);
            return ResponseEntity.ok(images);
            
        } catch (Exception e) {
            log.error("Error fetching images for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get single image by ID (public endpoint)
     * GET /api/properties/images/{imageId}
     */
    @GetMapping("/images/{imageId}")
    public ResponseEntity<PropertyImageResponse> getImageById(
            @PathVariable Long imageId) {
        
        try {
            log.info("Fetching image {}", imageId);
            
            PropertyImageResponse image = propertyImageService.getImageById(imageId);
            return ResponseEntity.ok(image);
            
        } catch (RuntimeException e) {
            log.error("Error fetching image {}: {}", imageId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete an image
     * DELETE /api/properties/images/{imageId}
     */
    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ImageDeleteResponse> deleteImage(
            @PathVariable Long imageId,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("User {} deleting image {}", userId, imageId);
            
            propertyImageService.deleteImage(imageId, userId);
            
            ImageDeleteResponse response = ImageDeleteResponse.builder()
                .success(true)
                .message("Image deleted successfully")
                .deletedImageId(imageId)
                .build();
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error deleting image {}: {}", imageId, e.getMessage());
            ImageDeleteResponse response = ImageDeleteResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Set an image as cover
     * PUT /api/properties/images/{imageId}/cover
     */
    @PutMapping("/images/{imageId}/cover")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CoverImageResponse> setCoverImage(
            @PathVariable Long imageId,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("User {} setting image {} as cover", userId, imageId);
            
            PropertyImageResponse updatedImage = propertyImageService.setCoverImage(imageId, userId);
            
            CoverImageResponse response = CoverImageResponse.builder()
                .success(true)
                .message("Cover image set successfully")
                .coverImageId(updatedImage.getImageId())
                .build();
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error setting cover image {}: {}", imageId, e.getMessage());
            CoverImageResponse response = CoverImageResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}