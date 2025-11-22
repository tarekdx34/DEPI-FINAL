package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO للرد على طلبات البحث المتقدم
 * يحتوي على النتائج ومعلومات التصفح (Pagination)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse {
    
    // ========== النتائج ==========
    private List<PropertyDto.ListResponse> properties;  // قائمة العقارات
    
    // ========== معلومات الصفحة ==========
    private PaginationInfo pagination;
    
    // ========== معلومات البحث ==========
    private SearchMetadata metadata;
    
    /**
     * معلومات التصفح (Pagination)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationInfo {
        private Integer currentPage;      // الصفحة الحالية (0-based)
        private Integer totalPages;       // إجمالي عدد الصفحات
        private Long totalItems;          // إجمالي عدد النتائج
        private Integer itemsPerPage;     // عدد النتائج في كل صفحة
        private Boolean hasNext;          // يوجد صفحة تالية؟
        private Boolean hasPrevious;      // يوجد صفحة سابقة؟
    }
    
    /**
     * معلومات إضافية عن البحث
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchMetadata {
        private Long executionTimeMs;     // وقت تنفيذ البحث (بالميلي ثانية)
        private Integer appliedFiltersCount;  // عدد الفلاتر المطبقة
        private String sortedBy;          // الترتيب المطبق
        private String sortDirection;     // اتجاه الترتيب
    }
    
    /**
     * دالة مساعدة لإنشاء Response من Spring Data Page
     */
    public static SearchResponse fromPage(
            org.springframework.data.domain.Page<PropertyDto.ListResponse> page,
            long executionTimeMs,
            int appliedFiltersCount,
            String sortBy,
            String sortDirection) {
        
        SearchResponse response = new SearchResponse();
        
        // تعبئة قائمة العقارات
        response.setProperties(page.getContent());
        
        // تعبئة معلومات الـ Pagination
        PaginationInfo paginationInfo = new PaginationInfo(
            page.getNumber(),
            page.getTotalPages(),
            page.getTotalElements(),
            page.getSize(),
            page.hasNext(),
            page.hasPrevious()
        );
        response.setPagination(paginationInfo);
        
        // تعبئة معلومات البحث
        SearchMetadata metadata = new SearchMetadata(
            executionTimeMs,
            appliedFiltersCount,
            sortBy,
            sortDirection
        );
        response.setMetadata(metadata);
        
        return response;
    }
}
