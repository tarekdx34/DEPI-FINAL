package com.ajarly.backend.repository;

import com.ajarly.backend.model.Transaction;
import com.ajarly.backend.model.Transaction.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    
    Optional<Transaction> findByTransactionReference(String transactionReference);
    
    Optional<Transaction> findByGatewayTransactionId(String gatewayTransactionId);
    
    List<Transaction> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    
    List<Transaction> findByBooking_BookingIdOrderByCreatedAtDesc(Integer bookingId);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.userId = :userId " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findByUserAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT t FROM Transaction t WHERE t.booking.bookingId = :bookingId " +
           "AND t.status = :status")
    Optional<Transaction> findByBookingAndStatus(
        @Param("bookingId") Integer bookingId,
        @Param("status") TransactionStatus status
    );
    
    // ============================================
// ADD THIS METHOD TO TransactionRepository.java
// ============================================

/**
 * ✅ Find transactions by user ID with booking and property eagerly loaded
 * Prevents lazy loading exceptions when accessing booking.property
 */
    @Query("SELECT DISTINCT t FROM Transaction t " +
        "LEFT JOIN FETCH t.booking b " +
        "LEFT JOIN FETCH b.property " +
        "WHERE t.user.userId = :userId " +
        "ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdWithBookingAndProperty(@Param("userId") Long userId);
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.userId = :userId AND t.status = 'completed'")
    Double getTotalTransactionsByUser(@Param("userId") Long userId);
}