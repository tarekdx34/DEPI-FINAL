package com.ajarly.backend.service;

import com.ajarly.backend.model.Report;
import com.ajarly.backend.model.Report.*;
import com.ajarly.backend.model.User;
import com.ajarly.backend.model.AdminLog;
import com.ajarly.backend.model.Property;
import com.ajarly.backend.repository.ReportRepository;
import com.ajarly.backend.repository.UserRepository;
import com.ajarly.backend.repository.PropertyRepository;
import com.ajarly.backend.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final AdminLogRepository adminLogRepository;
    
    /**
     * Create a new report
     * Business rules:
     * - Users can report once per item
     * - Auto-set priority based on reason (SCAM/FRAUD = URGENT, HARASSMENT = HIGH, others = MEDIUM)
     */
    @Transactional
    public Report createReport(Report report, Long reporterId) {
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user already reported this item
        boolean alreadyReported = checkDuplicateReport(reporterId, report);
        if (alreadyReported) {
            throw new IllegalArgumentException("You have already reported this item");
        }
        
        // Set reporter
        report.setReporter(reporter);
        
        // Auto-set priority based on reason
        report.setPriority(determinePriority(report.getReason()));
        
        // Set initial status to PENDING
        report.setStatus(ReportStatus.pending);
        
        Report savedReport = reportRepository.save(report);
        
        log.info("Report created: reportId={}, reportType={}, reason={}, reporterId={}", 
            savedReport.getReportId(), report.getReportType(), report.getReason(), reporterId);
        
        return savedReport;
    }
    
    /**
     * Get paginated reports with optional filtering (admin only)
     */
    public Page<Report> getReports(ReportStatus status, ReportPriority priority, 
                                   ReportType reportType, Pageable pageable) {
        return reportRepository.findReportsByFilters(status, priority, reportType, pageable);
    }
    
    /**
     * Get urgent/high priority reports (admin dashboard)
     */
    public Page<Report> getUrgentReports(Pageable pageable) {
        return reportRepository.findUrgentReports(pageable);
    }
    
    /**
     * Get reports assigned to specific admin
     */
    public Page<Report> getReportsAssignedToAdmin(Long adminId, Pageable pageable) {
        return reportRepository.findByAssignedTo_UserId(adminId, pageable);
    }
    
    /**
     * Get reports by reporter (user viewing their own reports)
     */
    public Page<Report> getReportsByReporter(Long reporterId, Pageable pageable) {
        return reportRepository.findByReporter_UserId(reporterId, pageable);
    }
    
    /**
     * Assign report to admin
     */
    @Transactional
    public Report assignReport(Long reportId, Long adminId) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        // Verify admin has admin role
        if (!admin.getUserType().equals(User.UserType.admin)) {
            throw new IllegalArgumentException("User is not an admin");
        }
        
        report.setAssignedTo(admin);
        report.setStatus(ReportStatus.investigating);
        
        Report updated = reportRepository.save(report);
        
        log.info("Report {} assigned to admin {}", reportId, adminId);
        
        return updated;
    }
    
    /**
     * Resolve report with admin action
     * Business rules:
     * - Admin can take actions: warning, suspend, ban, remove content
     * - Actions are actually executed (update user/property status)
     * - Create admin log for audit trail
     */
    @Transactional
    public Report resolveReport(Long reportId, Long adminId, ReportStatus newStatus, 
                               ActionTaken actionTaken, String resolutionNotes) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        // Verify admin
        if (!admin.getUserType().equals(User.UserType.admin)) {
            throw new IllegalArgumentException("User is not an admin");
        }
        
        // Update report status
        report.setStatus(newStatus);
        report.setActionTaken(actionTaken);
        report.setResolutionNotes(resolutionNotes);
        report.setResolvedBy(admin);
        report.setResolvedAt(LocalDateTime.now());
        
        // Execute action based on action type
        executeReportAction(report, actionTaken, admin);
        
        Report resolved = reportRepository.save(report);
        
        // Log admin action
        logAdminAction(admin, report, actionTaken, resolutionNotes);
        
        log.info("Report {} resolved by admin {} with action: {}", 
            reportId, adminId, actionTaken);
        
        return resolved;
    }
    
    /**
     * Add admin notes to report
     */
    @Transactional
    public Report addAdminNotes(Long reportId, String notes) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setAdminNotes(notes);
        return reportRepository.save(report);
    }
    
    /**
     * Get single report by ID
     */
    public Report getReportById(Long reportId) {
        return reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
    }
    
    // ============ PRIVATE HELPER METHODS ============
    
    /**
     * Check if user already reported this specific item
     */
    private boolean checkDuplicateReport(Long reporterId, Report report) {
        if (report.getReportType() == ReportType.property && report.getReportedProperty() != null) {
            return reportRepository.existsByReporter_UserIdAndReportedProperty_PropertyIdAndReportType(
                reporterId, report.getReportedProperty().getPropertyId(), ReportType.property
            );
        } else if (report.getReportType() == ReportType.user && report.getReportedUser() != null) {
            return reportRepository.existsByReporter_UserIdAndReportedUser_UserIdAndReportType(
                reporterId, report.getReportedUser().getUserId(), ReportType.user
            );
        } else if (report.getReportType() == ReportType.review && report.getReportedReview() != null) {
            return reportRepository.existsByReporter_UserIdAndReportedReview_ReviewIdAndReportType(
                reporterId, report.getReportedReview().getReviewId(), ReportType.review
            );
        } //else if (report.getReportType() == ReportType.message && report.getReportedMessageId() != null) {
           // return reportRepository.existsByReporter_UserIdAndReportedMessage_MessageIdAndReportType(
           //     reporterId, report.getReportedMessageId(), ReportType.message
          //  );
       // }
        return false;
    }
    
    /**
     * Auto-determine priority based on reason
     */
    private ReportPriority determinePriority(ReportReason reason) {
        return switch (reason) {
            case scam, fraud -> ReportPriority.urgent;
            case harassment, safety_concern -> ReportPriority.high;
            case fake_listing, inappropriate_content, spam -> ReportPriority.medium;
            case duplicate, incorrect_info, copyright, other -> ReportPriority.low;
        };
    }
    
    /**
     * Execute the actual action on user/property based on ActionTaken
     */
    private void executeReportAction(Report report, ActionTaken action, User admin) {
        if (action == ActionTaken.none) {
            return;
        }
        
        if (report.getReportType() == ReportType.user && report.getReportedUser() != null) {
            executeUserAction(report.getReportedUser(), action, admin);
        } else if (report.getReportType() == ReportType.property && report.getReportedProperty() != null) {
            executePropertyAction(report.getReportedProperty(), action, admin);
        }
    }
    
    /**
     * Execute action on user (warning, suspend, ban)
     */
    private void executeUserAction(User user, ActionTaken action, User admin) {
        if (action == ActionTaken.user_suspended) {
            // Suspend user (set inactive but don't ban)
            user.setIsActive(false);
            userRepository.save(user);
            log.info("User {} suspended as result of report", user.getUserId());
        } else if (action == ActionTaken.user_banned) {
            // Ban user (set inactive and ban flag)
            user.setIsActive(false);
            user.setBannedAt(LocalDateTime.now());
            userRepository.save(user);
            log.info("User {} banned as result of report", user.getUserId());
        } else if (action == ActionTaken.warning) {
            // Warning - just log, no status change
            log.info("Warning issued to user {} as result of report", user.getUserId());
        }
    }
    
    /**
     * Execute action on property (content removal = suspend property)
     */
    private void executePropertyAction(Property property, ActionTaken action, User admin) {
        if (action == ActionTaken.content_removed) {
            // Remove content by suspending property
            property.setStatus(Property.PropertyStatus.suspended);
            propertyRepository.save(property);
            log.info("Property {} suspended (content removed) as result of report", 
                property.getPropertyId());
        }
    }
    
    /**
     * Log admin action for audit trail
     */
    private void logAdminAction(User admin, Report report, ActionTaken action, 
                               String details) {
        AdminLog adminLog = new AdminLog();
        adminLog.setAdmin(admin);
        adminLog.setActionType(AdminLog.AdminActionType.resolve_report);
        adminLog.setTargetType(AdminLog.AdminTargetType.property);
        adminLog.setTargetId(report.getReportId());
        adminLog.setActionDetails("Report resolved with action: " + action + ". Details: " + details);
        
        adminLogRepository.save(adminLog);
    }
}
