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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Search Controller - إدارة طلبات البحث المتقدم
 * 
 * Endpoints:
 * 1. POST /api/v1/search - البحث المتقدم
 * 2. GET /api/v1/search/suggestions - اقتراحات المدن
 * 3. GET /api/v1/locations/popular - المواقع الشعبية
 * 4. GET /api/v1/locations/governorates - قائمة المحافظات
 * 5. GET /api/v1/locations/cities - قائمة المدن
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SearchController {
    
    private final SearchService searchService;
    
    /**
     * البحث المتقدم عن العقارات
     * 
     * POST /api/v1/search
     * 
     * Body:
     * {
     *   "governorate": "القاهرة",
     *   "city": "المعادي",
     *   "propertyType": "apartment",
     *   "rentalType": "vacation",
     *   "minPrice": 500,
     *   "maxPrice": 5000,
     *   "minBedrooms": 1,
     *   "maxBedrooms": 3,
     *   "furnished": true,
     *   "petsAllowed": false,
     *   "sortBy": "price",
     *   "sortDirection": "ASC",
     *   "page": 0,
     *   "size": 10
     * }
     * 
     * @param searchRequest معايير البحث
     * @return نتائج البحث مع Pagination والإحصائيات
     */
    @PostMapping("/search")
    public ResponseEntity<?> advancedSearch(@RequestBody SearchRequest searchRequest) {
        try {
            log.info("Advanced search request: {}", searchRequest);
            
            // ========== التحقق من الصحة ==========
            if (searchRequest.getPage() == null) {
                searchRequest.setPage(0);
            }
            if (searchRequest.getSize() == null) {
                searchRequest.setSize(10);
            }
            if (searchRequest.getSize() > 100) {
                searchRequest.setSize(100);  // حد أقصى
            }
            
            // ========== تنفيذ البحث ==========
            SearchResponse searchResponse = searchService.advancedSearch(searchRequest);
            
            log.info("Search completed with {} results", searchResponse.getProperties().size());
            
            // ========== الرد ==========
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Search completed successfully");
            response.put("data", searchResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            // خطأ في التحقق من الصحة
            log.warn("Invalid search request: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", "INVALID_REQUEST");
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            // خطأ عام
            log.error("Error during search", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred during search");
            errorResponse.put("error", "INTERNAL_SERVER_ERROR");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * الحصول على اقتراحات المدن (Autocomplete)
     * 
     * GET /api/v1/search/suggestions?query=قا
     * 
     * @param query النص المدخل من المستخدم
     * @return قائمة الاقتراحات
     */
    @GetMapping("/search/suggestions")
    public ResponseEntity<?> getSearchSuggestions(@RequestParam String query) {
        try {
            log.info("Getting suggestions for query: {}", query);
            
            // ========== الحصول على الاقتراحات ==========
            List<LocationSuggestion> suggestions = searchService.getSearchSuggestions(query);
            
            log.info("Found {} suggestions", suggestions.size());
            
            // ========== الرد ==========
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", suggestions);
            response.put("count", suggestions.size());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid suggestion request: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", "INVALID_REQUEST");
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error getting suggestions", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while getting suggestions");
            errorResponse.put("error", "INTERNAL_SERVER_ERROR");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * الحصول على المواقع الشعبية
     * 
     * GET /api/v1/locations/popular?limit=10
     * 
     * @param limit عدد المواقع المطلوبة (اختياري، افتراضي 10)
     * @return قائمة المواقع الشعبية مع الإحصائيات
     */
    @GetMapping("/locations/popular")
    public ResponseEntity<?> getPopularLocations(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        try {
            log.info("Getting popular locations with limit: {}", limit);
            
            // ========== الحصول على المواقع الشعبية ==========
            List<PopularLocationResponse> popularLocations = searchService.getPopularLocations(limit);
            
            log.info("Found {} popular locations", popularLocations.size());
            
            // ========== الرد ==========
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", popularLocations);
            response.put("count", popularLocations.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting popular locations", e);
            e.printStackTrace();  // طباعة الخطأ كاملاً
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while getting popular locations");
            errorResponse.put("error", "INTERNAL_SERVER_ERROR");
            errorResponse.put("details", e.getMessage());  // إضافة تفاصيل الخطأ للتطوير
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * الحصول على قائمة المحافظات المتاحة
     * 
     * GET /api/v1/locations/governorates
     * 
     * @return قائمة المحافظات
     */
    @GetMapping("/locations/governorates")
    public ResponseEntity<?> getAvailableGovernorates() {
        try {
            log.info("Fetching available governorates");
            
            // ========== الحصول على المحافظات ==========
            List<String> governorates = searchService.getAvailableGovernorates();
            
            log.info("Found {} governorates", governorates.size());
            
            // ========== الرد ==========
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", governorates);
            response.put("count", governorates.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching governorates", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while fetching governorates");
            errorResponse.put("error", "INTERNAL_SERVER_ERROR");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * الحصول على قائمة المدن في محافظة معينة
     * 
     * GET /api/v1/locations/cities?governorate=القاهرة
     * 
     * @param governorate اسم المحافظة
     * @return قائمة المدن
     */
    @GetMapping("/locations/cities")
    public ResponseEntity<?> getCitiesByGovernorate(
            @RequestParam String governorate) {
        try {
            log.info("Fetching cities for governorate: {}", governorate);
            
            // ========== الحصول على المدن ==========
            List<String> cities = searchService.getCitiesByGovernorate(governorate);
            
            log.info("Found {} cities in {}", cities.size(), governorate);
            
            // ========== الرد ==========
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", cities);
            response.put("governorate", governorate);
            response.put("count", cities.size());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", "INVALID_REQUEST");
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error fetching cities", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while fetching cities");
            errorResponse.put("error", "INTERNAL_SERVER_ERROR");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}