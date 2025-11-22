package com.ajarly.backend.dto;

import com.ajarly.backend.model.Report;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class ReportDto {
    
    // ============ REQUEST DTO ============
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportRequest {
        
        @NotNull(message = "Report type is required")
        private Report.ReportType reportType;
        
        // One of these should be provided based on report type
        private Long reportedPropertyId;
        private Long reportedUserId;
        private Long reportedReviewId;
        private Long reportedMessageId;
        
        @NotNull(message = "Reason is required")
        private Report.ReportReason reason;
        
        @NotBlank(message = "Description is required")
        @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
        private String description;
    }
    
    // ============ RESPONSE DTO ============
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportResponse {
        
        private Long reportId;
        
        private Long reporterId;
        private String reporterName;
        private String reporterEmail;
        
        private Report.ReportType reportType;
        private Report.ReportReason reason;
        private String description;
        
        // Details about reported item
        private Long reportedItemId;
        private String reportedItemTitle;
        private Long reportedUserId;
        private String reportedUserName;
        
        private Report.ReportStatus status;
        private Report.ReportPriority priority;
        
        // Admin assignment
        private Long assignedToId;
        private String assignedToName;
        
        // Resolution details
        private Long resolvedById;
        private String resolvedByName;
        private String adminNotes;
        private String resolutionNotes;
        private Report.ActionTaken actionTaken;
        private LocalDateTime resolvedAt;
        
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        /**
         * Convert Report entity to ReportResponse
         */
        public static ReportResponse fromReport(Report report) {
            ReportResponse response = ReportResponse.builder()
                .reportId(report.getReportId())
                .reporterId(report.getReporter().getUserId())
                .reporterName(report.getReporter().getFirstName() + " " + report.getReporter().getLastName())
                .reporterEmail(report.getReporter().getEmail())
                .reportType(report.getReportType())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .priority(report.getPriority())
                .adminNotes(report.getAdminNotes())
                .resolutionNotes(report.getResolutionNotes())
                .actionTaken(report.getActionTaken())
                .resolvedAt(report.getResolvedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
            
            // Set reported item details based on report type
            if (report.getReportedProperty() != null) {
                response.setReportedItemId(report.getReportedProperty().getPropertyId());
                response.setReportedItemTitle(report.getReportedProperty().getTitleAr());
            }
            
            if (report.getReportedUser() != null) {
                response.setReportedUserId(report.getReportedUser().getUserId());
                response.setReportedUserName(report.getReportedUser().getFirstName() + " " + 
                    report.getReportedUser().getLastName());
            }
            
            if (report.getReportedReview() != null) {
                response.setReportedItemId(report.getReportedReview().getReviewId());
                response.setReportedItemTitle("Review #" + report.getReportedReview().getReviewId());
            }
            
    //        if (report.getReportedMessage() != null) {
       //         response.setReportedItemId(report.getReportedMessage().getMessageId());
       //         response.setReportedItemTitle("Message #" + report.getReportedMessage().getMessageId());
       //     }
            
            // Set assignment details if assigned
            if (report.getAssignedTo() != null) {
                response.setAssignedToId(report.getAssignedTo().getUserId());
                response.setAssignedToName(report.getAssignedTo().getFirstName() + " " + 
                    report.getAssignedTo().getLastName());
            }
            
            // Set resolution details if resolved
            if (report.getResolvedBy() != null) {
                response.setResolvedById(report.getResolvedBy().getUserId());
                response.setResolvedByName(report.getResolvedBy().getFirstName() + " " + 
                    report.getResolvedBy().getLastName());
            }
            
            return response;
        }
    }
    
    // ============ ADMIN RESOLUTION DTO ============
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportResolutionRequest {
        
        @NotNull(message = "Resolution status is required")
        private Report.ReportStatus status;
        
        @NotNull(message = "Action taken is required")
        private Report.ActionTaken actionTaken;
        
        @NotBlank(message = "Resolution notes are required")
        @Size(min = 10, max = 2000, message = "Resolution notes must be between 10 and 2000 characters")
        private String resolutionNotes;
    }
    
    // ============ ADMIN ASSIGNMENT DTO ============
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportAssignmentRequest {
        
        @NotNull(message = "Admin ID is required")
        @Positive(message = "Admin ID must be positive")
        private Long adminId;
    }
    
    // ============ ADMIN NOTES DTO ============
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminNotesRequest {
        
        @NotBlank(message = "Notes are required")
        @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
        private String notes;
    }
}

