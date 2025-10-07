package com.ajarly.backend.controller;

import com.ajarly.backend.dto.*;
import com.ajarly.backend.service.PropertyImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PropertyImageController {
    
    private final PropertyImageService propertyImageService;
    
    /**
     * Upload images for a property
     * POST /api/properties/{propertyId}/images
     */
    @PostMapping(value = "/{propertyId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadImages(
            @PathVariable Long propertyId,
            @RequestParam("files") List<MultipartFile> files
            // @RequestHeader("Authorization") String token // Uncomment when security is enabled
    ) {
        try {
            // TODO: Extract userId from JWT token when security is enabled
            Long userId = 1L; // Hardcoded for testing
            
            log.info("Uploading {} images for property {}", files.size(), propertyId);
            
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
     * Get all images for a property
     * GET /api/properties/{propertyId}/images
     */
    @GetMapping("/{propertyId}/images")
    public ResponseEntity<List<PropertyImageResponse>> getPropertyImages(
            @PathVariable Long propertyId
    ) {
        try {
            List<PropertyImageResponse> images = propertyImageService.getPropertyImages(propertyId);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            log.error("Error fetching images for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get single image by ID
     * GET /api/properties/images/{imageId}
     */
    @GetMapping("/images/{imageId}")
    public ResponseEntity<PropertyImageResponse> getImageById(
            @PathVariable Long imageId
    ) {
        try {
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
    public ResponseEntity<ImageDeleteResponse> deleteImage(
            @PathVariable Long imageId
            // @RequestHeader("Authorization") String token // Uncomment when security is enabled
    ) {
        try {
            // TODO: Extract userId from JWT token when security is enabled
            Long userId = 1L; // Hardcoded for testing
            
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
    public ResponseEntity<CoverImageResponse> setCoverImage(
            @PathVariable Long imageId
            // @RequestHeader("Authorization") String token // Uncomment when security is enabled
    ) {
        try {
            // TODO: Extract userId from JWT token when security is enabled
            Long userId = 1L; // Hardcoded for testing
            
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