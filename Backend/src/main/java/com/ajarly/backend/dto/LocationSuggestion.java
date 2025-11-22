package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO لاقتراحات المواقع (Autocomplete)
 * يستخدم في اقتراح المدن والمحافظات أثناء الكتابة
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationSuggestion {
    
    private String governorate;      // اسم المحافظة
    private String governorateAr;    // اسم المحافظة بالعربية
    private String city;             // اسم المدينة
    private String cityAr;           // اسم المدينة بالعربية
    private Long propertyCount;      // عدد العقارات في هذا الموقع
    private String displayText;      // النص المعروض (مثلاً: "القاهرة - المعادي")
    
    /**
     * Constructor لإنشاء suggestion من query result
     * يستخدم عندما نأخذ البيانات مباشرة من قاعدة البيانات
     */
    public LocationSuggestion(String governorate, String city, Long propertyCount) {
        this.governorate = governorate;
        this.city = city;
        this.propertyCount = propertyCount;
        
        // إنشاء النص المعروض
        if (city != null && !city.isEmpty()) {
            this.displayText = governorate + " - " + city;
        } else {
            this.displayText = governorate;
        }
    }
}
