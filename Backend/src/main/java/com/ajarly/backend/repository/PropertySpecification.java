package com.ajarly.backend.repository;

import com.ajarly.backend.dto.SearchRequest;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.Property.PropertyStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Property Specification - بناء شروط البحث الديناميكية
 * 
 * الفكرة: بدلاً من كتابة query ثابت، نبني الـ query حسب الفلاتر المُدخلة
 * 
 * مثال: لو المستخدم دخل فقط (city = القاهرة، bedrooms = 2)
 *       نبني query يحتوي على هذين الشرطين فقط، ونتجاهل باقي الفلاتر
 */
public class PropertySpecification {
    
    /**
     * بناء Specification من SearchRequest
     * هذه الدالة تأخذ كل الفلاتر وتبني query ديناميكي
     * 
     * @param searchRequest الفلاتر المدخلة من المستخدم
     * @return Specification جاهز للاستخدام مع Repository
     */
    public static Specification<Property> buildSearchSpecification(SearchRequest searchRequest) {
        
        return (root, query, criteriaBuilder) -> {
            // قائمة الشروط - سنضيف كل شرط حسب الفلتر
            List<Predicate> predicates = new ArrayList<>();
            
            // ========== شرط إلزامي: فقط العقارات النشطة ==========
            predicates.add(criteriaBuilder.equal(root.get("status"), PropertyStatus.active));
            
            // ========== فلتر المحافظة ==========
            if (searchRequest.getGovernorate() != null && !searchRequest.getGovernorate().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("governorate")),
                    searchRequest.getGovernorate().toLowerCase()
                ));
            }
            
            // ========== فلتر المدينة ==========
            if (searchRequest.getCity() != null && !searchRequest.getCity().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("city")),
                    searchRequest.getCity().toLowerCase()
                ));
            }
            
            // ========== فلتر الحي ==========
            if (searchRequest.getNeighborhood() != null && !searchRequest.getNeighborhood().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("neighborhood")),
                    "%" + searchRequest.getNeighborhood().toLowerCase() + "%"
                ));
            }
            
            // ========== فلتر نوع العقار ==========
            if (searchRequest.getPropertyType() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("propertyType"),
                    searchRequest.getPropertyType()
                ));
            }
            
            // ========== فلتر نوع الإيجار ==========
            if (searchRequest.getRentalType() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("rentalType"),
                    searchRequest.getRentalType()
                ));
            }
            
            // ========== فلتر السعر (الحد الأدنى) ==========
            if (searchRequest.getMinPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("pricePerNight"),
                    searchRequest.getMinPrice()
                ));
            }
            
            // ========== فلتر السعر (الحد الأقصى) ==========
            if (searchRequest.getMaxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("pricePerNight"),
                    searchRequest.getMaxPrice()
                ));
            }
            
            // ========== فلتر الغرف (الحد الأدنى) ==========
            if (searchRequest.getMinBedrooms() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("bedrooms"),
                    searchRequest.getMinBedrooms()
                ));
            }
            
            // ========== فلتر الغرف (الحد الأقصى) ==========
            if (searchRequest.getMaxBedrooms() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("bedrooms"),
                    searchRequest.getMaxBedrooms()
                ));
            }
            
            // ========== فلتر الحمامات (الحد الأدنى) ==========
            if (searchRequest.getMinBathrooms() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("bathrooms"),
                    searchRequest.getMinBathrooms()
                ));
            }
            
            // ========== فلتر الحمامات (الحد الأقصى) ==========
            if (searchRequest.getMaxBathrooms() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("bathrooms"),
                    searchRequest.getMaxBathrooms()
                ));
            }
            
            // ========== فلتر عدد الضيوف (الحد الأدنى) ==========
            if (searchRequest.getMinGuests() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("guestsCapacity"),
                    searchRequest.getMinGuests()
                ));
            }
            
            // ========== فلتر عدد الضيوف (الحد الأقصى) ==========
            if (searchRequest.getMaxGuests() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("guestsCapacity"),
                    searchRequest.getMaxGuests()
                ));
            }
            
            // ========== فلتر: مفروش؟ ==========
            if (searchRequest.getFurnished() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("furnished"),
                    searchRequest.getFurnished()
                ));
            }
            
            // ========== فلتر: يسمح بالحيوانات؟ ==========
            if (searchRequest.getPetsAllowed() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("petsAllowed"),
                    searchRequest.getPetsAllowed()
                ));
            }
            
            // ========== فلتر: يسمح بالتدخين؟ ==========
            if (searchRequest.getSmokingAllowed() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("smokingAllowed"),
                    searchRequest.getSmokingAllowed()
                ));
            }
            
            // ========== فلتر: حجز فوري؟ ==========
            if (searchRequest.getInstantBooking() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("instantBooking"),
                    searchRequest.getInstantBooking()
                ));
            }
            
            // ========== فلتر: موثق؟ ==========
            if (searchRequest.getIsVerified() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("isVerified"),
                    searchRequest.getIsVerified()
                ));
            }
            
            // ========== فلتر: مميز؟ ==========
            if (searchRequest.getIsFeatured() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("isFeatured"),
                    searchRequest.getIsFeatured()
                ));
            }
            
            // ========== دمج كل الشروط بـ AND ==========
            // يعني: يجب تحقق كل الشروط معاً
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    /**
     * عد الفلاتر المُطبّقة (للإحصائيات)
     * 
     * @param searchRequest الفلاتر المدخلة
     * @return عدد الفلاتر التي ليست null
     */
    public static int countAppliedFilters(SearchRequest searchRequest) {
        int count = 0;
        
        if (searchRequest.getGovernorate() != null && !searchRequest.getGovernorate().isEmpty()) count++;
        if (searchRequest.getCity() != null && !searchRequest.getCity().isEmpty()) count++;
        if (searchRequest.getNeighborhood() != null && !searchRequest.getNeighborhood().isEmpty()) count++;
        if (searchRequest.getPropertyType() != null) count++;
        if (searchRequest.getRentalType() != null) count++;
        if (searchRequest.getMinPrice() != null) count++;
        if (searchRequest.getMaxPrice() != null) count++;
        if (searchRequest.getMinBedrooms() != null) count++;
        if (searchRequest.getMaxBedrooms() != null) count++;
        if (searchRequest.getMinBathrooms() != null) count++;
        if (searchRequest.getMaxBathrooms() != null) count++;
        if (searchRequest.getMinGuests() != null) count++;
        if (searchRequest.getMaxGuests() != null) count++;
        if (searchRequest.getFurnished() != null) count++;
        if (searchRequest.getPetsAllowed() != null) count++;
        if (searchRequest.getSmokingAllowed() != null) count++;
        if (searchRequest.getInstantBooking() != null) count++;
        if (searchRequest.getIsVerified() != null) count++;
        if (searchRequest.getIsFeatured() != null) count++;
        
        return count;
    }
}
