package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;
    
    // Foreign keys for what's being reported (nullable - only one should be set)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_property_id")
    private Property reportedProperty;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_review_id")
    private Review reportedReview;
    
    // Note: Message entity relationship commented out until Message model is created
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "reported_message_id")
    // private Message reportedMessage;
    
    // For now, store message ID as a field
    @Column(name = "reported_message_id")
    private Long reportedMessageId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false)
    private ReportReason reason;
    
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status = ReportStatus.pending;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private ReportPriority priority = ReportPriority.medium;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;
    
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;
    
    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action_taken")
    private ActionTaken actionTaken;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // ============ ENUMS (LOWERCASE) ============
    
    public enum ReportType {
        property, user, review, message, booking
    }
    
    public enum ReportReason {
        fake_listing, inappropriate_content, scam, fraud,
        harassment, spam, duplicate, incorrect_info,
        safety_concern, copyright, other
    }
    
    public enum ReportStatus {
        pending, investigating, resolved, dismissed, escalated
    }
    
    public enum ReportPriority {
        low, medium, high, urgent
    }
    
    public enum ActionTaken {
        none, warning, content_removed, user_suspended, user_banned, other
    }
}