package com.ajarly.backend.service;

import com.ajarly.backend.dto.PropertyImageResponse;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.PropertyImage;
import com.ajarly.backend.repository.PropertyImageRepository;
import com.ajarly.backend.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyImageService {
    
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRepository propertyRepository;
    private final ImageStorageService imageStorageService;
    
    private static final int MAX_IMAGES_PER_PROPERTY = 10;
    
    /**
     * Upload multiple images for a property
     */
    @Transactional
    public List<PropertyImageResponse> uploadImages(Long propertyId, List<MultipartFile> files, Long userId) {
        // Find property
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));
        
        // Security check - verify ownership (commented for testing)
        // if (!property.getOwner().getUserId().equals(userId)) {
        //     throw new RuntimeException("You are not authorized to upload images for this property");
        // }
        
        // Check current image count
        Long currentImageCount = propertyImageRepository.countByPropertyId(propertyId);
        if (currentImageCount + files.size() > MAX_IMAGES_PER_PROPERTY) {
            throw new RuntimeException(
                String.format("Cannot upload %d images. Maximum %d images allowed per property. Current: %d",
                    files.size(), MAX_IMAGES_PER_PROPERTY, currentImageCount)
            );
        }
        
        List<PropertyImageResponse> uploadedImages = new ArrayList<>();
        int startOrder = currentImageCount.intValue();
        
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            try {
                // Upload to Cloudinary
                Map<String, Object> uploadResult = imageStorageService.uploadImage(
                    file, 
                    "properties/" + propertyId
                );
                
                // Create PropertyImage entity
                PropertyImage propertyImage = new PropertyImage();
                propertyImage.setProperty(property);
                propertyImage.setImageUrl((String) uploadResult.get("imageUrl"));
                propertyImage.setThumbnailUrl((String) uploadResult.get("thumbnailUrl"));
                propertyImage.setMediumUrl((String) uploadResult.get("mediumUrl"));
                propertyImage.setLargeUrl((String) uploadResult.get("largeUrl"));
                propertyImage.setImageOrder(startOrder + i);
                propertyImage.setFileSize((Long) uploadResult.get("fileSize"));
                propertyImage.setWidth((Integer) uploadResult.get("width"));
                propertyImage.setHeight((Integer) uploadResult.get("height"));
                
                // Set as cover if it's the first image
                if (currentImageCount == 0 && i == 0) {
                    propertyImage.setIsCover(true);
                } else {
                    propertyImage.setIsCover(false);
                }
                
                // Save to database
                PropertyImage savedImage = propertyImageRepository.save(propertyImage);
                uploadedImages.add(mapToResponse(savedImage));
                
                log.info("Image uploaded successfully for property {}: {}", propertyId, savedImage.getImageId());
                
            } catch (Exception e) {
                log.error("Error uploading image for property {}: {}", propertyId, e.getMessage());
                throw new RuntimeException("Failed to upload image: " + e.getMessage());
            }
        }
        
        return uploadedImages;
    }
    
    /**
     * Delete an image
     */
    @Transactional
    public void deleteImage(Long imageId, Long userId) {
        // Find image with property
        PropertyImage image = propertyImageRepository.findByIdWithProperty(imageId)
            .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));
        
        // Security check - verify ownership (commented for testing)
        // if (!image.getProperty().getOwner().getUserId().equals(userId)) {
        //     throw new RuntimeException("You are not authorized to delete this image");
        // }
        
        Long propertyId = image.getProperty().getPropertyId();
        boolean wasCover = image.getIsCover();
        
        // Delete from Cloudinary
        boolean deleted = imageStorageService.deleteImage(image.getImageUrl());
        if (!deleted) {
            log.warn("Failed to delete image from Cloudinary, but continuing with database deletion");
        }
        
        // Delete from database
        propertyImageRepository.delete(image);
        
        // If deleted image was cover, set another image as cover
        if (wasCover) {
            List<PropertyImage> remainingImages = propertyImageRepository.findByPropertyId(propertyId);
            if (!remainingImages.isEmpty()) {
                PropertyImage newCover = remainingImages.get(0);
                newCover.setIsCover(true);
                propertyImageRepository.save(newCover);
            }
        }
        
        log.info("Image deleted successfully: {}", imageId);
    }
    
    /**
     * Set an image as cover
     */
    @Transactional
    public PropertyImageResponse setCoverImage(Long imageId, Long userId) {
        // Find image with property
        PropertyImage image = propertyImageRepository.findByIdWithProperty(imageId)
            .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));
        
        // Security check - verify ownership (commented for testing)
        // if (!image.getProperty().getOwner().getUserId().equals(userId)) {
        //     throw new RuntimeException("You are not authorized to modify this image");
        // }
        
        Long propertyId = image.getProperty().getPropertyId();
        
        // Remove cover flag from current cover image
        propertyImageRepository.findCoverImageByPropertyId(propertyId)
            .ifPresent(currentCover -> {
                currentCover.setIsCover(false);
                propertyImageRepository.save(currentCover);
            });
        
        // Set new cover image
        image.setIsCover(true);
        PropertyImage updatedImage = propertyImageRepository.save(image);
        
        log.info("Cover image set for property {}: {}", propertyId, imageId);
        return mapToResponse(updatedImage);
    }
    
    /**
     * Get all images for a property
     */
    public List<PropertyImageResponse> getPropertyImages(Long propertyId) {
        List<PropertyImage> images = propertyImageRepository.findByPropertyId(propertyId);
        return images.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get single image by ID
     */
    public PropertyImageResponse getImageById(Long imageId) {
        PropertyImage image = propertyImageRepository.findById(imageId)
            .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));
        return mapToResponse(image);
    }
    
    /**
     * Map PropertyImage entity to response DTO
     */
    private PropertyImageResponse mapToResponse(PropertyImage image) {
        return PropertyImageResponse.builder()
            .imageId(image.getImageId())
            .propertyId(image.getProperty().getPropertyId())
            .imageUrl(image.getImageUrl())
            .thumbnailUrl(image.getThumbnailUrl())
            .mediumUrl(image.getMediumUrl())
            .largeUrl(image.getLargeUrl())
            .imageOrder(image.getImageOrder())
            .isCover(image.getIsCover())
            .captionAr(image.getCaptionAr())
            .captionEn(image.getCaptionEn())
            .fileSize(image.getFileSize())
            .width(image.getWidth())
            .height(image.getHeight())
            .uploadedAt(image.getUploadedAt())
            .build();
    }
}