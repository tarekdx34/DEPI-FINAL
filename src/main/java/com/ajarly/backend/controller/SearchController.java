package com.ajarly.backend.controller;

import com.ajarly.backend.dto.LocationSuggestion;
import com.ajarly.backend.dto.PopularLocationResponse;
import com.ajarly.backend.dto.SearchRequest;
import com.ajarly.backend.dto.SearchResponse;
import com.ajarly.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class SearchController {
    
    private final SearchService searchService;
    
    /**
     * البحث المتقدم عن العقارات
     * POST /api/v1/search
     */
    @PostMapping("/search")
    public ResponseEntity<?> advancedSearch(@RequestBody SearchRequest searchRequest) {
        try {
            log.info("🔍 Advanced search request: {}", searchRequest);
            
            SearchResponse response = searchService.advancedSearch(searchRequest);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
            ));
            
        } catch (IllegalArgumentException e) {
            log.error("❌ Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ Error in advanced search", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "An unexpected error occurred. Please try again later.",
                "message_ar", "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            ));
        }
    }
    
    /**
     * الحصول على اقتراحات المواقع (Autocomplete)
     * GET /api/v1/locations/suggestions?q=القاهرة
     */
    @GetMapping("/locations/suggestions")
    public ResponseEntity<?> getLocationSuggestions(@RequestParam String q) {
        try {
            log.info("🔍 Location suggestions query: {}", q);
            
            List<LocationSuggestion> suggestions = searchService.getSearchSuggestions(q);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", suggestions
            ));
            
        } catch (Exception e) {
            log.error("❌ Error getting location suggestions", e);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of()  // Return empty list on error
            ));
        }
    }
    
    /**
     * الحصول على المواقع الشعبية
     * GET /api/v1/locations/popular?limit=10
     */
    @GetMapping("/locations/popular")
    public ResponseEntity<?> getPopularLocations(
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            log.info("📍 Fetching {} popular locations", limit);
            
            List<PopularLocationResponse> locations = searchService.getPopularLocations(limit);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", locations
            ));
            
        } catch (Exception e) {
            log.error("❌ Error fetching popular locations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "An unexpected error occurred. Please try again later.",
                "message_ar", "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            ));
        }
    }
    
    /**
     * الحصول على قائمة المحافظات
     * GET /api/v1/locations/governorates
     */
    @GetMapping("/locations/governorates")
    public ResponseEntity<?> getGovernorates() {
        try {
            log.info("📍 Fetching governorates");
            
            List<String> governorates = searchService.getAvailableGovernorates();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", governorates
            ));
            
        } catch (Exception e) {
            log.error("❌ Error fetching governorates", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "An unexpected error occurred. Please try again later.",
                "message_ar", "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            ));
        }
    }
    
    /**
     * الحصول على قائمة المدن في محافظة معينة
     * GET /api/v1/locations/cities?governorate=Cairo
     */
    @GetMapping("/locations/cities")
    public ResponseEntity<?> getCities(@RequestParam String governorate) {
        try {
            log.info("📍 Fetching cities for governorate: {}", governorate);
            
            List<String> cities = searchService.getCitiesByGovernorate(governorate);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", cities
            ));
            
        } catch (Exception e) {
            log.error("❌ Error fetching cities", e);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of()  // Return empty list on error
            ));
        }
    }
    
    /**
     * عد العقارات في موقع معين
     * GET /api/v1/locations/count?governorate=Cairo&city=Nasr City
     */
    @GetMapping("/locations/count")
    public ResponseEntity<?> countProperties(
            @RequestParam String governorate,
            @RequestParam String city) {
        try {
            log.info("📊 Counting properties in {}, {}", city, governorate);
            
            Long count = searchService.countPropertiesByLocation(governorate, city);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "governorate", governorate,
                    "city", city,
                    "count", count
                )
            ));
            
        } catch (Exception e) {
            log.error("❌ Error counting properties", e);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("count", 0)
            ));
        }
    }
}