package com.ajarly.backend.controller;

import com.ajarly.backend.dto.AdminActionRequest;
import com.ajarly.backend.dto.DashboardStatsResponse;
import com.ajarly.backend.dto.PendingPropertyResponse;
import com.ajarly.backend.model.User;
import com.ajarly.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    /**
     * GET /api/v1/admin/dashboard
     * Get dashboard overview statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * GET /api/v1/admin/properties/pending
     * Get pending properties awaiting approval
     */
    @GetMapping("/properties/pending")
    public ResponseEntity<Page<PendingPropertyResponse>> getPendingProperties(Pageable pageable) {
        Page<PendingPropertyResponse> properties = adminService.getPendingProperties(pageable);
        return ResponseEntity.ok(properties);
    }
    
    /**
     * PUT /api/v1/admin/properties/{id}/approve
     * Approve a property
     */
    @PutMapping("/properties/{id}/approve")
    public ResponseEntity<String> approveProperty(
            @PathVariable Long id,
            @RequestAttribute("userId") Long adminId) {
        adminService.approveProperty(id, adminId);
        return ResponseEntity.ok("Property approved successfully");
    }
    
    /**
     * PUT /api/v1/admin/properties/{id}/reject
     * Reject a property with reason
     */
    @PutMapping("/properties/{id}/reject")
    public ResponseEntity<String> rejectProperty(
            @PathVariable Long id,
            @RequestAttribute("userId") Long adminId,
            @RequestBody AdminActionRequest request) {
        adminService.rejectProperty(id, adminId, request);
        return ResponseEntity.ok("Property rejected successfully");
    }
    
    /**
     * GET /api/v1/admin/users
     * Get all users for management
     */
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getUsers(Pageable pageable) {
        Page<User> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }
    
    /**
     * PUT /api/v1/admin/users/{id}/ban
     * Ban a user
     */
    @PutMapping("/users/{id}/ban")
    public ResponseEntity<String> banUser(
            @PathVariable Long id,
            @RequestAttribute("userId") Long adminId,
            @RequestBody AdminActionRequest request) {
        adminService.banUser(id, adminId, request);
        return ResponseEntity.ok("User banned successfully");
    }
    
    /**
     * PUT /api/v1/admin/users/{id}/unban
     * Unban a user
     */
    @PutMapping("/users/{id}/unban")
    public ResponseEntity<String> unbanUser(
            @PathVariable Long id,
            @RequestAttribute("userId") Long adminId) {
        adminService.unbanUser(id, adminId);
        return ResponseEntity.ok("User unbanned successfully");
    }
    
    /**
     * PUT /api/v1/admin/users/{id}/verify
     * Verify user ID/national ID
     */
    @PutMapping("/users/{id}/verify")
    public ResponseEntity<String> verifyUser(
            @PathVariable Long id,
            @RequestAttribute("userId") Long adminId) {
        adminService.verifyUser(id, adminId);
        return ResponseEntity.ok("User ID verified successfully");
    }
}