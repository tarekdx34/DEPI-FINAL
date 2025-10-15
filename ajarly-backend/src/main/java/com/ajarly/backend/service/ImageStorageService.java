package com.ajarly.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageStorageService {
    
    private final Cloudinary cloudinary;
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    );
    
    /**
     * Upload image to Cloudinary and return URLs for different sizes
     */
    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        // Validate file
        validateFile(file);
        
        // Upload to Cloudinary with transformations
        Map<String, Object> uploadParams = ObjectUtils.asMap(
            "folder", "ajarly/" + folder,
            "resource_type", "image",
            "quality", "auto",
            "fetch_format", "auto"
        );
        
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        
        // Extract public_id for generating different sizes
        String publicId = (String) uploadResult.get("public_id");
        String version = uploadResult.get("version").toString();
        
        // Generate URLs for different sizes using Cloudinary transformations
        Map<String, Object> result = new HashMap<>();
        result.put("imageUrl", uploadResult.get("secure_url")); // Original
        result.put("thumbnailUrl", generateTransformedUrl(publicId, version, 150, 150));
        result.put("mediumUrl", generateTransformedUrl(publicId, version, 600, 400));
        result.put("largeUrl", generateTransformedUrl(publicId, version, 1200, 800));
        result.put("publicId", publicId);
        result.put("width", uploadResult.get("width"));
        result.put("height", uploadResult.get("height"));
        result.put("fileSize", file.getSize());
        
        log.info("Image uploaded successfully: {}", publicId);
        return result;
    }
    
    /**
     * Delete image from Cloudinary
     */
    public boolean deleteImage(String imageUrl) {
        try {
            // Extract public_id from URL
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId == null) {
                log.error("Could not extract public_id from URL: {}", imageUrl);
                return false;
            }
            
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("result");
            
            log.info("Image deletion result for {}: {}", publicId, resultStatus);
            return "ok".equals(resultStatus);
        } catch (Exception e) {
            log.error("Error deleting image: {}", imageUrl, e);
            return false;
        }
    }
    
    /**
     * Validate file type and size
     */
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                String.format("File size exceeds maximum allowed size of %d MB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }
        
        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                "Invalid file type. Only JPG, PNG, and WebP images are allowed"
            );
        }
    }
    
    /**
     * Generate transformed URL for specific dimensions
     */
    private String generateTransformedUrl(String publicId, String version, int width, int height) {
        return cloudinary.url()
            .transformation(
                new com.cloudinary.Transformation()
                    .width(width)
                    .height(height)
                    .crop("fill")
                    .quality("auto")
                    .fetchFormat("auto")
            )
            .version(version)
            .generate(publicId);
    }
    
    /**
     * Extract public_id from Cloudinary URL
     */
    private String extractPublicIdFromUrl(String url) {
        try {
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
            if (url.contains("/ajarly/")) {
                int startIndex = url.indexOf("/ajarly/");
                int endIndex = url.lastIndexOf(".");
                if (endIndex > startIndex) {
                    return url.substring(startIndex + 1, endIndex);
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Error extracting public_id from URL: {}", url, e);
            return null;
        }
    }
}