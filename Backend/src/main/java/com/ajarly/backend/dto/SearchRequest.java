package com.ajarly.backend.dto;

import com.ajarly.backend.model.Property;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO لاستقبال معايير البحث المتقدم عن العقارات
 * يحتوي على جميع الفلاتر الممكنة للبحث
 */
@Data
public class SearchRequest {
    
    // ========== فلاتر الموقع ==========
    private String governorate;      // المحافظة (اختياري)
    private String city;             // المدينة (اختياري)
    private String neighborhood;     // الحي (اختياري)
    
    // ========== فلاتر نوع العقار ==========
    private Property.PropertyType propertyType;  // نوع العقار (apartment, villa, etc.)
    private Property.RentalType rentalType;      // نوع الإيجار (vacation, long_term, both)
    
    // ========== فلاتر السعر ==========
    private BigDecimal minPrice;     // أقل سعر (اختياري)
    private BigDecimal maxPrice;     // أعلى سعر (اختياري)
    
    // ========== فلاتر المواصفات ==========
    private Integer minBedrooms;     // الحد الأدنى لعدد الغرف
    private Integer maxBedrooms;     // الحد الأقصى لعدد الغرف
    private Integer minBathrooms;    // الحد الأدنى لعدد الحمامات
    private Integer maxBathrooms;    // الحد الأقصى لعدد الحمامات
    private Integer minGuests;       // الحد الأدنى لعدد الضيوف
    private Integer maxGuests;       // الحد الأقصى لعدد الضيوف
    
    // ========== فلاتر إضافية ==========
    private Boolean furnished;       // مفروش أم لا (null = الكل)
    private Boolean petsAllowed;     // يسمح بالحيوانات الأليفة
    private Boolean smokingAllowed;  // يسمح بالتدخين
    private Boolean instantBooking;  // حجز فوري
    private Boolean isVerified;      // عقار موثق
    private Boolean isFeatured;      // عقار مميز
    
    // ========== فلاتر التواريخ (للمستقبل) ==========
    private LocalDate checkIn;       // تاريخ الدخول (اختياري)
    private LocalDate checkOut;      // تاريخ الخروج (اختياري)
    
    // ========== خيارات الترتيب ==========
    private String sortBy;           // الترتيب حسب (price, rating, newest, views)
    private String sortDirection;    // اتجاه الترتيب (ASC أو DESC)
    
    // ========== Pagination ==========
    private Integer page = 0;        // رقم الصفحة (افتراضي 0)
    private Integer size = 10;       // عدد النتائج في الصفحة (افتراضي 10)
    
    /**
     * تحقق من صحة نطاق السعر
     * @return true إذا كان النطاق صحيح
     */
    public boolean isPriceRangeValid() {
        if (minPrice != null && maxPrice != null) {
            return minPrice.compareTo(maxPrice) <= 0;
        }
        return true;
    }
    
    /**
     * تحقق من صحة نطاق الغرف
     * @return true إذا كان النطاق صحيح
     */
    public boolean isBedroomsRangeValid() {
        if (minBedrooms != null && maxBedrooms != null) {
            return minBedrooms <= maxBedrooms;
        }
        return true;
    }
    
    /**
     * تحقق من صحة التواريخ
     * @return true إذا كانت التواريخ صحيحة
     */
    public boolean isDateRangeValid() {
        if (checkIn != null && checkOut != null) {
            return checkIn.isBefore(checkOut);
        }
        return true;
    }
}
