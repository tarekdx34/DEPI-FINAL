package com.ajarly.backend.controller;

import com.ajarly.backend.dto.PropertyDto;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Property Controller
 * 
 * FIXED: Changed to use X-User-Id header instead of hardcoded userId
 * FIXED: Changed userId from Long to Integer to match database
 */
@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PropertyController {
    
    private final PropertyService propertyService;
    
    @PostMapping
    public ResponseEntity<?> createProperty(
            @Valid @RequestBody PropertyDto.CreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        // ========== TEMPORARY: For testing without JWT ==========
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "User authentication required. Please provide X-User-Id header."
            ));
        }
        // ========== END TEMPORARY ==========
        
        PropertyDto.Response property = propertyService.createProperty(request, userId.longValue());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "message", "Property created successfully",
            "message_ar", "تم إنشاء العقار بنجاح",
            "data", property
        ));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getProperty(@PathVariable Long id) {
        PropertyDto.Response property = propertyService.getPropertyById(id);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", property
        ));
    }
    
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
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-properties")
    public ResponseEntity<?> getMyProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        // ========== TEMPORARY: For testing without JWT ==========
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "User authentication required. Please provide X-User-Id header."
            ));
        }
        // ========== END TEMPORARY ==========
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<PropertyDto.ListResponse> properties = propertyService.getMyProperties(userId.longValue(), pageable);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", properties.getContent(),
            "pagination", Map.of(
                "currentPage", properties.getNumber(),
                "totalPages", properties.getTotalPages(),
                "totalItems", properties.getTotalElements()
            )
        ));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyDto.CreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        // ========== TEMPORARY: For testing without JWT ==========
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "User authentication required. Please provide X-User-Id header."
            ));
        }
        // ========== END TEMPORARY ==========
        
        PropertyDto.Response property = propertyService.updateProperty(id, request, userId.longValue());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Property updated successfully",
            "message_ar", "تم تحديث العقار بنجاح",
            "data", property
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        
        // ========== TEMPORARY: For testing without JWT ==========
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "User authentication required. Please provide X-User-Id header."
            ));
        }
        // ========== END TEMPORARY ==========
        
        propertyService.deleteProperty(id, userId.longValue());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Property deleted successfully",
            "message_ar", "تم حذف العقار بنجاح"
        ));
    }
}