-- ============================================
-- AJARLY - SUBSCRIPTION PLANS DATA
-- Insert default subscription plans including rental duration plans
-- ============================================

-- Clear existing plans (optional - remove in production)
-- DELETE FROM user_subscriptions;
-- DELETE FROM subscription_plans;

-- ============================================
-- STANDARD SUBSCRIPTION PLANS
-- ============================================

-- 1. FREE PLAN
INSERT INTO subscription_plans (
    name_ar, name_en, description_ar, description_en,
    price_monthly, price_quarterly, price_yearly,
    max_listings, featured_listings_per_month,
    priority_support, verification_badge, analytics_access,
    custom_branding, api_access,
    plan_order, is_active, is_popular
) VALUES (
    'مجاني', 
    'Free',
    'خطة مجانية للبدء والتجربة - 3 عقارات كحد أقصى',
    'Free plan to get started - Maximum 3 listings',
    0.00, 0.00, 0.00,
    3, 0,
    FALSE, FALSE, FALSE,
    FALSE, FALSE,
    1, TRUE, FALSE
);

-- 2. BASIC PLAN
INSERT INTO subscription_plans (
    name_ar, name_en, description_ar, description_en,
    price_monthly, price_quarterly, price_yearly,
    max_listings, featured_listings_per_month,
    priority_support, verification_badge, analytics_access,
    custom_branding, api_access,
    plan_order, is_active, is_popular
) VALUES (
    'أساسي', 
    'Basic',
    'مثالي للملاك الجدد والسماسرة - 10 عقارات',
    'Perfect for new landlords and brokers - 10 listings',
    199.00, 540.00, 1990.00,
    10, 1,
    FALSE, TRUE, FALSE,
    FALSE, FALSE,
    2, TRUE, FALSE
);

-- 3. PROFESSIONAL PLAN (Most Popular)
INSERT INTO subscription_plans (
    name_ar, name_en, description_ar, description_en,
    price_monthly, price_quarterly, price_yearly,
    max_listings, featured_listings_per_month,
    priority_support, verification_badge, analytics_access,
    custom_branding, api_access,
    plan_order, is_active, is_popular
) VALUES (
    'احترافي', 
    'Professional',
    'للملاك المحترفين وأصحاب العقارات المتعددة - عقارات غير محدودة',
    'For professional landlords with multiple properties - Unlimited listings',
    499.00, 1350.00, 4990.00,
    NULL, 5,
    TRUE, TRUE, TRUE,
    FALSE, FALSE,
    3, TRUE, TRUE
);

-- 4. ENTERPRISE PLAN
INSERT INTO subscription_plans (
    name_ar, name_en, description_ar, description_en,
    price_monthly, price_quarterly, price_yearly,
    max_listings, featured_listings_per_month,
    priority_support, verification_badge, analytics_access,
    custom_branding, api_access,
    plan_order, is_active, is_popular
) VALUES (
    'شركات', 
    'Enterprise',
    'للشركات العقارية والوكالات الكبرى - كل المميزات المتقدمة',
    'For real estate companies and large agencies - All premium features',
    999.00, 2700.00, 9990.00,
    NULL, 20,
    TRUE, TRUE, TRUE,
    TRUE, TRUE,
    4, TRUE, FALSE
);

-- ============================================
-- RENTAL DURATION PLANS (NEW!)
-- ============================================

-- 5. ONE-DAY RENT PLAN
INSERT INTO subscription_plans (
    name_ar, name_en, description_ar, description_en,
    price_monthly, price_quarterly, price_yearly,
    max_listings, featured_listings_per_month,
    priority_support, verification_badge, analytics_access,
    custom_branding, api_access,
    plan_order, is_active, is_popular
) VALUES (
    'إيجار يوم واحد', 
    '1-Day Rent',
    'خطة خاصة للإيجار اليومي - مميزات مخصصة للإيجارات القصيرة',
    'Special plan for daily rentals - Features tailored for short-term rentals',
    99.00, 270.00, 990.00,
    5, 2,
    FALSE, TRUE, TRUE,
    FALSE, FALSE,
    5, TRUE, FALSE
);

-- 6. THREE-DAY RENT PLAN
INSERT INTO subscription_plans (
    name_ar, name_en, description_ar, description_en,
    price_monthly, price_quarterly, price_yearly,
    max_listings, featured_listings_per_month,
    priority_support, verification_badge, analytics_access,
    custom_branding, api_access,
    plan_order, is_active, is_popular
) VALUES (
    'إيجار 3 أيام', 
    '3-Day Rent',
    'خطة خاصة للإيجار لمدة 3 أيام - أفضل للعطلات القصيرة',
    'Special plan for 3-day rentals - Best for short vacations',
    149.00, 405.00, 1490.00,
    8, 3,
    TRUE, TRUE, TRUE,
    FALSE, FALSE,
    6, TRUE, TRUE
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- View all plans
-- SELECT 
--     plan_id, name_en, name_ar,
--     price_monthly, price_quarterly, price_yearly,
--     max_listings, featured_listings_per_month,
--     is_popular, plan_order
-- FROM subscription_plans
-- WHERE is_active = TRUE
-- ORDER BY plan_order;

-- Calculate savings
-- SELECT 
--     name_en,
--     price_monthly,
--     price_quarterly,
--     (price_monthly * 3) - price_quarterly AS quarterly_savings,
--     price_yearly,
--     (price_monthly * 12) - price_yearly AS yearly_savings
-- FROM subscription_plans
-- WHERE is_active = TRUE;