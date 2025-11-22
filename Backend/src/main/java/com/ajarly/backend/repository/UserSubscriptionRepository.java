package com.ajarly.backend.repository;

import com.ajarly.backend.model.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Integer> {
    
    // Find active subscription for user
    @Query("SELECT s FROM UserSubscription s WHERE s.user.userId = :userId " +
           "AND s.status = 'active' AND s.endDate >= :today ORDER BY s.endDate DESC")
    Optional<UserSubscription> findActiveSubscriptionByUserId(
        @Param("userId") Long userId, 
        @Param("today") LocalDate today
    );
    
    // Find all subscriptions for user
    List<UserSubscription> findByUserUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find expiring subscriptions (for scheduled task)
    @Query("SELECT s FROM UserSubscription s WHERE s.status = 'active' " +
           "AND s.endDate BETWEEN :today AND :expiryDate AND s.autoRenew = false")
    List<UserSubscription> findExpiringSoon(
        @Param("today") LocalDate today,
        @Param("expiryDate") LocalDate expiryDate
    );
    
    // Find expired subscriptions (for scheduled task)
    @Query("SELECT s FROM UserSubscription s WHERE s.status = 'active' AND s.endDate < :today")
    List<UserSubscription> findExpiredSubscriptions(@Param("today") LocalDate today);
}