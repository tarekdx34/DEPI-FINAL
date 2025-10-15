-- =====================================================
-- Analytics Tables Migration
-- Feature 13: Analytics System for Ajarly
-- =====================================================

-- Create property_performance_analytics table
CREATE TABLE IF NOT EXISTS property_performance_analytics (
    analytics_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    analytics_date DATE NOT NULL,
    
    -- View Metrics
    total_views INT NOT NULL DEFAULT 0,
    unique_views INT NOT NULL DEFAULT 0,
    
    -- Booking Metrics
    booking_requests INT NOT NULL DEFAULT 0,
    booking_confirmations INT NOT NULL DEFAULT 0,
    booking_cancellations INT NOT NULL DEFAULT 0,
    booking_rejections INT NOT NULL DEFAULT 0,
    
    -- Revenue Metrics
    revenue DECIMAL(10, 2) DEFAULT 0.00,
    potential_revenue DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Rating Metrics
    new_reviews INT NOT NULL DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    
    -- Contact Metrics
    contact_clicks INT NOT NULL DEFAULT 0,
    image_views INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_analytics_property 
        FOREIGN KEY (property_id) REFERENCES properties(property_id) 
        ON DELETE CASCADE,
    
    -- Unique constraint: one record per property per date
    CONSTRAINT uk_property_date 
        UNIQUE KEY (property_id, analytics_date),
    
    -- Indexes for performance
    INDEX idx_analytics_date (analytics_date),
    INDEX idx_property_date (property_id, analytics_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing columns to properties table (if not exists)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS booking_request_count INT DEFAULT 0 AFTER view_count;

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS booking_confirmed_count INT DEFAULT 0 AFTER booking_request_count;

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Uncomment below to insert sample analytics data
/*
INSERT INTO property_performance_analytics 
(property_id, analytics_date, total_views, unique_views, booking_requests, 
 booking_confirmations, revenue, new_reviews, average_rating)
SELECT 
    property_id,
    CURDATE() - INTERVAL 1 DAY as analytics_date,
    FLOOR(RAND() * 100) as total_views,
    FLOOR(RAND() * 50) as unique_views,
    FLOOR(RAND() * 10) as booking_requests,
    FLOOR(RAND() * 5) as booking_confirmations,
    ROUND(RAND() * 5000, 2) as revenue,
    FLOOR(RAND() * 3) as new_reviews,
    ROUND(3 + RAND() * 2, 2) as average_rating
FROM properties 
WHERE status = 'active'
LIMIT 10;
*/

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check table structure
DESCRIBE property_performance_analytics;

-- Check if data exists
SELECT COUNT(*) as total_analytics_records 
FROM property_performance_analytics;

-- View sample analytics
SELECT 
    a.analytics_id,
    p.title_ar,
    a.analytics_date,
    a.total_views,
    a.booking_requests,
    a.booking_confirmations,
    a.revenue
FROM property_performance_analytics a
JOIN properties p ON a.property_id = p.property_id
ORDER BY a.analytics_date DESC
LIMIT 10;