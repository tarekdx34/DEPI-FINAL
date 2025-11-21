package com.ajarly.backend.controller;

import com.ajarly.backend.dto.PropertyDto;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.service.PropertyService;
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

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class PropertyController {
    
    private final PropertyService propertyService;
    
    /**
     * Extract userId from JWT token
     */
    private Long getUserIdFromRequest(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return (Long) userId;
    }
    
    /**
     * Create a new property
     * POST /api/v1/properties
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createProperty(
            @Valid @RequestBody PropertyDto.CreateRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("👤 User {} creating a new property", userId);
            
            PropertyDto.Response property = propertyService.createProperty(request, userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Property created successfully",
                "message_ar", "تم إنشاء العقار بنجاح",
                "data", property
            ));
            
        } catch (RuntimeException e) {
            log.error("❌ Error creating property: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get a single property by ID (public)
     * GET /api/v1/properties/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProperty(@PathVariable Long id) {
        try {
            log.info("📖 Fetching property: {}", id);
            
            PropertyDto.Response property = propertyService.getPropertyById(id);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", property
            ));
            
        } catch (RuntimeException e) {
            log.error("❌ Error fetching property {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Search properties with filters (public)
     * GET /api/v1/properties
     */
    @GetMapping
    public ResponseEntity<?> searchProperties(
            @RequestParam(required = false) String governorate,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Property.PropertyType propertyType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        try {
            log.info("🔍 Search request - gov: {}, city: {}, type: {}, beds: {}, page: {}", 
                     governorate, city, propertyType, bedrooms, page);
            
            Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<PropertyDto.ListResponse> properties = propertyService.searchProperties(
                governorate, city, propertyType, minPrice, maxPrice, bedrooms, pageable
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", properties.getContent());
            response.put("pagination", Map.of(
                "currentPage", properties.getNumber(),
                "totalPages", properties.getTotalPages(),
                "totalItems", properties.getTotalElements(),
                "itemsPerPage", properties.getSize(),
                "hasNext", properties.hasNext(),
                "hasPrevious", properties.hasPrevious()
            ));
            
            log.info("✅ Search completed - found {} properties", properties.getTotalElements());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("❌ Error searching properties: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get current user's properties
     * GET /api/v1/properties/my-properties
     */
    @GetMapping("/my-properties")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("👤 User {} fetching their properties (page: {})", userId, page);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            
            Page<PropertyDto.ListResponse> properties = propertyService.getMyProperties(userId, pageable);
            
            log.info("✅ Found {} properties for user {}", properties.getTotalElements(), userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", properties.getContent(),
                "pagination", Map.of(
                    "currentPage", properties.getNumber(),
                    "totalPages", properties.getTotalPages(),
                    "totalItems", properties.getTotalElements(),
                    "itemsPerPage", properties.getSize(),
                    "hasNext", properties.hasNext(),
                    "hasPrevious", properties.hasPrevious()
                )
            ));
            
        } catch (RuntimeException e) {
            log.error("❌ Error fetching user properties: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Update a property
     * PUT /api/v1/properties/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyDto.CreateRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("✏️ User {} updating property {}", userId, id);
            
            PropertyDto.Response property = propertyService.updateProperty(id, request, userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Property updated successfully",
                "message_ar", "تم تحديث العقار بنجاح",
                "data", property
            ));
            
        } catch (RuntimeException e) {
            log.error("❌ Error updating property {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Delete a property
     * DELETE /api/v1/properties/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteProperty(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            
            log.info("🗑️ User {} deleting property {}", userId, id);
            
            propertyService.deleteProperty(id, userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Property deleted successfully",
                "message_ar", "تم حذف العقار بنجاح"
            ));
            
        } catch (RuntimeException e) {
            log.error("❌ Error deleting property {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}