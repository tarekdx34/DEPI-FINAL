package com.ajarly.backend.service;

import com.ajarly.backend.dto.AdminActionRequest;
import com.ajarly.backend.dto.DashboardStatsResponse;
import com.ajarly.backend.dto.PendingPropertyResponse;
import com.ajarly.backend.dto.RecentActivitySummary;
import com.ajarly.backend.model.AdminLog;
import com.ajarly.backend.model.Booking;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.model.Property.PropertyStatus;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.AdminLogRepository;
import com.ajarly.backend.repository.BookingRepository;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final AdminLogRepository adminLogRepository;
    
    // ============ DASHBOARD STATS ============
    
    public DashboardStatsResponse getDashboardStats() {
        Long totalUsers = userRepository.count();
        Long totalProperties = propertyRepository.count();
        Long totalBookings = bookingRepository.count();
       
        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.completed)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        RecentActivitySummary recentActivity = RecentActivitySummary.builder()
                .recentBookings(bookingRepository.findAll().stream()
                        .filter(b -> b.getRequestedAt().isAfter(LocalDateTime.now().minusDays(7)))
                        .count())
                .recentRegistrations(userRepository.findAll().stream()
                        .filter(u -> u.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7)))
                        .count())
                .recentPropertyListings(propertyRepository.findAll().stream()
                        .filter(p -> p.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7)))
                        .count())
                .generatedAt(LocalDateTime.now())
                .build();
        
        Long pendingApprovalsCount = propertyRepository.countByStatus(
            PropertyStatus.pending_approval
        );
        
        Long activeProperties = propertyRepository.countByStatus(
            PropertyStatus.active
        );
        
        Long bannedUsers = userRepository.findAll().stream()
            .filter(u -> !u.getIsActive())
            .count();
        
        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalProperties(totalProperties)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .pendingApprovalsCount(pendingApprovalsCount)
                .bannedUsersCount(bannedUsers)
                .activeProperties(activeProperties)
                .recentActivity(recentActivity)
                .build();
    }
    
    // ============ PENDING PROPERTIES ============
    
    /**
     * ✅ FIXED: Get pending properties with owners loaded (no lazy loading issues)
     */
    @Transactional(readOnly = true)  // ✅ ADDED: Ensures session stays open
    public Page<PendingPropertyResponse> getPendingProperties(Pageable pageable) {
        log.info("📋 Fetching pending properties for admin approval");
        
        // ✅ Use the new query that fetches with owner
        Page<Property> pendingProperties = propertyRepository.findByStatusWithOwner(
            PropertyStatus.pending_approval, 
            pageable
        );
        
        log.info("✅ Found {} pending properties", pendingProperties.getTotalElements());
        
        return pendingProperties.map(this::convertToPropertyResponse);
    }
    
    /**
     * ✅ SAFE: Convert Property to PendingPropertyResponse
     * Owner is already loaded, so no lazy loading exception
     */
    private PendingPropertyResponse convertToPropertyResponse(Property property) {
        // ✅ Owner is already loaded via JOIN FETCH
        User owner = property.getOwner();
        
        return PendingPropertyResponse.builder()
                .propertyId(property.getPropertyId())
                .titleAr(property.getTitleAr())
                .titleEn(property.getTitleEn())
                .ownerName(owner.getFirstName() + " " + owner.getLastName())
                .ownerEmail(owner.getEmail())
                .ownerPhone(owner.getPhoneNumber())
                .propertyType(property.getPropertyType())
                .rentalType(property.getRentalType())
                .governorate(property.getGovernorate())
                .city(property.getCity())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .pricePerNight(property.getPricePerNight())
                .descriptionAr(property.getDescriptionAr())
                .status(property.getStatus().toString())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
    
    // ============ APPROVE PROPERTY ============
    
    @Transactional
    public void approveProperty(Long propertyId, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        property.setStatus(PropertyStatus.active);
        property.setIsVerified(true);
        propertyRepository.save(property);
        
        logAdminAction(admin, AdminLog.AdminActionType.approve_property,
                AdminLog.AdminTargetType.property, propertyId,
                "Property " + propertyId + " approved and verified");
        
        log.info("✅ Property {} approved by admin {}", propertyId, adminId);
    }
    
    // ============ REJECT PROPERTY ============
    
    @Transactional
    public void rejectProperty(Long propertyId, Long adminId, AdminActionRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        property.setStatus(PropertyStatus.deleted);
        propertyRepository.save(property);
        
        logAdminAction(admin, AdminLog.AdminActionType.reject_property,
                AdminLog.AdminTargetType.property, propertyId,
                request.getReason());
        
        log.info("❌ Property {} rejected by admin {} with reason: {}",
                propertyId, adminId, request.getReason());
    }
    
    // ============ BAN USER ============
    
    @Transactional
    public void banUser(Long userId, Long adminId, AdminActionRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        User userToBan = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userToBan.setIsActive(false);
        userToBan.setBannedAt(LocalDateTime.now());
        userRepository.save(userToBan);
        
        logAdminAction(admin, AdminLog.AdminActionType.ban_user,
                AdminLog.AdminTargetType.user, userId,
                request.getReason());
        
        log.info("🚫 User {} banned by admin {} with reason: {}",
                userId, adminId, request.getReason());
    }
    
    // ============ UNBAN USER ============
    
    @Transactional
    public void unbanUser(Long userId, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        User userToUnban = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userToUnban.setIsActive(true);
        userToUnban.setBannedAt(null);
        userRepository.save(userToUnban);
        
        logAdminAction(admin, AdminLog.AdminActionType.unban_user,
                AdminLog.AdminTargetType.user, userId,
                "User unbanned");
        
        log.info("✅ User {} unbanned by admin {}", userId, adminId);
    }
    
    // ============ VERIFY USER ID ============
    
    @Transactional
    public void verifyUser(Long userId, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        User userToVerify = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userToVerify.setNationalIdVerified(true);
        userToVerify.setVerifiedAt(LocalDateTime.now());
        userRepository.save(userToVerify);
        
        logAdminAction(admin, AdminLog.AdminActionType.verify_user,
                AdminLog.AdminTargetType.user, userId,
                "User ID verified");
        
        log.info("✅ User {} verified by admin {}", userId, adminId);
    }
    
    // ============ GET ALL USERS FOR MANAGEMENT ============
    
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    // ============ HELPER METHODS ============
    
    private void logAdminAction(User admin, AdminLog.AdminActionType actionType,
                               AdminLog.AdminTargetType targetType, Long targetId,
                               String details) {
        AdminLog log = new AdminLog();
        log.setAdmin(admin);
        log.setActionType(actionType);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setActionDetails(details);
        
        adminLogRepository.save(log);
    }
}