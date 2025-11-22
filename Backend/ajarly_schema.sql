-- ============================================
-- AJARLY RENTAL PLATFORM - MySQL Database Schema
-- Enhanced with Advanced Analytics & Reports
-- ============================================

-- 1. USERS TABLE
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verification_code VARCHAR(6),
    phone_verification_expires TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    
    user_type ENUM('renter', 'landlord', 'broker', 'admin') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_photo VARCHAR(500),
    bio TEXT,
    
    -- Verification Documents
    national_id VARCHAR(50),
    national_id_front_image VARCHAR(500),
    national_id_back_image VARCHAR(500),
    national_id_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by INT,
    
    -- Address
    governorate VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    
    -- Preferences
    preferred_language ENUM('ar', 'en') DEFAULT 'ar',
    currency_preference VARCHAR(3) DEFAULT 'EGP',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    banned_at TIMESTAMP,
    banned_by INT,
    
    -- Statistics
    total_bookings INT DEFAULT 0,
    total_listings INT DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage
    average_response_time INT DEFAULT 0, -- In minutes
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    last_activity TIMESTAMP,
    
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (banned_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone_number),
    INDEX idx_user_type (user_type),
    INDEX idx_location (governorate, city),
    INDEX idx_verified (national_id_verified),
    INDEX idx_active (is_active, is_banned)
);

-- 2. PROPERTIES TABLE
CREATE TABLE properties (
    property_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    
    -- Title & Description
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    description_ar TEXT NOT NULL,
    description_en TEXT,
    slug VARCHAR(255) UNIQUE, -- For SEO-friendly URLs
    
    property_type ENUM('apartment', 'chalet', 'villa', 'studio', 'penthouse', 'room', 'farm', 'camp') NOT NULL,
    rental_type ENUM('vacation', 'long_term', 'both') NOT NULL,
    
    -- Location (Enhanced)
    governorate VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    street_address TEXT,
    building_name VARCHAR(255),
    apartment_number VARCHAR(50),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_to_beach INT, -- In meters
    
    -- Property Details
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    guests_capacity INT NOT NULL,
    area_sqm INT,
    floor_number INT,
    total_floors INT,
    furnished BOOLEAN DEFAULT FALSE,
    pets_allowed BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    
    -- Pricing
    price_per_night DECIMAL(10, 2),
    price_per_week DECIMAL(10, 2),
    price_per_month DECIMAL(10, 2),
    price_summer_season DECIMAL(10, 2),
    price_winter_season DECIMAL(10, 2),
    cleaning_fee DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'EGP',
    security_deposit DECIMAL(10, 2),
    
    -- Discounts
    weekly_discount_percent DECIMAL(5, 2) DEFAULT 0,
    monthly_discount_percent DECIMAL(5, 2) DEFAULT 0,
    
    -- Availability & Rules
    available_from DATE,
    available_to DATE,
    min_rental_days INT DEFAULT 1,
    max_rental_days INT,
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '12:00:00',
    instant_booking BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT TRUE,
    
    -- House Rules
    house_rules_ar TEXT,
    house_rules_en TEXT,
    cancellation_policy ENUM('flexible', 'moderate', 'strict') DEFAULT 'moderate',
    
    -- Status & Verification
    status ENUM('draft', 'pending_approval', 'active', 'inactive', 'suspended', 'deleted') DEFAULT 'draft',
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    admin_notes TEXT,
    
    -- Statistics & Analytics
    view_count INT DEFAULT 0,
    unique_view_count INT DEFAULT 0,
    contact_count INT DEFAULT 0,
    booking_request_count INT DEFAULT 0,
    booking_confirmed_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    last_booked_at TIMESTAMP,
    last_viewed_at TIMESTAMP,
    
    -- Featured/Premium
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP,
    featured_order INT DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP,
    
    -- SEO & Marketing
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_owner (owner_id),
    INDEX idx_location (governorate, city, neighborhood),
    INDEX idx_property_type (property_type),
    INDEX idx_rental_type (rental_type),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured, featured_order),
    INDEX idx_price_night (price_per_night),
    INDEX idx_bedrooms (bedrooms),
    INDEX idx_guests (guests_capacity),
    INDEX idx_rating (average_rating),
    INDEX idx_created (created_at),
    INDEX idx_slug (slug),
    FULLTEXT idx_search (title_ar, title_en, description_ar, description_en)
);

-- 3. PROPERTY AMENITIES TABLE
CREATE TABLE amenities (
    amenity_id INT PRIMARY KEY AUTO_INCREMENT,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    category ENUM('basic', 'kitchen', 'entertainment', 'outdoor', 'safety', 'location', 'accessibility') NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_popular (is_popular),
    INDEX idx_active (is_active)
);

-- 4. PROPERTY-AMENITIES JUNCTION TABLE
CREATE TABLE property_amenities (
    property_id INT NOT NULL,
    amenity_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_amenity (amenity_id)
);

-- 5. PROPERTY IMAGES TABLE
CREATE TABLE property_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    medium_url VARCHAR(500),
    large_url VARCHAR(500),
    image_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT FALSE,
    caption_ar VARCHAR(255),
    caption_en VARCHAR(255),
    file_size INT, -- In KB
    width INT,
    height INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_cover (is_cover),
    INDEX idx_order (image_order)
);

-- 6. BOOKINGS TABLE (Enhanced)
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(50) UNIQUE NOT NULL, -- e.g., AJ-2025-001234
    property_id INT NOT NULL,
    renter_id INT NOT NULL,
    owner_id INT NOT NULL,
    
    -- Dates
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_nights INT NOT NULL,
    number_of_guests INT NOT NULL,
    number_of_adults INT DEFAULT 1,
    number_of_children INT DEFAULT 0,
    
    -- Pricing Breakdown
    price_per_night DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0, -- Platform commission
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    security_deposit DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EGP',
    
    -- Status & Payment
    status ENUM('pending', 'confirmed', 'rejected', 'cancelled_by_renter', 'cancelled_by_owner', 'completed', 'expired') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'partial', 'paid', 'refunded', 'refund_pending') DEFAULT 'unpaid',
    payment_method ENUM('cash', 'credit_card', 'fawry', 'vodafone_cash', 'bank_transfer', 'wallet') DEFAULT 'cash',
    
    -- Communication
    special_requests TEXT,
    owner_response TEXT,
    rejection_reason TEXT,
    cancellation_reason TEXT,
    cancellation_fee DECIMAL(10, 2) DEFAULT 0,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Check-in/out codes (for self check-in)
    check_in_code VARCHAR(10),
    check_out_code VARCHAR(10),
    
    -- Analytics
    booking_source ENUM('web', 'mobile', 'direct', 'partner') DEFAULT 'web',
    device_type ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    rejected_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP, -- Auto-reject if not confirmed
    
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE RESTRICT,
    FOREIGN KEY (renter_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_reference (booking_reference),
    INDEX idx_property (property_id),
    INDEX idx_renter (renter_id),
    INDEX idx_owner (owner_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_dates (check_in_date, check_out_date),
    INDEX idx_created (requested_at)
);

-- 7. REVIEWS TABLE (Enhanced)
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL UNIQUE,
    property_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    
    -- Ratings (1-5)
    overall_rating DECIMAL(2, 1) NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    cleanliness_rating INT CHECK (cleanliness_rating BETWEEN 1 AND 5),
    accuracy_rating INT CHECK (accuracy_rating BETWEEN 1 AND 5),
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    location_rating INT CHECK (location_rating BETWEEN 1 AND 5),
    value_rating INT CHECK (value_rating BETWEEN 1 AND 5),
    
    -- Review Content
    review_title VARCHAR(255),
    review_text TEXT NOT NULL,
    pros TEXT,
    cons TEXT,
    
    -- Owner Response
    owner_response TEXT,
    owner_response_date TIMESTAMP,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT,
    approved_at TIMESTAMP,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    is_featured BOOLEAN DEFAULT FALSE, -- For showcasing best reviews
    
    -- Analytics
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_booking (booking_id),
    INDEX idx_property (property_id),
    INDEX idx_reviewer (reviewer_id),
    INDEX idx_reviewee (reviewee_id),
    INDEX idx_rating (overall_rating),
    INDEX idx_approved (is_approved),
    INDEX idx_created (created_at)
);

-- 8. REVIEW HELPFUL VOTES TABLE
CREATE TABLE review_helpful_votes (
    vote_id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    is_helpful BOOLEAN NOT NULL, -- TRUE = helpful, FALSE = not helpful
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_review (review_id),
    INDEX idx_user (user_id)
);

-- 9. FAVORITES/WISHLIST TABLE
CREATE TABLE favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    notes TEXT, -- User's personal notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_property (property_id),
    INDEX idx_created (created_at)
);

-- 10. MESSAGES/CHAT TABLE (Enhanced)
CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id VARCHAR(100) NOT NULL, -- Format: "user1_user2" (sorted)
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    property_id INT,
    booking_id INT,
    
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    message_text TEXT NOT NULL,
    attachment_url VARCHAR(500),
    attachment_type VARCHAR(50),
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_receiver BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_property (property_id),
    INDEX idx_booking (booking_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- 11. NOTIFICATIONS TABLE (Enhanced)
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM(
        'booking_request', 'booking_confirmed', 'booking_rejected', 'booking_cancelled',
        'new_message', 'review_received', 'review_response',
        'property_approved', 'property_rejected', 'property_expired',
        'payment_received', 'payment_failed',
        'subscription_expiring', 'subscription_expired',
        'featured_expiring', 'featured_expired',
        'verification_approved', 'verification_rejected',
        'system', 'promotional'
    ) NOT NULL,
    
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    message_ar TEXT NOT NULL,
    message_en TEXT NOT NULL,
    
    -- Related entities
    related_property_id INT,
    related_booking_id INT,
    related_user_id INT,
    related_review_id INT,
    related_message_id INT,
    
    -- Action button (optional)
    action_text_ar VARCHAR(100),
    action_text_en VARCHAR(100),
    action_url VARCHAR(500),
    
    -- Channels
    sent_via_app BOOLEAN DEFAULT TRUE,
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (related_booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (related_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    FOREIGN KEY (related_message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- 12. REPORTS TABLE (Enhanced)
CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    report_type ENUM('property', 'user', 'review', 'message', 'booking') NOT NULL,
    
    -- What's being reported
    reported_property_id INT,
    reported_user_id INT,
    reported_review_id INT,
    reported_message_id INT,
    reported_booking_id INT,
    
    reason ENUM(
        'fake_listing', 'inappropriate_content', 'scam', 'fraud',
        'harassment', 'spam', 'duplicate', 'incorrect_info',
        'safety_concern', 'copyright', 'other'
    ) NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT, -- JSON array of screenshot URLs
    
    -- Admin handling
    status ENUM('pending', 'investigating', 'resolved', 'dismissed', 'escalated') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    admin_notes TEXT,
    resolution_notes TEXT,
    action_taken ENUM('none', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'other'),
    
    assigned_to INT,
    resolved_by INT,
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_reporter (reporter_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_type (report_type),
    INDEX idx_created (created_at)
);

-- 13. UNAVAILABLE DATES TABLE
CREATE TABLE unavailable_dates (
    unavailable_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    booking_id INT, -- NULL if manually blocked
    unavailable_from DATE NOT NULL,
    unavailable_to DATE NOT NULL,
    reason ENUM('booked', 'owner_blocked', 'maintenance', 'seasonal_closure') DEFAULT 'owner_blocked',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_property (property_id),
    INDEX idx_booking (booking_id),
    INDEX idx_dates (unavailable_from, unavailable_to),
    INDEX idx_reason (reason)
);

-- 14. SUBSCRIPTION PLANS TABLE
CREATE TABLE subscription_plans (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_quarterly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    
    -- Features
    max_listings INT, -- NULL = unlimited
    featured_listings_per_month INT DEFAULT 0,
    priority_support BOOLEAN DEFAULT FALSE,
    verification_badge BOOLEAN DEFAULT FALSE,
    analytics_access BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,
    
    plan_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_order (plan_order)
);

-- 15. USER SUBSCRIPTIONS TABLE (Enhanced)
CREATE TABLE user_subscriptions (
    subscription_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    
    billing_period ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    status ENUM('active', 'expired', 'cancelled', 'pending_payment', 'suspended') DEFAULT 'active',
    
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EGP',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    
    auto_renew BOOLEAN DEFAULT TRUE,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    -- Usage tracking
    listings_used INT DEFAULT 0,
    featured_listings_used INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_plan (plan_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- 16. FEATURED LISTING PURCHASES TABLE
CREATE TABLE featured_purchases (
    purchase_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    
    duration_days INT NOT NULL,
    featured_from TIMESTAMP NOT NULL,
    featured_to TIMESTAMP NOT NULL,
    
    price_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EGP',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    
    -- Analytics
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    bookings_generated INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_dates (featured_from, featured_to)
);

-- 17. ADMIN ACTIVITY LOG TABLE (Enhanced)
CREATE TABLE admin_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    
    action_type ENUM(
        'approve_property', 'reject_property', 'suspend_property', 'delete_property',
        'ban_user', 'unban_user', 'suspend_user', 'verify_user',
        'approve_review', 'delete_review',
        'resolve_report', 'escalate_report',
        'refund_booking', 'cancel_booking',
        'update_subscription', 'grant_subscription',
        'system_config', 'other'
    ) NOT NULL,
    
    target_type ENUM('property', 'user', 'booking', 'review', 'report', 'subscription', 'system') NOT NULL,
    target_id INT,
    
    action_details TEXT,
    reason TEXT,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_action (action_type),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created (created_at)
);

-- 18. SEARCH HISTORY TABLE (Enhanced for Analytics)
CREATE TABLE search_history (
    search_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_id VARCHAR(100), -- For anonymous users
    
    -- Search parameters
    search_query VARCHAR(500),
    governorate VARCHAR(100),
    city VARCHAR(100),
    neighborhood VARCHAR(100),
    property_type VARCHAR(50),
    rental_type VARCHAR(50),
    
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    bedrooms INT,
    bathrooms INT,
    guests INT,
    
    check_in DATE,
    check_out DATE,
    
    amenities_searched TEXT, -- JSON array of amenity IDs
    
    -- Results
    results_count INT DEFAULT 0,
    results_shown INT DEFAULT 0,
    first_result_clicked INT, -- Position of first clicked result
    
    -- Analytics
    search_source ENUM('homepage', 'navbar', 'filters', 'mobile_app') DEFAULT 'homepage',
    device_type ENUM('desktop', 'mobile', 'tablet'),
    converted_to_booking BOOLEAN DEFAULT FALSE,
    conversion_booking_id INT,
    
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (conversion_booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_location (governorate, city),
    INDEX idx_dates (check_in, check_out),
    INDEX idx_searched (searched_at),
    INDEX idx_converted (converted_to_booking)
);

-- 19. PROPERTY VIEW TRACKING TABLE (New - Analytics)
CREATE TABLE property_views (
    view_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    user_id INT,
    session_id VARCHAR(100),
    
    -- Source tracking
    referrer_url VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- User info
    device_type ENUM('desktop', 'mobile', 'tablet'),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Engagement
    time_spent_seconds INT DEFAULT 0,
    images_viewed INT DEFAULT 0,
    scrolled_percent INT DEFAULT 0,
    contacted_owner BOOLEAN DEFAULT FALSE,
    saved_to_favorites BOOLEAN DEFAULT FALSE,
    shared BOOLEAN DEFAULT FALSE,
    
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_property (property_id),
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_viewed (viewed_at),
    INDEX idx_device (device_type),
    INDEX idx_utm (utm_source, utm_campaign)
);

-- 20. PAYMENT TRANSACTIONS TABLE (Enhanced)
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    
    -- Related entities
    booking_id INT,
    subscription_id INT,
    featured_purchase_id INT,
    
    transaction_type ENUM(
        'booking_payment', 'booking_deposit', 'booking_refund',
        'subscription_payment', 'subscription_refund',
        'featured_listing', 'featured_refund',
        'payout_to_owner', 'platform_fee',
        'penalty', 'bonus'
    ) NOT NULL,
    
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EGP',
    
    payment_method ENUM(
        'cash', 'credit_card', 'debit_card',
        'fawry', 'vodafone_cash', 'etisalat_cash',
        'bank_transfer', 'wallet', 'paypal', 'stripe'
    ) NOT NULL,
    
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    gateway_response TEXT, -- JSON response from gateway
    
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    failure_reason TEXT,
    
    -- Accounting
    platform_fee_amount DECIMAL(10, 2) DEFAULT 0,
    owner_payout_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Payout info (for owner payments)
    payout_status ENUM('pending', 'scheduled', 'sent', 'completed', 'failed') DEFAULT 'pending',
    payout_date DATE,
    payout_method VARCHAR(50),
    payout_account VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(subscription_id) ON DELETE SET NULL,
    FOREIGN KEY (featured_purchase_id) REFERENCES featured_purchases(purchase_id) ON DELETE SET NULL,
    INDEX idx_reference (transaction_reference),
    INDEX idx_user (user_id),
    INDEX idx_booking (booking_id),
    INDEX idx_subscription (subscription_id),
    INDEX idx_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_payout (payout_status),
    INDEX idx_created (created_at)
);

-- 21. USER BEHAVIOR ANALYTICS TABLE (New)
CREATE TABLE user_behavior_analytics (
    analytics_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_id VARCHAR(100) NOT NULL,
    
    -- Session info
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP,
    session_duration_seconds INT,
    
    -- Pages visited
    pages_visited INT DEFAULT 0,
    properties_viewed INT DEFAULT 0,
    searches_performed INT DEFAULT 0,
    
    -- Actions
    properties_favorited INT DEFAULT 0,
    properties_shared INT DEFAULT 0,
    booking_requests_sent INT DEFAULT 0,
    messages_sent INT DEFAULT 0,
    
    -- Conversion
    converted_to_booking BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10, 2),
    
    -- Technical
    device_type ENUM('desktop', 'mobile', 'tablet'),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(20),
    
    -- Location
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Entry/Exit
    landing_page VARCHAR(500),
    exit_page VARCHAR(500),
    referrer VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_device (device_type),
    INDEX idx_converted (converted_to_booking),
    INDEX idx_created (created_at)
);

-- 22. PLATFORM ANALYTICS SUMMARY TABLE (New - Daily aggregated data)
CREATE TABLE daily_platform_analytics (
    analytics_date DATE PRIMARY KEY,
    
    -- User metrics
    total_users INT DEFAULT 0,
    new_users_registered INT DEFAULT 0,
    active_users INT DEFAULT 0,
    verified_users INT DEFAULT 0,
    
    -- Property metrics
    total_properties INT DEFAULT 0,
    new_properties_listed INT DEFAULT 0,
    active_properties INT DEFAULT 0,
    properties_pending_approval INT DEFAULT 0,
    
    -- Booking metrics
    booking_requests INT DEFAULT 0,
    bookings_confirmed INT DEFAULT 0,
    bookings_cancelled INT DEFAULT 0,
    bookings_completed INT DEFAULT 0,
    
    -- Revenue metrics
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    booking_revenue DECIMAL(12, 2) DEFAULT 0,
    subscription_revenue DECIMAL(12, 2) DEFAULT 0,
    featured_revenue DECIMAL(12, 2) DEFAULT 0,
    platform_fees_collected DECIMAL(12, 2) DEFAULT 0,
    
    -- Engagement metrics
    total_searches INT DEFAULT 0,
    total_property_views INT DEFAULT 0,
    total_messages_sent INT DEFAULT 0,
    total_reviews_posted INT DEFAULT 0,
    
    -- Conversion metrics
    search_to_view_rate DECIMAL(5, 2) DEFAULT 0,
    view_to_contact_rate DECIMAL(5, 2) DEFAULT 0,
    contact_to_booking_rate DECIMAL(5, 2) DEFAULT 0,
    overall_conversion_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Average metrics
    avg_booking_value DECIMAL(10, 2) DEFAULT 0,
    avg_nightly_price DECIMAL(10, 2) DEFAULT 0,
    avg_booking_duration_days DECIMAL(5, 2) DEFAULT 0,
    avg_response_time_minutes INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (analytics_date)
);

-- 23. PROPERTY PERFORMANCE ANALYTICS TABLE (New)
CREATE TABLE property_performance_analytics (
    performance_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    analytics_date DATE NOT NULL,
    
    -- View metrics
    total_views INT DEFAULT 0,
    unique_views INT DEFAULT 0,
    avg_time_spent_seconds INT DEFAULT 0,
    
    -- Engagement metrics
    contact_clicks INT DEFAULT 0,
    favorite_adds INT DEFAULT 0,
    shares INT DEFAULT 0,
    booking_requests INT DEFAULT 0,
    
    -- Conversion metrics
    view_to_contact_rate DECIMAL(5, 2) DEFAULT 0,
    contact_to_booking_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Revenue
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    bookings_confirmed INT DEFAULT 0,
    
    -- Rankings
    search_impressions INT DEFAULT 0,
    avg_search_position DECIMAL(5, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_property_date (property_id, analytics_date),
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_date (analytics_date),
    INDEX idx_views (total_views),
    INDEX idx_revenue (revenue_generated)
);

-- 24. CITY/LOCATION ANALYTICS TABLE (New)
CREATE TABLE location_analytics (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    governorate VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    analytics_date DATE NOT NULL,
    
    -- Supply metrics
    total_properties INT DEFAULT 0,
    active_properties INT DEFAULT 0,
    new_properties_added INT DEFAULT 0,
    
    -- Demand metrics
    total_searches INT DEFAULT 0,
    total_views INT DEFAULT 0,
    booking_requests INT DEFAULT 0,
    bookings_confirmed INT DEFAULT 0,
    
    -- Pricing
    avg_price_per_night DECIMAL(10, 2) DEFAULT 0,
    min_price DECIMAL(10, 2) DEFAULT 0,
    max_price DECIMAL(10, 2) DEFAULT 0,
    
    -- Occupancy
    occupancy_rate DECIMAL(5, 2) DEFAULT 0,
    avg_booking_duration DECIMAL(5, 2) DEFAULT 0,
    
    -- Popularity score (calculated)
    popularity_score DECIMAL(5, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_location_date (governorate, city, analytics_date),
    INDEX idx_location (governorate, city),
    INDEX idx_date (analytics_date),
    INDEX idx_popularity (popularity_score)
);

-- 25. EMAIL CAMPAIGNS TABLE (New - for marketing)
CREATE TABLE email_campaigns (
    campaign_id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type ENUM('promotional', 'transactional', 'newsletter', 'announcement', 'reminder') NOT NULL,
    
    subject_ar VARCHAR(255) NOT NULL,
    subject_en VARCHAR(255) NOT NULL,
    content_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    
    -- Targeting
    target_user_type ENUM('all', 'renters', 'landlords', 'brokers', 'inactive') DEFAULT 'all',
    target_locations TEXT, -- JSON array of cities
    
    -- Scheduling
    status ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled') DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    
    -- Analytics
    total_recipients INT DEFAULT 0,
    emails_sent INT DEFAULT 0,
    emails_delivered INT DEFAULT 0,
    emails_opened INT DEFAULT 0,
    emails_clicked INT DEFAULT 0,
    emails_bounced INT DEFAULT 0,
    unsubscribed INT DEFAULT 0,
    
    -- Rates
    open_rate DECIMAL(5, 2) DEFAULT 0,
    click_rate DECIMAL(5, 2) DEFAULT 0,
    bounce_rate DECIMAL(5, 2) DEFAULT 0,
    
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_type (campaign_type),
    INDEX idx_scheduled (scheduled_at)
);

-- 26. EMAIL CAMPAIGN RECIPIENTS TABLE (New)
CREATE TABLE email_campaign_recipients (
    recipient_id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_id INT NOT NULL,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    status ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed') DEFAULT 'pending',
    
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    first_click_at TIMESTAMP,
    clicks_count INT DEFAULT 0,
    
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns(campaign_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_campaign (campaign_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- 27. PROMOTION CODES TABLE (New - for discounts)
CREATE TABLE promotion_codes (
    promo_id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2), -- For percentage discounts
    min_booking_amount DECIMAL(10, 2), -- Minimum booking value to use promo
    
    -- Validity
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    max_uses INT, -- NULL = unlimited
    max_uses_per_user INT DEFAULT 1,
    times_used INT DEFAULT 0,
    
    -- Restrictions
    applicable_to ENUM('all', 'first_booking', 'specific_properties', 'specific_cities') DEFAULT 'all',
    restricted_property_ids TEXT, -- JSON array
    restricted_cities TEXT, -- JSON array
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_validity (valid_from, valid_to)
);

-- 28. PROMOTION CODE USAGE TABLE (New)
CREATE TABLE promotion_code_usage (
    usage_id INT PRIMARY KEY AUTO_INCREMENT,
    promo_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    
    discount_amount DECIMAL(10, 2) NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    final_amount DECIMAL(10, 2) NOT NULL,
    
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (promo_id) REFERENCES promotion_codes(promo_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_promo (promo_id),
    INDEX idx_user (user_id),
    INDEX idx_booking (booking_id),
    INDEX idx_used (used_at)
);

-- 29. A/B TESTING EXPERIMENTS TABLE (New)
CREATE TABLE ab_experiments (
    experiment_id INT PRIMARY KEY AUTO_INCREMENT,
    experiment_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    experiment_type ENUM('ui_change', 'pricing', 'email', 'feature', 'algorithm') NOT NULL,
    
    -- Variants
    control_variant JSON NOT NULL, -- Configuration for control
    test_variant JSON NOT NULL, -- Configuration for test
    
    traffic_split_percent INT DEFAULT 50, -- % of users in test variant
    
    -- Metrics to track
    primary_metric VARCHAR(100) NOT NULL, -- e.g., 'conversion_rate', 'booking_value'
    success_criteria TEXT,
    
    status ENUM('draft', 'running', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
    
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Results
    control_sample_size INT DEFAULT 0,
    test_sample_size INT DEFAULT 0,
    control_metric_value DECIMAL(10, 4) DEFAULT 0,
    test_metric_value DECIMAL(10, 4) DEFAULT 0,
    statistical_significance DECIMAL(5, 4), -- p-value
    winner ENUM('control', 'test', 'no_difference'),
    
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- 30. A/B TEST PARTICIPANTS TABLE (New)
CREATE TABLE ab_test_participants (
    participant_id INT PRIMARY KEY AUTO_INCREMENT,
    experiment_id INT NOT NULL,
    user_id INT,
    session_id VARCHAR(100) NOT NULL,
    
    variant ENUM('control', 'test') NOT NULL,
    
    -- Outcome tracking
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10, 2),
    conversion_timestamp TIMESTAMP,
    
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (experiment_id) REFERENCES ab_experiments(experiment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_experiment (experiment_id),
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_variant (variant),
    INDEX idx_converted (converted)
);

-- 31. SYSTEM SETTINGS TABLE (New)
CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category ENUM('general', 'payment', 'email', 'sms', 'security', 'features') DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend
    
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_key (setting_key),
    INDEX idx_category (category),
    INDEX idx_public (is_public)
);

-- 32. API KEYS TABLE (New - for third-party integrations)
CREATE TABLE api_keys (
    api_key_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_secret VARCHAR(64) NOT NULL,
    
    permissions JSON, -- Array of allowed endpoints/actions
    rate_limit_per_hour INT DEFAULT 1000,
    
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    usage_count INT DEFAULT 0,
    
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_key (api_key),
    INDEX idx_active (is_active)
);

-- 33. API USAGE LOGS TABLE (New)
CREATE TABLE api_usage_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    api_key_id INT NOT NULL,
    
    endpoint VARCHAR(255) NOT NULL,
    method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL,
    request_params TEXT,
    
    response_status INT NOT NULL,
    response_time_ms INT,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (api_key_id) REFERENCES api_keys(api_key_id) ON DELETE CASCADE,
    INDEX idx_api_key (api_key_id),
    INDEX idx_endpoint (endpoint),
    INDEX idx_status (response_status),
    INDEX idx_created (created_at)
);

-- ============================================
-- INITIAL DATA: AMENITIES
-- ============================================

INSERT INTO amenities (name_ar, name_en, icon, category, is_popular, display_order) VALUES
-- Basic
('واي فاي', 'WiFi', 'wifi', 'basic', TRUE, 1),
('تكييف', 'Air Conditioning', 'ac', 'basic', TRUE, 2),
('تدفئة', 'Heating', 'heat', 'basic', FALSE, 3),
('مصعد', 'Elevator', 'elevator', 'basic', FALSE, 4),
('موقف سيارات', 'Parking', 'parking', 'basic', TRUE, 5),
('مولد كهرباء', 'Generator', 'generator', 'basic', FALSE, 6),

-- Kitchen
('مطبخ كامل', 'Full Kitchen', 'kitchen', 'kitchen', TRUE, 1),
('ثلاجة', 'Refrigerator', 'fridge', 'kitchen', TRUE, 2),
('غسالة أطباق', 'Dishwasher', 'dishwasher', 'kitchen', FALSE, 3),
('ميكروويف', 'Microwave', 'microwave', 'kitchen', FALSE, 4),
('فرن', 'Oven', 'oven', 'kitchen', FALSE, 5),
('غلاية', 'Kettle', 'kettle', 'kitchen', FALSE, 6),

-- Entertainment
('تلفزيون', 'TV', 'tv', 'entertainment', TRUE, 1),
('تلفزيون ذكي', 'Smart TV', 'smart-tv', 'entertainment', FALSE, 2),
('نتفليكس', 'Netflix', 'netflix', 'entertainment', FALSE, 3),
('إنترنت عالي السرعة', 'High-Speed Internet', 'fast-wifi', 'entertainment', TRUE, 4),

-- Outdoor
('بلكونة', 'Balcony', 'balcony', 'outdoor', TRUE, 1),
('تراس', 'Terrace', 'terrace', 'outdoor', FALSE, 2),
('حديقة', 'Garden', 'garden', 'outdoor', FALSE, 3),
('إطلالة على البحر', 'Sea View', 'sea', 'outdoor', TRUE, 4),
('حمام سباحة', 'Swimming Pool', 'pool', 'outdoor', TRUE, 5),
('حمام سباحة خاص', 'Private Pool', 'private-pool', 'outdoor', FALSE, 6),
('شاطئ خاص', 'Private Beach', 'beach', 'outdoor', TRUE, 7),
('منطقة شواء', 'BBQ Area', 'bbq', 'outdoor', FALSE, 8),

-- Safety
('كاميرات مراقبة', 'Security Cameras', 'camera', 'safety', FALSE, 1),
('حارس أمن', 'Security Guard', 'guard', 'safety', FALSE, 2),
('كاشف دخان', 'Smoke Detector', 'smoke', 'safety', FALSE, 3),
('إسعافات أولية', 'First Aid Kit', 'firstaid', 'safety', FALSE, 4),
('طفاية حريق', 'Fire Extinguisher', 'extinguisher', 'safety', FALSE, 5),
('خزنة', 'Safe Box', 'safe', 'safety', FALSE, 6),

-- Location
('قريب من البحر', 'Near Beach', 'beach-close', 'location', TRUE, 1),
('قريب من المواصلات', 'Near Transport', 'transport', 'location', FALSE, 2),
('قريب من المحلات', 'Near Shops', 'shop', 'location', TRUE, 3),
('قريب من المطاعم', 'Near Restaurants', 'restaurant', 'location', TRUE, 4),
('منطقة هادئة', 'Quiet Area', 'quiet', 'location', FALSE, 5),

-- Accessibility
('مناسب لذوي الاحتياجات الخاصة', 'Wheelchair Accessible', 'wheelchair', 'accessibility', FALSE, 1),
('مصعد للكراسي المتحركة', 'Wheelchair Elevator', 'accessible-elevator', 'accessibility', FALSE, 2),
('حمام مناسب لذوي الاحتياجات', 'Accessible Bathroom', 'accessible-bath', 'accessibility', FALSE, 3);

-- ============================================
-- INITIAL DATA: SUBSCRIPTION PLANS
-- ============================================

INSERT INTO subscription_plans (
    name_ar, name_en, description_ar, description_en,
    price_monthly, price_quarterly, price_yearly,
    max_listings, featured_listings_per_month,
    priority_support, verification_badge, analytics_access,
    plan_order, is_popular
) VALUES
(
    'مجاني', 'Free',
    'خطة مجانية للبدء والتجربة', 'Free plan to get started',
    0, 0, 0,
    3, 0,
    FALSE, FALSE, FALSE,
    1, FALSE
),
(
    'أساسي', 'Basic',
    'مثالي للملاك الجدد والسماسرة', 'Perfect for new landlords and brokers',
    199, 540, 1990,
    10, 1,
    FALSE, TRUE, FALSE,
    2, FALSE
),
(
    'احترافي', 'Professional',
    'للملاك المحترفين وأصحاب العقارات المتعددة', 'For professional landlords with multiple properties',
    499, 1350, 4990,
    NULL, 5,
    TRUE, TRUE, TRUE,
    3, TRUE
),
(
    'شركات', 'Enterprise',
    'للشركات العقارية والوكالات الكبرى', 'For real estate companies and large agencies',
    999, 2700, 9990,
    NULL, 20,
    TRUE, TRUE, TRUE,
    4, FALSE
);

-- ============================================
-- INITIAL DATA: SYSTEM SETTINGS
-- ============================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('platform_commission_percent', '10', 'number', 'payment', 'Platform commission percentage on bookings', FALSE),
('min_booking_days', '1', 'number', 'general', 'Minimum rental days allowed', TRUE),
('max_booking_days', '365', 'number', 'general', 'Maximum rental days allowed', TRUE),
('default_currency', 'EGP', 'string', 'general', 'Default platform currency', TRUE),
('support_email', 'support@ajarly.com', 'string', 'general', 'Customer support email', TRUE),
('support_phone', '+20 123 456 7890', 'string', 'general', 'Customer support phone', TRUE),
('booking_auto_reject_hours', '48', 'number', 'general', 'Hours before auto-rejecting pending bookings', FALSE),
('enable_instant_booking', 'true', 'boolean', 'features', 'Allow instant booking feature', TRUE),
('enable_reviews', 'true', 'boolean', 'features', 'Enable reviews and ratings', TRUE),
('enable_messaging', 'true', 'boolean', 'features', 'Enable in-app messaging', TRUE),
('min_review_rating', '1', 'number', 'general', 'Minimum review rating', TRUE),
('max_review_rating', '5', 'number', 'general', 'Maximum review rating', TRUE),
('featured_listing_price_per_week', '100', 'number', 'payment', 'Price for featuring a listing per week (EGP)', FALSE),
('cancellation_fee_percent', '20', 'number', 'payment', 'Cancellation fee percentage', FALSE);

-- ============================================
-- VIEWS FOR COMMON REPORTS
-- ============================================

-- View: Property Performance Summary
CREATE VIEW vw_property_performance AS
SELECT 
    p.property_id,
    p.title_ar,
    p.title_en,
    p.governorate,
    p.city,
    u.first_name AS owner_name,
    u.phone_number AS owner_phone,
    p.status,
    p.view_count,
    p.booking_confirmed_count,
    p.average_rating,
    p.total_reviews,
    p.favorite_count,
    p.is_featured,
    p.price_per_night,
    COALESCE(SUM(b.total_price), 0) AS total_revenue,
    p.created_at,
    p.last_booked_at
FROM properties p
LEFT JOIN users u ON p.owner_id = u.user_id
LEFT JOIN bookings b ON p.property_id = b.property_id AND b.status = 'completed'
GROUP BY p.property_id;

-- View: User Statistics
CREATE VIEW vw_user_statistics AS
SELECT 
    u.user_id,
    u.email,
    u.phone_number,
    u.first_name,
    u.last_name,
    u.user_type,
    u.national_id_verified,
    u.is_active,
    COUNT(DISTINCT p.property_id) AS total_properties,
    COUNT(DISTINCT CASE WHEN b.renter_id = u.user_id THEN b.booking_id END) AS bookings_as_renter,
    COUNT(DISTINCT CASE WHEN b.owner_id = u.user_id THEN b.booking_id END) AS bookings_as_owner,
    COUNT(DISTINCT r.review_id) AS reviews_given,
    AVG(CASE WHEN r2.reviewee_id = u.user_id THEN r2.overall_rating END) AS avg_rating_received,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN properties p ON u.user_id = p.owner_id
LEFT JOIN bookings b ON u.user_id = b.renter_id OR u.user_id = b.owner_id
LEFT JOIN reviews r ON u.user_id = r.reviewer_id
LEFT JOIN reviews r2 ON u.user_id = r2.reviewee_id
GROUP BY u.user_id;

-- View: Booking Revenue Report
CREATE VIEW vw_booking_revenue AS
SELECT 
    b.booking_id,
    b.booking_reference,
    b.check_in_date,
    b.check_out_date,
    p.title_ar AS property_title,
    p.governorate,
    p.city,
    owner.first_name AS owner_name,
    renter.first_name AS renter_name,
    b.total_price,
    b.service_fee,
    b.status,
    b.payment_status,
    b.requested_at
FROM bookings b
JOIN properties p ON b.property_id = p.property_id
JOIN users owner ON b.owner_id = owner.user_id
JOIN users renter ON b.renter_id = renter.user_id;

-- View: Top Performing Properties
CREATE VIEW vw_top_properties AS
SELECT 
    p.property_id,
    p.title_ar,
    p.governorate,
    p.city,
    p.property_type,
    p.view_count,
    p.booking_confirmed_count,
    p.average_rating,
    p.total_reviews,
    p.price_per_night,
    COALESCE(SUM(b.total_price), 0) AS total_revenue,
    ROUND((p.booking_confirmed_count * 100.0 / NULLIF(p.view_count, 0)), 2) AS conversion_rate
FROM properties p
LEFT JOIN bookings b ON p.property_id = b.property_id AND b.status = 'completed'
WHERE p.status = 'active'
GROUP BY p.property_id
ORDER BY total_revenue DESC;

-- View: Popular Locations
CREATE VIEW vw_popular_locations AS
SELECT 
    governorate,
    city,
    COUNT(DISTINCT property_id) AS total_properties,
    COUNT(DISTINCT CASE WHEN status = 'active' THEN property_id END) AS active_properties,
    AVG(price_per_night) AS avg_price,
    AVG(average_rating) AS avg_rating,
    SUM(view_count) AS total_views,
    SUM(booking_confirmed_count) AS total_bookings
FROM properties
GROUP BY governorate, city
ORDER BY total_bookings DESC;

-- View: Monthly Revenue Report
CREATE VIEW vw_monthly_revenue AS
SELECT 
    DATE_FORMAT(b.requested_at, '%Y-%m') AS month,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN b.status IN ('cancelled_by_renter', 'cancelled_by_owner') THEN 1 ELSE 0 END) AS cancelled_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN b.total_price ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN b.status = 'completed' THEN b.service_fee ELSE 0 END) AS platform_fees,
    AVG(CASE WHEN b.status = 'completed' THEN b.total_price END) AS avg_booking_value
FROM bookings b
GROUP BY DATE_FORMAT(b.requested_at, '%Y-%m')
ORDER BY month DESC;

-- View: User Activity Summary
CREATE VIEW vw_user_activity AS
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.user_type,
    u.created_at AS registration_date,
    u.last_login,
    DATEDIFF(NOW(), u.last_login) AS days_since_last_login,
    COUNT(DISTINCT pv.view_id) AS properties_viewed,
    COUNT(DISTINCT f.favorite_id) AS properties_favorited,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(DISTINCT m.message_id) AS messages_sent,
    CASE 
        WHEN DATEDIFF(NOW(), u.last_login) <= 7 THEN 'active'
        WHEN DATEDIFF(NOW(), u.last_login) <= 30 THEN 'moderate'
        ELSE 'inactive'
    END AS activity_status
FROM users u
LEFT JOIN property_views pv ON u.user_id = pv.user_id
LEFT JOIN favorites f ON u.user_id = f.user_id
LEFT JOIN bookings b ON u.user_id = b.renter_id
LEFT JOIN messages m ON u.user_id = m.sender_id
GROUP BY u.user_id;

-- View: Search Analytics Summary
CREATE VIEW vw_search_analytics AS
SELECT 
    DATE(searched_at) AS search_date,
    governorate,
    city,
    property_type,
    COUNT(*) AS total_searches,
    AVG(results_count) AS avg_results,
    SUM(CASE WHEN converted_to_booking THEN 1 ELSE 0 END) AS conversions,
    ROUND((SUM(CASE WHEN converted_to_booking THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) AS conversion_rate
FROM search_history
GROUP BY DATE(searched_at), governorate, city, property_type
ORDER BY search_date DESC, total_searches DESC;

-- View: Owner Dashboard Stats
CREATE VIEW vw_owner_dashboard AS
SELECT 
    u.user_id AS owner_id,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT p.property_id) AS total_properties,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.property_id END) AS active_properties,
    SUM(p.view_count) AS total_views,
    SUM(p.favorite_count) AS total_favorites,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.booking_id END) AS pending_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) AS confirmed_bookings,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_price END), 0) AS total_earnings,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.service_fee END), 0) AS platform_fees_paid,
    AVG(r.overall_rating) AS avg_rating,
    COUNT(DISTINCT r.review_id) AS total_reviews
FROM users u
LEFT JOIN properties p ON u.user_id = p.owner_id
LEFT JOIN bookings b ON p.property_id = b.property_id
LEFT JOIN reviews r ON p.property_id = r.property_id
WHERE u.user_type IN ('landlord', 'broker')
GROUP BY u.user_id;

-- View: Admin Dashboard Overview
CREATE VIEW vw_admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS total_active_users,
    (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS new_users_last_30_days,
    (SELECT COUNT(*) FROM properties WHERE status = 'active') AS active_properties,
    (SELECT COUNT(*) FROM properties WHERE status = 'pending_approval') AS properties_pending_approval,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE requested_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS bookings_last_30_days,
    (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed' AND completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS revenue_last_30_days,
    (SELECT COALESCE(SUM(service_fee), 0) FROM bookings WHERE status = 'completed' AND completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS platform_fees_last_30_days,
    (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports,
    (SELECT COUNT(*) FROM reviews WHERE is_approved = FALSE) AS reviews_pending_approval;

-- ============================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================

-- Procedure: Update Property Statistics
DELIMITER //
CREATE PROCEDURE sp_update_property_stats(IN p_property_id INT)
BEGIN
    UPDATE properties p
    SET 
        booking_confirmed_count = (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE property_id = p_property_id 
            AND status = 'confirmed'
        ),
        average_rating = (
            SELECT COALESCE(AVG(overall_rating), 0)
            FROM reviews
            WHERE property_id = p_property_id
            AND is_approved = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE property_id = p_property_id
            AND is_approved = TRUE
        ),
        favorite_count = (
            SELECT COUNT(*)
            FROM favorites
            WHERE property_id = p_property_id
        ),
        last_booked_at = (
            SELECT MAX(requested_at)
            FROM bookings
            WHERE property_id = p_property_id
            AND status IN ('confirmed', 'completed')
        )
    WHERE property_id = p_property_id;
END //
DELIMITER ;

-- Procedure: Calculate Daily Platform Analytics
DELIMITER //
CREATE PROCEDURE sp_calculate_daily_analytics(IN p_date DATE)
BEGIN
    INSERT INTO daily_platform_analytics (
        analytics_date,
        total_users,
        new_users_registered,
        active_users,
        verified_users,
        total_properties,
        new_properties_listed,
        active_properties,
        properties_pending_approval,
        booking_requests,
        bookings_confirmed,
        bookings_cancelled,
        bookings_completed,
        total_revenue,
        booking_revenue,
        subscription_revenue,
        featured_revenue,
        platform_fees_collected,
        total_searches,
        total_property_views,
        total_messages_sent,
        total_reviews_posted
    )
    SELECT
        p_date,
        (SELECT COUNT(*) FROM users WHERE created_at <= p_date),
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = p_date),
        (SELECT COUNT(*) FROM users WHERE DATE(last_login) = p_date),
        (SELECT COUNT(*) FROM users WHERE national_id_verified = TRUE AND verified_at <= p_date),
        (SELECT COUNT(*) FROM properties WHERE created_at <= p_date),
        (SELECT COUNT(*) FROM properties WHERE DATE(created_at) = p_date),
        (SELECT COUNT(*) FROM properties WHERE status = 'active' AND created_at <= p_date),
        (SELECT COUNT(*) FROM properties WHERE status = 'pending_approval' AND created_at <= p_date),
        (SELECT COUNT(*) FROM bookings WHERE DATE(requested_at) = p_date),
        (SELECT COUNT(*) FROM bookings WHERE DATE(confirmed_at) = p_date),
        (SELECT COUNT(*) FROM bookings WHERE DATE(cancelled_at) = p_date),
        (SELECT COUNT(*) FROM bookings WHERE DATE(completed_at) = p_date),
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE DATE(completed_at) = p_date AND status = 'completed'),
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE DATE(completed_at) = p_date AND transaction_type = 'booking_payment' AND status = 'completed'),
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE DATE(completed_at) = p_date AND transaction_type = 'subscription_payment' AND status = 'completed'),
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE DATE(completed_at) = p_date AND transaction_type = 'featured_listing' AND status = 'completed'),
        (SELECT COALESCE(SUM(service_fee), 0) FROM bookings WHERE DATE(completed_at) = p_date AND status = 'completed'),
        (SELECT COUNT(*) FROM search_history WHERE DATE(searched_at) = p_date),
        (SELECT COUNT(*) FROM property_views WHERE DATE(viewed_at) = p_date),
        (SELECT COUNT(*) FROM messages WHERE DATE(created_at) = p_date),
        (SELECT COUNT(*) FROM reviews WHERE DATE(created_at) = p_date)
    ON DUPLICATE KEY UPDATE
        total_users = VALUES(total_users),
        new_users_registered = VALUES(new_users_registered),
        active_users = VALUES(active_users),
        verified_users = VALUES(verified_users),
        total_properties = VALUES(total_properties),
        new_properties_listed = VALUES(new_properties_listed),
        active_properties = VALUES(active_properties),
        properties_pending_approval = VALUES(properties_pending_approval),
        booking_requests = VALUES(booking_requests),
        bookings_confirmed = VALUES(bookings_confirmed),
        bookings_cancelled = VALUES(bookings_cancelled),
        bookings_completed = VALUES(bookings_completed),
        total_revenue = VALUES(total_revenue),
        booking_revenue = VALUES(booking_revenue),
        subscription_revenue = VALUES(subscription_revenue),
        featured_revenue = VALUES(featured_revenue),
        platform_fees_collected = VALUES(platform_fees_collected),
        total_searches = VALUES(total_searches),
        total_property_views = VALUES(total_property_views),
        total_messages_sent = VALUES(total_messages_sent),
        total_reviews_posted = VALUES(total_reviews_posted);
END //
DELIMITER ;

-- Procedure: Get Property Availability
DELIMITER //
CREATE PROCEDURE sp_check_property_availability(
    IN p_property_id INT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    OUT p_is_available BOOLEAN
)
BEGIN
    DECLARE conflict_count INT;
    
    SELECT COUNT(*) INTO conflict_count
    FROM unavailable_dates
    WHERE property_id = p_property_id
    AND (
        (unavailable_from <= p_check_in AND unavailable_to >= p_check_in)
        OR (unavailable_from <= p_check_out AND unavailable_to >= p_check_out)
        OR (unavailable_from >= p_check_in AND unavailable_to <= p_check_out)
    );
    
    IF conflict_count > 0 THEN
        SET p_is_available = FALSE;
    ELSE
        SET p_is_available = TRUE;
    END IF;
END //
DELIMITER ;

-- Procedure: Calculate Property Performance
DELIMITER //
CREATE PROCEDURE sp_calculate_property_performance(
    IN p_property_id INT,
    IN p_date DATE
)
BEGIN
    INSERT INTO property_performance_analytics (
        property_id,
        analytics_date,
        total_views,
        unique_views,
        avg_time_spent_seconds,
        contact_clicks,
        favorite_adds,
        shares,
        booking_requests,
        bookings_confirmed,
        revenue_generated,
        search_impressions
    )
    SELECT
        p_property_id,
        p_date,
        COUNT(*),
        COUNT(DISTINCT COALESCE(user_id, session_id)),
        AVG(time_spent_seconds),
        SUM(CASE WHEN contacted_owner THEN 1 ELSE 0 END),
        SUM(CASE WHEN saved_to_favorites THEN 1 ELSE 0 END),
        SUM(CASE WHEN shared THEN 1 ELSE 0 END),
        (SELECT COUNT(*) FROM bookings WHERE property_id = p_property_id AND DATE(requested_at) = p_date),
        (SELECT COUNT(*) FROM bookings WHERE property_id = p_property_id AND DATE(confirmed_at) = p_date),
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE property_id = p_property_id AND DATE(completed_at) = p_date AND status = 'completed'),
        (SELECT COUNT(*) FROM search_history sh WHERE DATE(searched_at) = p_date AND results_count > 0)
    FROM property_views
    WHERE property_id = p_property_id
    AND DATE(viewed_at) = p_date
    ON DUPLICATE KEY UPDATE
        total_views = VALUES(total_views),
        unique_views = VALUES(unique_views),
        avg_time_spent_seconds = VALUES(avg_time_spent_seconds),
        contact_clicks = VALUES(contact_clicks),
        favorite_adds = VALUES(favorite_adds),
        shares = VALUES(shares),
        booking_requests = VALUES(booking_requests),
        bookings_confirmed = VALUES(bookings_confirmed),
        revenue_generated = VALUES(revenue_generated),
        search_impressions = VALUES(search_impressions);
        
    -- Calculate conversion rates
    UPDATE property_performance_analytics
    SET 
        view_to_contact_rate = (contact_clicks * 100.0 / NULLIF(total_views, 0)),
        contact_to_booking_rate = (bookings_confirmed * 100.0 / NULLIF(contact_clicks, 0))
    WHERE property_id = p_property_id
    AND analytics_date = p_date;
END //
DELIMITER ;

-- Procedure: Auto-expire pending bookings
DELIMITER //
CREATE PROCEDURE sp_auto_expire_bookings()
BEGIN
    UPDATE bookings
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
    
    -- Log the action
    INSERT INTO admin_logs (admin_id, action_type, target_type, target_id, action_details)
    SELECT 
        1, -- System admin ID
        'cancel_booking',
        'booking',
        booking_id,
        'Auto-expired due to no owner response'
    FROM bookings
    WHERE status = 'expired'
    AND updated_at = NOW();
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update property stats after booking confirmation
DELIMITER //
CREATE TRIGGER trg_after_booking_confirm
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        -- Add to unavailable dates
        INSERT INTO unavailable_dates (property_id, booking_id, unavailable_from, unavailable_to, reason)
        VALUES (NEW.property_id, NEW.booking_id, NEW.check_in_date, NEW.check_out_date, 'booked');
        
        -- Update property stats
        UPDATE properties
        SET booking_confirmed_count = booking_confirmed_count + 1,
            last_booked_at = NOW()
        WHERE property_id = NEW.property_id;
        
        -- Update owner stats
        UPDATE users
        SET total_bookings = total_bookings + 1
        WHERE user_id = NEW.owner_id;
    END IF;
END //
DELIMITER ;

-- Trigger: Update property stats after review approval
DELIMITER //
CREATE TRIGGER trg_after_review_approve
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    IF NEW.is_approved = TRUE AND OLD.is_approved = FALSE THEN
        UPDATE properties p
        SET 
            average_rating = (
                SELECT AVG(overall_rating)
                FROM reviews
                WHERE property_id = NEW.property_id
                AND is_approved = TRUE
            ),
            total_reviews = (
                SELECT COUNT(*)
                FROM reviews
                WHERE property_id = NEW.property_id
                AND is_approved = TRUE
            )
        WHERE property_id = NEW.property_id;
    END IF;
END //
DELIMITER ;

-- Trigger: Send notification after new booking
DELIMITER //
CREATE TRIGGER trg_after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO notifications (
        user_id, type,
        title_ar, title_en,
        message_ar, message_en,
        related_booking_id, related_property_id
    ) VALUES (
        NEW.owner_id,
        'booking_request',
        'طلب حجز جديد',
        'New Booking Request',
        CONCAT('لديك طلب حجز جديد لعقار ', (SELECT title_ar FROM properties WHERE property_id = NEW.property_id)),
        CONCAT('You have a new booking request for ', (SELECT title_en FROM properties WHERE property_id = NEW.property_id)),
        NEW.booking_id,
        NEW.property_id
    );
END //
DELIMITER ;

-- Trigger: Increment property view counter
DELIMITER //
CREATE TRIGGER trg_after_property_view
AFTER INSERT ON property_views
FOR EACH ROW
BEGIN
    UPDATE properties
    SET 
        view_count = view_count + 1,
        unique_view_count = unique_view_count + (CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END),
        last_viewed_at = NOW()
    WHERE property_id = NEW.property_id;
END //
DELIMITER ;

-- Trigger: Update promo code usage count
DELIMITER //
CREATE TRIGGER trg_after_promo_use
AFTER INSERT ON promotion_code_usage
FOR EACH ROW
BEGIN
    UPDATE promotion_codes
    SET times_used = times_used + 1
    WHERE promo_id = NEW.promo_id;
END //
DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_bookings_date_status ON bookings(check_in_date, check_out_date, status);
CREATE INDEX idx_properties_location_type ON properties(governorate, city, property_type, status);
CREATE INDEX idx_properties_price_rating ON properties(price_per_night, average_rating, status);
CREATE INDEX idx_reviews_property_approved ON reviews(property_id, is_approved, overall_rating);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at, status);
CREATE INDEX idx_messages_conversation_read ON messages(conversation_id, is_read, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_property_views_date ON property_views(viewed_at, property_id);
CREATE INDEX idx_search_date_location ON search_history(searched_at, governorate, city);

-- ============================================
-- SAMPLE ANALYTICAL QUERIES
-- ============================================

-- Query 1: Top 10 Most Popular Properties This Month
/*
SELECT 
    p.property_id,
    p.title_ar,
    p.governorate,
    p.city,
    COUNT(DISTINCT pv.view_id) AS views_this_month,
    COUNT(DISTINCT b.booking_id) AS bookings_this_month,
    COALESCE(SUM(b.total_price), 0) AS revenue_this_month,
    p.average_rating
FROM properties p
LEFT JOIN property_views pv ON p.property_id = pv.property_id 
    AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
LEFT JOIN bookings b ON p.property_id = b.property_id 
    AND b.requested_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND b.status = 'completed'
WHERE p.status = 'active'
GROUP BY p.property_id
ORDER BY views_this_month DESC
LIMIT 10;
*/

-- Query 2: Conversion Funnel Analysis
/*
SELECT 
    COUNT(DISTINCT sh.session_id) AS total_searches,
    COUNT(DISTINCT pv.session_id) AS users_viewed_property,
    COUNT(DISTINCT CASE WHEN pv.contacted_owner THEN pv.session_id END) AS users_contacted,
    COUNT(DISTINCT b.booking_id) AS booking_requests,
    COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) AS confirmed_bookings,
    ROUND(COUNT(DISTINCT pv.session_id) * 100.0 / COUNT(DISTINCT sh.session_id), 2) AS search_to_view_rate,
    ROUND(COUNT(DISTINCT CASE WHEN pv.contacted_owner THEN pv.session_id END) * 100.0 / COUNT(DISTINCT pv.session_id), 2) AS view_to_contact_rate,
    ROUND(COUNT(DISTINCT b.booking_id) * 100.0 / COUNT(DISTINCT CASE WHEN pv.contacted_owner THEN pv.session_id END), 2) AS contact_to_request_rate,
    ROUND(COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) * 100.0 / COUNT(DISTINCT b.booking_id), 2) AS request_to_confirm_rate
FROM search_history sh
LEFT JOIN property_views pv ON sh.session_id = pv.session_id
LEFT JOIN bookings b ON sh.session_id = (SELECT session_id FROM user_behavior_analytics WHERE user_id = b.renter_id LIMIT 1)
WHERE sh.searched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
*/

-- Query 3: Revenue By Location (Last 3 Months)
/*
SELECT 
    p.governorate,
    p.city,
    COUNT(DISTINCT p.property_id) AS total_properties,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    SUM(b.total_price) AS total_revenue,
    AVG(b.total_price) AS avg_booking_value,
    AVG(p.average_rating) AS avg_property_rating
FROM properties p
INNER JOIN bookings b ON p.property_id = b.property_id
WHERE b.status = 'completed'
AND b.completed_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY p.governorate, p.city
ORDER BY total_revenue DESC;
*/

-- Query 4: User Retention Analysis
/*
SELECT 
    DATE_FORMAT(u.created_at, '%Y-%m') AS cohort_month,
    COUNT(DISTINCT u.user_id) AS total_users,
    COUNT(DISTINCT CASE WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.user_id END) AS active_last_30_days,
    ROUND(COUNT(DISTINCT CASE WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.user_id END) * 100.0 / COUNT(DISTINCT u.user_id), 2) AS retention_rate
FROM users u
GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
ORDER BY cohort_month DESC;
*/

-- Query 5: Peak Booking Seasons
/*
SELECT 
    MONTH(check_in_date) AS month,
    MONTHNAME(check_in_date) AS month_name,
    COUNT(*) AS total_bookings,
    AVG(total_price) AS avg_booking_value,
    SUM(total_price) AS total_revenue
FROM bookings
WHERE status IN ('confirmed', 'completed')
AND check_in_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY MONTH(check_in_date), MONTHNAME(check_in_date)
ORDER BY total_bookings DESC;
*/

-- ============================================
-- END OF SCHEMA
-- ============================================
