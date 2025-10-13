package com.ajarly.backend.controller;

import com.ajarly.backend.dto.ReportDto;
import com.ajarly.backend.dto.ReportDto.*;
import com.ajarly.backend.model.Report;
import com.ajarly.backend.model.Report.*;
import com.ajarly.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {
    
    private final ReportService reportService;
    
    /**
     * POST /api/v1/reports - Create a new report (any logged-in user)
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReportResponse> createReport(
        @Valid @RequestBody ReportRequest request,
        HttpServletRequest httpRequest) {
        
        Long reporterId = (Long) httpRequest.getAttribute("userId");
        
        try {
            // Create report entity from request
            Report report = new Report();
            report.setReportType(request.getReportType());
            report.setReason(request.getReason());
            report.setDescription(request.getDescription());
            
            Report createdReport = reportService.createReport(report, reporterId);
            ReportResponse response = ReportResponse.fromReport(createdReport);
            
            log.info("Report created successfully: reportId={}", createdReport.getReportId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Failed to create report: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error creating report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/v1/reports/admin/all - Get all reports with filters (admin only)
     * Query params: status, priority, reportType
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReportResponse>> getAllReports(
        @RequestParam(required = false) ReportStatus status,
        @RequestParam(required = false) ReportPriority priority,
        @RequestParam(required = false) ReportType reportType,
        Pageable pageable) {
        
        try {
            Page<Report> reports = reportService.getReports(status, priority, reportType, pageable);
            Page<ReportResponse> response = reports.map(ReportResponse::fromReport);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/v1/reports/admin/urgent - Get urgent and high priority reports (admin dashboard)
     */
    @GetMapping("/admin/urgent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReportResponse>> getUrgentReports(Pageable pageable) {
        try {
            Page<Report> reports = reportService.getUrgentReports(pageable);
            Page<ReportResponse> response = reports.map(ReportResponse::fromReport);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching urgent reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/v1/reports/admin/assigned-to-me - Get reports assigned to current admin
     */
    @GetMapping("/admin/assigned-to-me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReportResponse>> getMyAssignedReports(
        HttpServletRequest httpRequest,
        Pageable pageable) {
        
        Long adminId = (Long) httpRequest.getAttribute("userId");
        
        try {
            Page<Report> reports = reportService.getReportsAssignedToAdmin(adminId, pageable);
            Page<ReportResponse> response = reports.map(ReportResponse::fromReport);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching assigned reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/v1/reports/my-reports - Get reports created by current user
     */
        /**
     * GET /api/v1/reports/my-reports - Get reports created by current user
     */
    @GetMapping("/my-reports")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReportResponse>> getMyReports(
        HttpServletRequest httpRequest,
        Pageable pageable) {
        
        Long reporterId = (Long) httpRequest.getAttribute("userId");
        
        try {
            Page<Report> reports = reportService.getReportsByReporter(reporterId, pageable);
            Page<ReportResponse> response = reports.map(ReportResponse::fromReport);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching user's reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/v1/reports/{id} - Get single report details
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReportResponse> getReportById(
        @PathVariable Long id,
        HttpServletRequest httpRequest) {
        
        Long userId = (Long) httpRequest.getAttribute("userId");
        
        try {
            Report report = reportService.getReportById(id);
            ReportResponse response = ReportResponse.fromReport(report);
            
            log.info("Report retrieved: reportId={}", id);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.warn("Report not found: reportId={}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error fetching report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * PUT /api/v1/reports/{id}/assign - Assign report to admin
     */
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> assignReport(
        @PathVariable Long id,
        @Valid @RequestBody ReportAssignmentRequest request) {
        
        try {
            Report updated = reportService.assignReport(id, request.getAdminId());
            ReportResponse response = ReportResponse.fromReport(updated);
            
            log.info("Report assigned: reportId={}, adminId={}", id, request.getAdminId());
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.warn("Error assigning report: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } 
         catch (Exception e) {
            log.error("Error assigning report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * PUT /api/v1/reports/{id}/resolve - Resolve report with admin action
     */
    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> resolveReport(
        @PathVariable Long id,
        @Valid @RequestBody ReportResolutionRequest request,
        HttpServletRequest httpRequest) {
        
        Long adminId = (Long) httpRequest.getAttribute("userId");
        
        try {
            Report resolved = reportService.resolveReport(
                id, 
                adminId, 
                request.getStatus(), 
                request.getActionTaken(), 
                request.getResolutionNotes()
            );
            ReportResponse response = ReportResponse.fromReport(resolved);
            
            log.info("Report resolved: reportId={}, action={}", id, request.getActionTaken());
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.warn("Report not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }  catch (Exception e) {
            log.error("Error resolving report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * PUT /api/v1/reports/{id}/add-notes - Add admin notes to report
     */
    @PutMapping("/{id}/add-notes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> addAdminNotes(
        @PathVariable Long id,
        @Valid @RequestBody AdminNotesRequest request) {
        
        try {
            Report updated = reportService.addAdminNotes(id, request.getNotes());
            ReportResponse response = ReportResponse.fromReport(updated);
            
            log.info("Admin notes added to report: reportId={}", id);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.warn("Report not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error adding notes to report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}