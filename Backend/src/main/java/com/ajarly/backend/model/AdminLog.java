package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private AdminActionType actionType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private AdminTargetType targetType;
    
    @Column(name = "target_id")
    private Long targetId;
    
    @Column(name = "action_details", columnDefinition = "TEXT")
    private String actionDetails;
    
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum AdminActionType {
        approve_property,
        reject_property,
        ban_user,
        unban_user,
        verify_user,
        suspend_property,
        delete_property,
        resolve_report,
        other
    }
    
    public enum AdminTargetType {
        property,
        user,
        booking,
        system
    }
}