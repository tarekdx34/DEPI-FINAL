package com.ajarly.backend.service;

import com.ajarly.backend.dto.*;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.PropertySpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service للبحث المتقدم عن العقارات (Feature 8)
 * 
 * يوفر:
 * 1. البحث المتقدم مع فلاتر ديناميكية
 * 2. اقتراحات المدن (Autocomplete)
 * 3. المواقع الشعبية
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {
    
    private final PropertyRepository propertyRepository;
    
    /**
     * البحث المتقدم عن العقارات
     * 
     * يبني query ديناميكي بناءً على الفلاتر المدخلة
     * 
     * @param searchRequest الفلاتر والخيارات
     * @return نتائج البحث مع معلومات Pagination
     */
    public SearchResponse advancedSearch(SearchRequest searchRequest) {
        long startTime = System.currentTimeMillis();
        
        // ========== التحقق من صحة البيانات ==========
        if (!searchRequest.isPriceRangeValid()) {
            throw new IllegalArgumentException("Price range is invalid: minPrice must be <= maxPrice");
        }
        
        if (!searchRequest.isBedroomsRangeValid()) {
            throw new IllegalArgumentException("Bedrooms range is invalid: minBedrooms must be <= maxBedrooms");
        }
        
        if (!searchRequest.isDateRangeValid()) {
            throw new IllegalArgumentException("Date range is invalid: checkIn must be before checkOut");
        }
        
        // ========== بناء Sort (الترتيب) ==========
        Sort sort = buildSort(searchRequest.getSortBy(), searchRequest.getSortDirection());
        
        // ========== بناء Pageable ==========
        Pageable pageable = PageRequest.of(
            searchRequest.getPage(),
            searchRequest.getSize(),
            sort
        );
        
        // ========== بناء Specification (الشروط) ==========
        var specification = PropertySpecification.buildSearchSpecification(searchRequest);
        
        // ========== تنفيذ البحث ==========
        log.info("Executing advanced search with filters: {}", searchRequest);
        Page<Property> propertyPage = propertyRepository.findAll(specification, pageable);
        
        // ========== تحويل النتائج إلى DTOs ==========
        Page<PropertyDto.ListResponse> responsePage = propertyPage.map(this::mapToListResponse);
        
        // ========== حساب وقت التنفيذ ==========
        long executionTimeMs = System.currentTimeMillis() - startTime;
        
        // ========== عد الفلاتر المطبقة ==========
        int appliedFiltersCount = PropertySpecification.countAppliedFilters(searchRequest);
        
        log.info("Search completed in {} ms with {} results", executionTimeMs, responsePage.getTotalElements());
        
        // ========== بناء Response ==========
        return SearchResponse.fromPage(
            responsePage,
            executionTimeMs,
            appliedFiltersCount,
            searchRequest.getSortBy() != null ? searchRequest.getSortBy() : "newest",
            searchRequest.getSortDirection() != null ? searchRequest.getSortDirection() : "DESC"
        );
    }
    
    /**
     * الحصول على اقتراحات المدن (Autocomplete)
     * 
     * يبحث عن مدن ومحافظات مطابقة للنص المدخل
     * يرجع المدن مع عدد العقارات في كل واحدة
     * 
     * @param query النص المدخل من المستخدم
     * @return قائمة الاقتراحات
     */
    public List<LocationSuggestion> getSearchSuggestions(String query) {
        // ========== التحقق من صحة النص ==========
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Search query cannot be empty");
        }
        
        if (query.length() < 2) {
            throw new IllegalArgumentException("Search query must be at least 2 characters");
        }
        
        // ========== تنظيف النص ==========
        String cleanQuery = query.trim();
        
        log.info("Getting location suggestions for query: {}", cleanQuery);
        
        // ========== الحصول على الاقتراحات ==========
        List<LocationSuggestion> suggestions = propertyRepository.findLocationSuggestions(
            cleanQuery,
            Property.PropertyStatus.active
        );
        
        log.info("Found {} location suggestions", suggestions.size());
        
        return suggestions;
    }
    
    /**
     * الحصول على المواقع الشعبية
     * 
     * يعيد أشهر المدن/المحافظات مع إحصائيات:
     * - عدد العقارات
     * - متوسط السعر
     * - أقل وأعلى سعر
     * 
     * @param limit عدد المواقع المطلوبة (افتراضي 10)
     * @return قائمة المواقع الشعبية
     */
    public List<PopularLocationResponse> getPopularLocations(Integer limit) {
        // ========== التحقق من قيمة limit ==========
        if (limit == null || limit <= 0) {
            limit = 10;  // الافتراضي
        }
        
        if (limit > 100) {
            limit = 100;  // الحد الأقصى
        }
        
        log.info("Getting top {} popular locations", limit);
        
        // ========== بناء Pageable للحد من النتائج ==========
        Pageable pageable = PageRequest.of(0, limit);
        
        // ========== الحصول على المواقع الشعبية ==========
        List<PopularLocationResponse> popularLocations = propertyRepository.findPopularLocations(
            Property.PropertyStatus.active,
            pageable
        );
        
        log.info("Found {} popular locations", popularLocations.size());
        
        return popularLocations;
    }
    
    /**
     * الحصول على قائمة المحافظات المتاحة
     * 
     * مفيد لـ dropdowns في الـ frontend
     * 
     * @return قائمة أسماء المحافظات
     */
    public List<String> getAvailableGovernorates() {
        log.info("Fetching available governorates");
        return propertyRepository.findDistinctGovernoratesByStatus(Property.PropertyStatus.active);
    }
    
    /**
     * الحصول على قائمة المدن في محافظة معينة
     * 
     * @param governorate اسم المحافظة
     * @return قائمة أسماء المدن
     */
    public List<String> getCitiesByGovernorate(String governorate) {
        if (governorate == null || governorate.isEmpty()) {
            throw new IllegalArgumentException("Governorate name cannot be empty");
        }
        
        log.info("Fetching cities for governorate: {}", governorate);
        return propertyRepository.findDistinctCitiesByGovernorateAndStatus(
            governorate,
            Property.PropertyStatus.active
        );
    }
    
    /**
     * عد العقارات في موقع معين
     * 
     * @param governorate المحافظة
     * @param city المدينة
     * @return عدد العقارات
     */
    public Long countPropertiesByLocation(String governorate, String city) {
        if (governorate == null || governorate.isEmpty()) {
            throw new IllegalArgumentException("Governorate name cannot be empty");
        }
        
        if (city == null || city.isEmpty()) {
            throw new IllegalArgumentException("City name cannot be empty");
        }
        
        return propertyRepository.countByLocation(
            governorate,
            city,
            Property.PropertyStatus.active
        );
    }
    
    // ========== دوال مساعدة خاصة ==========
    
    /**
     * بناء Sort object من sortBy و sortDirection
     * 
     * @param sortBy الحقل المطلوب الترتيب حسبه
     * @param sortDirection اتجاه الترتيب (ASC/DESC)
     * @return Sort object
     */
    private Sort buildSort(String sortBy, String sortDirection) {
        String field = sortBy != null && !sortBy.isEmpty() ? sortBy : "createdAt";
        boolean isAscending = "ASC".equalsIgnoreCase(sortDirection);
        
        // معالجة الحقول الخاصة
        return switch (field.toLowerCase()) {
            case "price" -> isAscending 
                ? Sort.by("pricePerNight").ascending()
                : Sort.by("pricePerNight").descending();
                
            case "rating" -> isAscending
                ? Sort.by("averageRating").ascending()
                : Sort.by("averageRating").descending();
                
            case "views", "mostviewed" -> isAscending
                ? Sort.by("viewCount").ascending()
                : Sort.by("viewCount").descending();
                
            case "newest", "created" -> isAscending
                ? Sort.by("createdAt").ascending()
                : Sort.by("createdAt").descending();
                
            default -> Sort.by("createdAt").descending();
        };
    }
    
    /**
     * تحويل Property إلى ListResponse DTO
     * 
     * @param property العقار
     * @return DTO للقائمة
     */
    private PropertyDto.ListResponse mapToListResponse(Property property) {
        PropertyDto.ListResponse response = new PropertyDto.ListResponse();
        response.setPropertyId(property.getPropertyId());
        response.setTitleAr(property.getTitleAr());
        response.setSlug(property.getSlug());
        response.setPropertyType(property.getPropertyType());
        response.setGovernorate(property.getGovernorate());
        response.setCity(property.getCity());
        response.setBedrooms(property.getBedrooms());
        response.setBathrooms(property.getBathrooms());
        response.setPricePerNight(property.getPricePerNight());
        response.setCurrency(property.getCurrency());
        response.setAverageRating(property.getAverageRating());
        response.setTotalReviews(property.getTotalReviews());
        response.setIsFeatured(property.getIsFeatured());
        return response;
    }
}
