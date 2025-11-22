package com.ajarly.backend.repository;

import com.ajarly.backend.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Integer> {
    
    List<SubscriptionPlan> findByIsActiveTrueOrderByPlanOrderAsc();
    
    Optional<SubscriptionPlan> findByPlanIdAndIsActiveTrue(Integer planId);
    
    Optional<SubscriptionPlan> findByNameEnIgnoreCaseAndIsActiveTrue(String nameEn);
}