package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * DTO للمواقع الشعبية (المدن الأكثر طلباً)
 * يحتوي على إحصائيات عن كل مدينة
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopularLocationResponse {
    
    private String governorate;           // اسم المحافظة
    private String governorateAr;         // اسم المحافظة بالعربية
    private String city;                  // اسم المدينة
    private String cityAr;                // اسم المدينة بالعربية
    private Long propertyCount;           // عدد العقارات المتاحة
    private BigDecimal averagePrice;      // متوسط السعر في هذه المدينة
    private BigDecimal minPrice;          // أقل سعر
    private BigDecimal maxPrice;          // أعلى سعر
    private String coverImageUrl;         // صورة تمثيلية للمدينة (من أحد العقارات)
    private Integer totalViews;           // إجمالي المشاهدات للعقارات في هذه المدينة
    
    /**
     * Constructor يطابق الـ Query في PropertyRepository
     * يأخذ: String, String, Long, Double (من AVG), BigDecimal, BigDecimal
     * 
     * لاحظ: AVG() في SQL ترجع Double وليس BigDecimal
     */
    public PopularLocationResponse(
            String governorate,
            String city,
            Long propertyCount,
            Double averagePrice,          // Double من AVG()
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        this.governorate = governorate;
        this.city = city;
        this.propertyCount = propertyCount;
        // تحويل Double إلى BigDecimal بشكل صحيح مع تقريب لخانتين عشريتين
        this.averagePrice = averagePrice != null 
            ? BigDecimal.valueOf(averagePrice).setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }
}