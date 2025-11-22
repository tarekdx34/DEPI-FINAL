-- ============================================
-- AJARLY - Important SQL Queries for API Endpoints
-- ============================================

-- ===========================================
-- 1. SEARCH PROPERTIES WITH FILTERS
-- ===========================================
-- Parameters: governorate, city, check_in, check_out, bedrooms, min_price, max_price, property_type, guests, amenities[]

SELECT 
    p.*,
    u.first_name AS owner_name,
    u.phone_number AS owner_phone,
    u.response_rate AS owner_response_rate,
    u.average_response_time AS owner_response_time,
    (SELECT image_url FROM property_images WHERE property_id = p.property_id AND is_cover = TRUE LIMIT 1) AS cover_image,
    (SELECT COUNT(*) FROM property_images WHERE property_id = p.property_id) AS total_images,
    (SELECT COUNT(*) FROM reviews WHERE property_id = p.property_id AND is_approved = TRUE) AS reviews_count,
    -- Check availability
    NOT EXISTS (
        SELECT 1 FROM unavailable_dates ud
        WHERE ud.property_id = p.property_id
        AND (
            (ud.unavailable_from <= ? AND ud.unavailable_to >= ?)
            OR (ud.unavailable_from <= ? AND ud.unavailable_to >= ?)
            OR (ud.unavailable_from >= ? AND ud.unavailable_to <= ?)
        )
    ) AS is_available
FROM properties p
INNER JOIN users u ON p.owner_id = u.user_id
WHERE p.status = 'active'
    AND p.governorate = ? -- if provided
    AND (p.city = ? OR ? IS NULL) -- if provided
    AND p.bedrooms >= ? -- if provided
    AND p.guests_capacity >= ? -- if provided
    AND p.price_per_night BETWEEN ? AND ? -- if provided
    AND (p.property_type = ? OR ? IS NULL) -- if provided
    -- Check amenities (if provided)
    AND (
        ? IS NULL OR -- no amenities filter
        (
            SELECT COUNT(DISTINCT pa.amenity_id)
            FROM property_amenities pa
            WHERE pa.property_id = p.property_id
            AND pa.amenity_id IN (?) -- array of amenity IDs
        ) = ? -- count of required amenities
    )
ORDER BY 
    -- Sorting options
    CASE WHEN ? = 'featured' THEN p.is_featured END DESC,
    CASE WHEN ? = 'price_low' THEN p.price_per_night END ASC,
    CASE WHEN ? = 'price_high' THEN p.price_per_night END DESC,
    CASE WHEN ? = 'rating' THEN p.average_rating END DESC,
    CASE WHEN ? = 'newest' THEN p.created_at END DESC,
    p.featured_order ASC,
    p.created_at DESC
LIMIT ? OFFSET ?;

-- ===========================================
-- 2. GET PROPERTY DETAILS WITH ALL INFO
-- ===========================================

-- Main property info
SELECT 
    p.*,
    u.user_id AS owner_id,
    u.first_name AS owner_first_name,
    u.last_name AS owner_last_name,
    u.profile_photo AS owner_photo,
    u.phone_number AS owner_phone,
    u.email AS owner_email,
    u.national_id_verified AS owner_verified,
    u.response_rate AS owner_response_rate,
    u.average_response_time AS owner_response_time,
    u.created_at AS owner_member_since,
    (SELECT COUNT(*) FROM properties WHERE owner_id = u.user_id AND status = 'active') AS owner_total_properties,
    (SELECT AVG(overall_rating) FROM reviews WHERE reviewee_id = u.user_id AND is_approved = TRUE) AS owner_avg_rating,
    (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.user_id AND is_approved = TRUE) AS owner_total_reviews
FROM properties p
INNER JOIN users u ON p.owner_id = u.user_id
WHERE p.property_id = ?
    AND (p.status = 'active' OR p.owner_id = ?); -- owner can see their own inactive properties

-- Property images
SELECT * FROM property_images
WHERE property_id = ?
ORDER BY image_order ASC;

-- Property amenities
SELECT a.* FROM amenities a
INNER JOIN property_amenities pa ON a.amenity_id = pa.amenity_id
WHERE pa.property_id = ?
ORDER BY a.category, a.display_order;

-- Property reviews with pagination
SELECT 
    r.*,
    u.first_name AS reviewer_name,
    u.profile_photo AS reviewer_photo,
    (SELECT COUNT(*) FROM reviews WHERE reviewer_id = u.user_id AND is_approved = TRUE) AS reviewer_total_reviews
FROM reviews r
INNER JOIN users u ON r.reviewer_id = u.user_id
WHERE r.property_id = ?
    AND r.is_approved = TRUE
ORDER BY r.created_at DESC
LIMIT ? OFFSET ?;

-- Unavailable dates for calendar
SELECT 
    unavailable_from,
    unavailable_to,
    reason
FROM unavailable_dates
WHERE property_id = ?
    AND unavailable_to >= CURDATE()
ORDER BY unavailable_from ASC;

-- ===========================================
-- 3. CREATE BOOKING REQUEST
-- ===========================================

-- First check availability
SELECT COUNT(*) AS conflicts
FROM unavailable_dates
WHERE property_id = ?
    AND (
        (unavailable_from <= ? AND unavailable_to >= ?)
        OR (unavailable_from <= ? AND unavailable_to >= ?)
        OR (unavailable_from >= ? AND unavailable_to <= ?)
    );

-- If available, insert booking
INSERT INTO bookings (
    booking_reference,
    property_id,
    renter_id,
    owner_id,
    check_in_date,
    check_out_date,
    number_of_nights,
    number_of_guests,
    number_of_adults,
    number_of_children,
    price_per_night,
    subtotal,
    cleaning_fee,
    service_fee,
    discount_amount,
    total_price,
    security_deposit,
    special_requests,
    booking_source,
    device_type,
    expires_at
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    DATE_ADD(NOW(), INTERVAL 48 HOUR)
);

-- Insert notification for owner
INSERT INTO notifications (user_id, type, title_ar, title_en, message_ar, message_en, related_booking_id, related_property_id)
VALUES (
    ?,
    'booking_request',
    'طلب حجز جديد',
    'New Booking Request',
    ?,
    ?,
    LAST_INSERT_ID(),
    ?
);

-- ===========================================
-- 4. CONFIRM BOOKING
-- ===========================================

START TRANSACTION;

-- Update booking status
UPDATE bookings
SET status = 'confirmed',
    confirmed_at = NOW()
WHERE booking_id = ?
    AND owner_id = ?
    AND status = 'pending';

-- Add to unavailable dates
INSERT INTO unavailable_dates (property_id, booking_id, unavailable_from, unavailable_to, reason)
SELECT property_id, booking_id, check_in_date, check_out_date, 'booked'
FROM bookings
WHERE booking_id = ?;

-- Send notification to renter
INSERT INTO notifications (user_id, type, title_ar, title_en, message_ar, message_en, related_booking_id, related_property_id)
SELECT 
    renter_id,
    'booking_confirmed',
    'تم تأكيد حجزك',
    'Booking Confirmed',
    CONCAT('تم تأكيد حجزك لعقار ', (SELECT title_ar FROM properties WHERE property_id = bookings.property_id)),
    CONCAT('Your booking for ', (SELECT title_en FROM properties WHERE property_id = bookings.property_id), ' has been confirmed'),
    booking_id,
    property_id
FROM bookings
WHERE booking_id = ?;

COMMIT;

-- ===========================================
-- 5. GET USER BOOKINGS (RENTER VIEW)
-- ===========================================

SELECT 
    b.*,
    p.title_ar AS property_title_ar,
    p.title_en AS property_title_en,
    p.property_type,
    p.governorate,
    p.city,
    p.address,
    (SELECT image_url FROM property_images WHERE property_id = p.property_id AND is_cover = TRUE LIMIT 1) AS property_image,
    owner.first_name AS owner_name,
    owner.phone_number AS owner_phone,
    owner.profile_photo AS owner_photo,
    -- Check if review exists
    EXISTS(SELECT 1 FROM reviews WHERE booking_id = b.booking_id) AS has_review
FROM bookings b
INNER JOIN properties p ON b.property_id = p.property_id
INNER JOIN users owner ON b.owner_id = owner.user_id
WHERE b.renter_id = ?
ORDER BY 
    CASE b.status
        WHEN 'pending' THEN 1
        WHEN 'confirmed' THEN 2
        WHEN 'completed' THEN 3
        ELSE 4
    END,
    b.check_in_date DESC
LIMIT ? OFFSET ?;

-- ===========================================
-- 6. GET OWNER BOOKINGS (OWNER VIEW)
-- ===========================================

SELECT 
    b.*,
    p.title_ar AS property_title_ar,
    p.title_en AS property_title_en,
    (SELECT image_url FROM property_images WHERE property_id = p.property_id AND is_cover = TRUE LIMIT 1) AS property_image,
    renter.first_name AS renter_name,
    renter.phone_number AS renter_phone,
    renter.email AS renter_email,
    renter.profile_photo AS renter_photo,
    (SELECT AVG(overall_rating) FROM reviews WHERE reviewer_id = renter.user_id) AS renter_avg_rating
FROM bookings b
INNER JOIN properties p ON b.property_id = p.property_id
INNER JOIN users renter ON b.renter_id = renter.user_id
WHERE b.owner_id = ?
    AND (p.property_id = ? OR ? IS NULL) -- filter by property if provided
ORDER BY 
    CASE b.status
        WHEN 'pending' THEN 1
        WHEN 'confirmed' THEN 2
        WHEN 'completed' THEN 3
        ELSE 4
    END,
    b.requested_at DESC
LIMIT ? OFFSET ?;

-- ===========================================
-- 7. CREATE REVIEW
-- ===========================================

-- Check if booking is completed and user is the renter
SELECT COUNT(*) FROM bookings
WHERE booking_id = ?
    AND renter_id = ?
    AND status = 'completed'
    AND NOT EXISTS(SELECT 1 FROM reviews WHERE booking_id = ?);

-- Insert review
INSERT INTO reviews (
    booking_id,
    property_id,
    reviewer_id,
    reviewee_id,
    overall_rating,
    cleanliness_rating,
    accuracy_rating,
    communication_rating,
    location_rating,
    value_rating,
    review_title,
    review_text,
    pros,
    cons
) SELECT 
    ?,
    property_id,
    renter_id,
    owner_id,
    ?, ?, ?, ?, ?, ?,
    ?,
    ?,
    ?,
    ?
FROM bookings
WHERE booking_id = ?;

-- ===========================================
-- 8. GET CONVERSATIONS LIST
-- ===========================================

SELECT 
    DISTINCT
    CASE 
        WHEN m.sender_id = ? THEN m.receiver_id
        ELSE m.sender_id
    END AS other_user_id,
    u.first_name,
    u.last_name,
    u.profile_photo,
    u.user_type,
    (
        SELECT message_text 
        FROM messages 
        WHERE conversation_id = m.conversation_id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) AS last_message,
    (
        SELECT created_at 
        FROM messages 
        WHERE conversation_id = m.conversation_id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) AS last_message_time,
    (
        SELECT COUNT(*) 
        FROM messages 
        WHERE conversation_id = m.conversation_id 
        AND receiver_id = ? 
        AND is_read = FALSE
    ) AS unread_count
FROM messages m
INNER JOIN users u ON (
    CASE 
        WHEN m.sender_id = ? THEN m.receiver_id
        ELSE m.sender_id
    END = u.user_id
)
WHERE m.sender_id = ? OR m.receiver_id = ?
GROUP BY m.conversation_id
ORDER BY last_message_time DESC;

-- ===========================================
-- 9. GET MESSAGES IN CONVERSATION
-- ===========================================

SELECT 
    m.*,
    sender.first_name AS sender_name,
    sender.profile_photo AS sender_photo,
    receiver.first_name AS receiver_name,
    receiver.profile_photo AS receiver_photo
FROM messages m
INNER JOIN users sender ON m.sender_id = sender.user_id
INNER JOIN users receiver ON m.receiver_id = receiver.user_id
WHERE m.conversation_id = ?
    AND (m.sender_id = ? OR m.receiver_id = ?)
    AND m.is_deleted_by_sender = FALSE
    AND m.is_deleted_by_receiver = FALSE
ORDER BY m.created_at ASC
LIMIT ? OFFSET ?;

-- Mark messages as read
UPDATE messages
SET is_read = TRUE,
    read_at = NOW()
WHERE conversation_id = ?
    AND receiver_id = ?
    AND is_read = FALSE;

-- ===========================================
-- 10. OWNER DASHBOARD ANALYTICS
-- ===========================================

-- Overview stats
SELECT 
    COUNT(DISTINCT p.property_id) AS total_properties,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.property_id END) AS active_properties,
    SUM(p.view_count) AS total_views,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.booking_id END) AS pending_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) AS upcoming_bookings,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_price END), 0) AS total_earnings,
    COALESCE(SUM(CASE WHEN b.status = 'completed' AND b.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN b.total_price END), 0) AS earnings_this_month,
    AVG(r.overall_rating) AS avg_rating,
    COUNT(DISTINCT r.review_id) AS total_reviews
FROM properties p
LEFT JOIN bookings b ON p.property_id = b.property_id
LEFT JOIN reviews r ON p.property_id = r.property_id AND r.is_approved = TRUE
WHERE p.owner_id = ?;

-- Recent bookings
SELECT 
    b.booking_id,
    b.booking_reference,
    b.status,
    b.check_in_date,
    b.check_out_date,
    b.total_price,
    p.title_ar AS property_title,
    renter.first_name AS renter_name,
    renter.phone_number AS renter_phone
FROM bookings b
INNER JOIN properties p ON b.property_id = p.property_id
INNER JOIN users renter ON b.renter_id = renter.user_id
WHERE b.owner_id = ?
ORDER BY b.requested_at DESC
LIMIT 10;

-- Top performing properties
SELECT 
    p.property_id,
    p.title_ar,
    p.view_count,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_price END), 0) AS revenue,
    p.average_rating
FROM properties p
LEFT JOIN bookings b ON p.property_id = b.property_id
WHERE p.owner_id = ?
    AND p.status = 'active'
GROUP BY p.property_id
ORDER BY revenue DESC
LIMIT 5;

-- ===========================================
-- 11. ADMIN DASHBOARD
-- ===========================================

-- Overview statistics
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS total_active_users,
    (SELECT COUNT(*) FROM users WHERE user_type = 'landlord' AND is_active = TRUE) AS total_landlords,
    (SELECT COUNT(*) FROM users WHERE user_type = 'renter' AND is_active = TRUE) AS total_renters,
    (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS new_users_30d,
    (SELECT COUNT(*) FROM properties WHERE status = 'active') AS active_properties,
    (SELECT COUNT(*) FROM properties WHERE status = 'pending_approval') AS pending_properties,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE requested_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS bookings_30d,
    (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed' AND completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS revenue_30d,
    (SELECT COALESCE(SUM(service_fee), 0) FROM bookings WHERE status = 'completed' AND completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS platform_fees_30d,
    (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports,
    (SELECT COUNT(*) FROM reviews WHERE is_approved = FALSE) AS pending_reviews;

-- Properties pending approval
SELECT 
    p.*,
    u.first_name AS owner_name,
    u.email AS owner_email,
    u.phone_number AS owner_phone,
    u.national_id_verified AS owner_verified,
    (SELECT COUNT(*) FROM property_images WHERE property_id = p.property_id) AS images_count
FROM properties p
INNER JOIN users u ON p.owner_id = u.user_id
WHERE p.status = 'pending_approval'
ORDER BY p.created_at ASC;

-- Recent reports
SELECT 
    r.*,
    reporter.first_name AS reporter_name,
    reporter.email AS reporter_email,
    CASE 
        WHEN r.report_type = 'property' THEN (SELECT title_ar FROM properties WHERE property_id = r.reported_property_id)
        WHEN r.report_type = 'user' THEN (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE user_id = r.reported_user_id)
    END AS reported_item_name
FROM reports r
INNER JOIN users reporter ON r.reporter_id = reporter.user_id
WHERE r.status IN ('pending', 'investigating')
ORDER BY 
    CASE r.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    r.created_at ASC
LIMIT 20;

-- ===========================================
-- 12. SEARCH SUGGESTIONS (AUTOCOMPLETE)
-- ===========================================

-- City suggestions
SELECT DISTINCT city, governorate, COUNT(*) AS property_count
FROM properties
WHERE status = 'active'
    AND (
        city LIKE CONCAT(?, '%')
        OR governorate LIKE CONCAT(?, '%')
    )
GROUP BY city, governorate
ORDER BY property_count DESC
LIMIT 10;

-- Popular searches
SELECT 
    governorate,
    city,
    COUNT(*) AS search_count
FROM search_history
WHERE searched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY governorate, city
ORDER BY search_count DESC
LIMIT 10;

-- ===========================================
-- 13. APPLY PROMO CODE
-- ===========================================

-- Check promo code validity
SELECT 
    pc.*,
    (pc.max_uses - pc.times_used) AS remaining_uses,
    (
        SELECT COUNT(*) 
        FROM promotion_code_usage 
        WHERE promo_id = pc.promo_id 
        AND user_id = ?
    ) AS user_usage_count
FROM promotion_codes pc
WHERE pc.code = ?
    AND pc.is_active = TRUE
    AND NOW() BETWEEN pc.valid_from AND pc.valid_to
    AND (pc.max_uses IS NULL OR pc.times_used < pc.max_uses)
    AND (
        pc.applicable_to = 'all'
        OR (pc.applicable_to = 'first_booking' AND NOT EXISTS(
            SELECT 1 FROM bookings WHERE renter_id = ? AND status IN ('confirmed', 'completed')
        ))
    );

-- Calculate discount
-- (Implemented in application logic based on discount_type and discount_value)

-- ===========================================
-- 14. TRACK PROPERTY VIEW
-- ===========================================

INSERT INTO property_views (
    property_id,
    user_id,
    session_id,
    device_type,
    browser,
    os,
    ip_address,
    referrer_url,
    utm_source,
    utm_medium,
    utm_campaign
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- ===========================================
-- 15. GET FEATURED PROPERTIES
-- ===========================================

SELECT 
    p.*,
    u.first_name AS owner_name,
    (SELECT image_url FROM property_images WHERE property_id = p.property_id AND is_cover = TRUE LIMIT 1) AS cover_image,
    fp.featured_from,
    fp.featured_to
FROM properties p
INNER JOIN users u ON p.owner_id = u.user_id
INNER JOIN featured_purchases fp ON p.property_id = fp.property_id
WHERE p.status = 'active'
    AND p.is_featured = TRUE
    AND fp.status = 'active'
    AND NOW() BETWEEN fp.featured_from AND fp.featured_to
ORDER BY p.featured_order ASC, fp.featured_from DESC
LIMIT ?;

-- ============================================
-- END OF API QUERIES
-- ============================================
-- Add missing indexes if needed
CREATE INDEX idx_bookings_owner_status ON bookings(owner_id, status, check_in_date);
CREATE INDEX idx_bookings_renter_status ON bookings(renter_id, status, check_in_date);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read, created_at);

-- Enable Query Cache (in my.cnf)
query_cache_type = 1
query_cache_size = 64M

-- Optimize for InnoDB
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M