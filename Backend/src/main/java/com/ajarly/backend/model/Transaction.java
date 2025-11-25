package com.ajarly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Integer transactionId;
    
    @Column(name = "transaction_reference", unique = true, nullable = false, length = 100)
    private String transactionReference;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    // subscription_id will be null for now (future feature)
    @Column(name = "subscription_id")
    private Integer subscriptionId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;
    
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "currency", length = 3)
    private String currency = "EGP";
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;
    
    @Column(name = "payment_gateway", length = 50)
    private String paymentGateway;
    
    @Column(name = "gateway_transaction_id", length = 255)
    private String gatewayTransactionId;
    
    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransactionStatus status = TransactionStatus.pending;
    
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;
    
    @Column(name = "platform_fee_amount", precision = 10, scale = 2)
    private BigDecimal platformFeeAmount = BigDecimal.ZERO;
    
    @Column(name = "owner_payout_amount", precision = 10, scale = 2)
    private BigDecimal ownerPayoutAmount = BigDecimal.ZERO;
    
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    // Enums with LOWERCASE values (matching database)
    public enum TransactionType {
        booking_payment, booking_deposit, booking_refund,
        subscription_payment, subscription_refund,
        featured_listing, featured_refund,
        payout_to_owner, platform_fee,
        penalty, bonus
    }
    
    public enum TransactionStatus {
        pending, processing, completed, failed, refunded, cancelled
    }
    
    public enum PaymentMethod {
        cash, credit_card, debit_card,
        fawry, vodafone_cash, etisalat_cash,
        bank_transfer, wallet, paypal, stripe
    }
}
