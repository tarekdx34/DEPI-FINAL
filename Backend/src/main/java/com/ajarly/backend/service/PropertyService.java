package com.ajarly.backend.service;

import com.ajarly.backend.dto.PropertyDto;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.Property.PropertyStatus;
import com.ajarly.backend.model.PropertyImage;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyService {
    
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public PropertyDto.Response createProperty(PropertyDto.CreateRequest request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Property property = new Property();
        property.setOwner(owner);
        property.setTitleAr(request.getTitleAr());
        property.setTitleEn(request.getTitleEn());
        property.setDescriptionAr(request.getDescriptionAr());
        property.setDescriptionEn(request.getDescriptionEn());
        property.setSlug(generateSlug(request.getTitleAr()));
        property.setPropertyType(request.getPropertyType());
        property.setRentalType(request.getRentalType());
        property.setGovernorate(request.getGovernorate());
        property.setCity(request.getCity());
        property.setNeighborhood(request.getNeighborhood());
        property.setStreetAddress(request.getStreetAddress());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setGuestsCapacity(request.getGuestsCapacity());
        property.setAreaSqm(request.getAreaSqm());
        property.setFloorNumber(request.getFloorNumber());
        property.setTotalFloors(request.getTotalFloors());
        property.setFurnished(request.getFurnished());
        property.setPetsAllowed(request.getPetsAllowed());
        property.setSmokingAllowed(request.getSmokingAllowed());
        property.setPricePerNight(request.getPricePerNight());
        property.setPricePerWeek(request.getPricePerWeek());
        property.setPricePerMonth(request.getPricePerMonth());
        property.setCleaningFee(request.getCleaningFee());
        property.setSecurityDeposit(request.getSecurityDeposit());
        property.setAvailableFrom(request.getAvailableFrom());
        property.setAvailableTo(request.getAvailableTo());
        property.setMinRentalDays(request.getMinRentalDays());
        property.setInstantBooking(request.getInstantBooking());
        property.setStatus(PropertyStatus.pending_approval);
        
        Property saved = propertyRepository.save(property);
        log.info("✅ Property created successfully: {}", saved.getPropertyId());
        
        return mapToResponse(saved);
    }
    
    @Transactional
    public PropertyDto.Response getPropertyById(Long propertyId) {
        // استخدم الـ method الجديدة اللي بتجيب الصور
        Property property = propertyRepository.findByIdWithImages(propertyId);
        
        if (property == null) {
            throw new RuntimeException("Property not found");
        }
        
        // Increment view count
        property.setViewCount(property.getViewCount() + 1);
        propertyRepository.save(property);
        
        return mapToResponse(property);
    }
    
    public Page<PropertyDto.ListResponse> searchProperties(
            String governorate,
            String city,
            Property.PropertyType propertyType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer bedrooms,
            Pageable pageable) {
        
        log.info("🔍 Searching properties: gov={}, city={}, type={}, beds={}", governorate, city, propertyType, bedrooms);
        
        // استخدم الـ query الجديدة اللي بتجيب الصور
        Page<Property> properties = propertyRepository.searchPropertiesWithImages(
            PropertyStatus.active,
            governorate,
            city,
            propertyType,
            minPrice,
            maxPrice,
            bedrooms,
            pageable
        );
        
        log.info("✅ Found {} properties", properties.getTotalElements());
        
        return properties.map(this::mapToListResponse);
    }
    
    public Page<PropertyDto.ListResponse> getMyProperties(Long ownerId, Pageable pageable) {
        log.info("📋 Fetching properties for owner: {}", ownerId);
        
        Page<Property> properties = propertyRepository.findByOwner_UserId(ownerId, pageable);
        
        log.info("✅ Found {} properties for owner {}", properties.getTotalElements(), ownerId);
        
        return properties.map(this::mapToListResponse);
    }
    
    @Transactional
    public PropertyDto.Response updateProperty(Long propertyId, PropertyDto.CreateRequest request, Long ownerId) {
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        if (!property.getOwner().getUserId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Update fields
        property.setTitleAr(request.getTitleAr());
        property.setTitleEn(request.getTitleEn());
        property.setDescriptionAr(request.getDescriptionAr());
        property.setDescriptionEn(request.getDescriptionEn());
        property.setPropertyType(request.getPropertyType());
        property.setRentalType(request.getRentalType());
        property.setGovernorate(request.getGovernorate());
        property.setCity(request.getCity());
        property.setNeighborhood(request.getNeighborhood());
        property.setStreetAddress(request.getStreetAddress());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setGuestsCapacity(request.getGuestsCapacity());
        property.setAreaSqm(request.getAreaSqm());
        property.setFloorNumber(request.getFloorNumber());
        property.setTotalFloors(request.getTotalFloors());
        property.setFurnished(request.getFurnished());
        property.setPetsAllowed(request.getPetsAllowed());
        property.setSmokingAllowed(request.getSmokingAllowed());
        property.setPricePerNight(request.getPricePerNight());
        property.setPricePerWeek(request.getPricePerWeek());
        property.setPricePerMonth(request.getPricePerMonth());
        property.setCleaningFee(request.getCleaningFee());
        property.setSecurityDeposit(request.getSecurityDeposit());
        property.setAvailableFrom(request.getAvailableFrom());
        property.setAvailableTo(request.getAvailableTo());
        property.setMinRentalDays(request.getMinRentalDays());
        property.setInstantBooking(request.getInstantBooking());
        
        Property updated = propertyRepository.save(property);
        log.info("✅ Property updated successfully: {}", propertyId);
        
        return mapToResponse(updated);
    }
    
    @Transactional
    public void deleteProperty(Long propertyId, Long ownerId) {
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        if (!property.getOwner().getUserId().equals(ownerId)) {
           throw new RuntimeException("Unauthorized");
        }
        
        property.setStatus(PropertyStatus.deleted);
        propertyRepository.save(property);
        
        log.info("✅ Property deleted successfully: {}", propertyId);
    }
    
    private String generateSlug(String title) {
        String slug = title.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-");
        
        if (propertyRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }
        
        return slug;
    }
    
    private PropertyDto.Response mapToResponse(Property property) {
        PropertyDto.Response response = new PropertyDto.Response();
        response.setPropertyId(property.getPropertyId());
        response.setTitleAr(property.getTitleAr());
        response.setTitleEn(property.getTitleEn());
        response.setDescriptionAr(property.getDescriptionAr());
        response.setDescriptionEn(property.getDescriptionEn());
        response.setSlug(property.getSlug());
        response.setPropertyType(property.getPropertyType());
        response.setRentalType(property.getRentalType());
        response.setGovernorate(property.getGovernorate());
        response.setCity(property.getCity());
        response.setNeighborhood(property.getNeighborhood());
        response.setBedrooms(property.getBedrooms());
        response.setBathrooms(property.getBathrooms());
        response.setGuestsCapacity(property.getGuestsCapacity());
        response.setAreaSqm(property.getAreaSqm());
        response.setFurnished(property.getFurnished());
        response.setPricePerNight(property.getPricePerNight());
        response.setPricePerMonth(property.getPricePerMonth());
        response.setCurrency(property.getCurrency());
        response.setStatus(property.getStatus());
        response.setIsVerified(property.getIsVerified());
        response.setViewCount(property.getViewCount());
        response.setAverageRating(property.getAverageRating());
        response.setTotalReviews(property.getTotalReviews());
        response.setIsFeatured(property.getIsFeatured());
        response.setCreatedAt(property.getCreatedAt());
        response.setUpdatedAt(property.getUpdatedAt());
        
        // Owner info
        PropertyDto.Response.OwnerInfo ownerInfo = new PropertyDto.Response.OwnerInfo();
        ownerInfo.setUserId(property.getOwner().getUserId());
        ownerInfo.setName(property.getOwner().getFirstName() + " " + property.getOwner().getLastName());
        ownerInfo.setPhone(property.getOwner().getPhoneNumber());
        ownerInfo.setVerified(property.getOwner().getNationalIdVerified());
        response.setOwner(ownerInfo);
        
        return response;
    }
    
    /**
     * ✅ Map Property to ListResponse with cover image
     */
    private PropertyDto.ListResponse mapToListResponse(Property property) {
        PropertyDto.ListResponse response = new PropertyDto.ListResponse();
        response.setPropertyId(property.getPropertyId());
        response.setTitleAr(property.getTitleAr());
        response.setTitleEn(property.getTitleEn());
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
        
        // ✅ معالجة الصور بشكل آمن
        if (property.getImages() != null && !property.getImages().isEmpty()) {
            // البحث عن الصورة المحددة كغلاف
            PropertyImage coverImage = property.getImages().stream()
                .filter(img -> img.getIsCover() != null && img.getIsCover())
                .findFirst()
                .orElse(property.getImages().get(0)); // لو مافيش cover، خذ أول صورة
            
            response.setCoverImage(coverImage.getImageUrl());
            
            log.debug("🖼️ Cover image set for property {}: {}", 
                     property.getPropertyId(), coverImage.getImageUrl());
        } else {
            log.debug("⚠️ No images found for property {}", property.getPropertyId());
        }
        
        return response;
    }
}