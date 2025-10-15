package com.ajarly.backend.repository;

import com.ajarly.backend.dto.LocationSuggestion;
import com.ajarly.backend.dto.PopularLocationResponse;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.Property.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository للعقارات - يدعم البحث المتقدم والاستعلامات الديناميكية
 * 
 * ملاحظة: تم إضافة JpaSpecificationExecutor للبحث المتقدم (Feature 8)
 */
@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, 
                                            JpaSpecificationExecutor<Property> {
    
    // ========== الاستعلامات الموجودة مسبقاً ==========
    
    // Find by owner
    Page<Property> findByOwner_UserId(Long ownerId, Pageable pageable);
    
    // Check if slug exists
    boolean existsBySlug(String slug);
    
    // Search properties with filters (الطريقة القديمة - ستبقى للتوافق)
    @Query("SELECT p FROM Property p WHERE " +
           "p.status = :status " +
           "AND (:governorate IS NULL OR p.governorate = :governorate) " +
           "AND (:city IS NULL OR p.city = :city) " +
           "AND (:propertyType IS NULL OR p.propertyType = :propertyType) " +
           "AND (:minPrice IS NULL OR p.pricePerNight >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice) " +
           "AND (:bedrooms IS NULL OR p.bedrooms >= :bedrooms)")
    Page<Property> searchProperties(
        @Param("status") PropertyStatus status,
        @Param("governorate") String governorate,
        @Param("city") String city,
        @Param("propertyType") Property.PropertyType propertyType,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("bedrooms") Integer bedrooms,
        Pageable pageable
    );
    
    // ========== استعلامات جديدة للـ Feature 8 ==========
    
    /**
     * الحصول على اقتراحات المدن (Autocomplete)
     * يبحث في المحافظات والمدن بناءً على النص المدخل
     * 
     * @param query النص المدخل من المستخدم
     * @param status حالة العقار (عادة active)
     * @return قائمة الاقتراحات مع عدد العقارات
     */
    @Query("SELECT new com.ajarly.backend.dto.LocationSuggestion(" +
           "p.governorate, p.city, COUNT(p)) " +
           "FROM Property p " +
           "WHERE p.status = :status " +
           "AND (LOWER(p.governorate) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "GROUP BY p.governorate, p.city " +
           "ORDER BY COUNT(p) DESC")
    List<LocationSuggestion> findLocationSuggestions(
        @Param("query") String query,
        @Param("status") PropertyStatus status
    );
    
    /**
     * الحصول على المواقع الشعبية (الأكثر عقارات)
     * يعرض أشهر المدن مع إحصائيات السعر
     * 
     * @param status حالة العقار (عادة active)
     * @param limit عدد المواقع المطلوبة
     * @return قائمة المواقع الشعبية مع الإحصائيات
     */
    @Query("SELECT new com.ajarly.backend.dto.PopularLocationResponse(" +
           "p.governorate, " +
           "p.city, " +
           "COUNT(p), " +
           "AVG(p.pricePerNight), " +
           "MIN(p.pricePerNight), " +
           "MAX(p.pricePerNight)) " +
           "FROM Property p " +
           "WHERE p.status = :status " +
           "AND p.pricePerNight IS NOT NULL " +
           "GROUP BY p.governorate, p.city " +
           "ORDER BY COUNT(p) DESC")
    List<PopularLocationResponse> findPopularLocations(
        @Param("status") PropertyStatus status,
        Pageable pageable
    );
    
    /**
     * الحصول على جميع المحافظات المتاحة (للفلاتر)
     * 
     * @param status حالة العقار
     * @return قائمة المحافظات (بدون تكرار)
     */
    @Query("SELECT DISTINCT p.governorate FROM Property p " +
           "WHERE p.status = :status " +
           "ORDER BY p.governorate")
    List<String> findDistinctGovernoratesByStatus(@Param("status") PropertyStatus status);
    
    /**
     * الحصول على المدن المتاحة في محافظة معينة
     * 
     * @param governorate اسم المحافظة
     * @param status حالة العقار
     * @return قائمة المدن
     */
    @Query("SELECT DISTINCT p.city FROM Property p " +
           "WHERE p.governorate = :governorate " +
           "AND p.status = :status " +
           "ORDER BY p.city")
    List<String> findDistinctCitiesByGovernorateAndStatus(
        @Param("governorate") String governorate,
        @Param("status") PropertyStatus status
    );
    
    /**
     * عد العقارات المتاحة في موقع معين
     * (مفيد للإحصائيات)
     * 
     * @param governorate المحافظة
     * @param city المدينة
     * @param status حالة العقار
     * @return عدد العقارات
     */
    @Query("SELECT COUNT(p) FROM Property p " +
           "WHERE p.governorate = :governorate " +
           "AND p.city = :city " +
           "AND p.status = :status")
    Long countByLocation(
        @Param("governorate") String governorate,
        @Param("city") String city,
        @Param("status") PropertyStatus status
    );
}