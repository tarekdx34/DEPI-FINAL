package com.ajarly.backend.repository;

import com.ajarly.backend.model.Report;
import com.ajarly.backend.model.Report.ReportStatus;
import com.ajarly.backend.model.Report.ReportPriority;
import com.ajarly.backend.model.Report.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    /**
     * Check if user already reported the same property
     */
    boolean existsByReporter_UserIdAndReportedProperty_PropertyIdAndReportType(
        Long reporterId, Long propertyId, Report.ReportType reportType
    );
    
    /**
     * Check if user already reported the same user
     */
    boolean existsByReporter_UserIdAndReportedUser_UserIdAndReportType(
        Long reporterId, Long reportedUserId, Report.ReportType reportType
    );
    
    /**
     * Check if user already reported the same review
     */
    boolean existsByReporter_UserIdAndReportedReview_ReviewIdAndReportType(
        Long reporterId, Long reviewId, Report.ReportType reportType
    );
    
    /**
     * Check if user already reported the same message
     */
    //boolean existsByReporter_UserIdAndReportedMessage_MessageIdAndReportType(
      //  Long reporterId, Long messageId, Report.ReportType reportType
   // );
    
    /**
     * Get all reports with filtering by status and priority (admin only)
     */
    @Query("SELECT r FROM Report r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:priority IS NULL OR r.priority = :priority) AND " +
           "(:reportType IS NULL OR r.reportType = :reportType) " +
           "ORDER BY r.priority DESC, r.createdAt ASC")
    Page<Report> findReportsByFilters(
        @Param("status") ReportStatus status,
        @Param("priority") ReportPriority priority,
        @Param("reportType") ReportType reportType,
        Pageable pageable
    );
    
    /**
     * Get reports pending review
     */
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    
    /**
     * Get reports assigned to specific admin
     */
    Page<Report> findByAssignedTo_UserId(Long adminId, Pageable pageable);
    
    /**
     * Get reports by reporter (for user to view their own reports)
     */
    Page<Report> findByReporter_UserId(Long reporterId, Pageable pageable);
    
    /**
     * Get urgent or high priority unresolved reports
     */
    @Query("SELECT r FROM Report r WHERE " +
           "(r.priority = 'urgent' OR r.priority = 'high') AND " +
           "r.status NOT IN ('resolved', 'dismissed') " +
           "ORDER BY r.priority DESC, r.createdAt ASC")
    Page<Report> findUrgentReports(Pageable pageable);
}