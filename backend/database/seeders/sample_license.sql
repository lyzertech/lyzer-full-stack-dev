-- ============================================================================
-- LyZer System License - Sample SQL Script
-- ============================================================================
-- This script provides examples for manually inserting, updating, and 
-- managing system licenses in the database.
--
-- IMPORTANT: Always backup your database before making changes!
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. INSERT A NEW VALID LICENSE (1 Year Duration)
-- ----------------------------------------------------------------------------
-- Use this to activate a new license with a 1-year validity period.

INSERT INTO system_licenses (
    license_key,
    license_type,
    issued_to,
    issued_at,
    expires_at,
    is_active,
    metadata,
    created_at,
    updated_at
) VALUES (
    'LYZ-2026-XXXX-XXXX-XXXX',  -- Replace with actual license key
    'standard',                   -- Options: 'trial', 'standard', 'enterprise'
    'PT. Example Company',        -- Company or customer name
    NOW(),                        -- Issue timestamp
    DATE_ADD(NOW(), INTERVAL 1 YEAR),  -- Expires in 1 year
    1,                            -- Active (1 = true, 0 = false)
    JSON_OBJECT(
        'contact_email', 'admin@example.com',
        'contact_phone', '+62-xxx-xxxx-xxxx',
        'notes', 'Standard license for production use'
    ),
    NOW(),
    NOW()
);

-- ----------------------------------------------------------------------------
-- 2. INSERT A TRIAL LICENSE (30 Days)
-- ----------------------------------------------------------------------------
-- Use this for trial/demo installations.

INSERT INTO system_licenses (
    license_key,
    license_type,
    issued_to,
    issued_at,
    expires_at,
    is_active,
    created_at,
    updated_at
) VALUES (
    'LYZ-TRIAL-' || UNIX_TIMESTAMP(),  -- Auto-generate trial key
    'trial',
    'Trial Installation',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY),  -- 30-day trial
    1,
    NOW(),
    NOW()
);

-- ----------------------------------------------------------------------------
-- 3. CHECK CURRENT LICENSE STATUS
-- ----------------------------------------------------------------------------
-- Use this to verify the current active license.

SELECT 
    id,
    license_key,
    license_type,
    issued_to,
    issued_at,
    expires_at,
    is_active,
    DATEDIFF(expires_at, NOW()) AS days_remaining,
    CASE 
        WHEN is_active = 0 THEN 'INACTIVE'
        WHEN expires_at < NOW() THEN 'EXPIRED'
        WHEN DATEDIFF(expires_at, NOW()) <= 30 THEN 'EXPIRING SOON'
        ELSE 'VALID'
    END AS status
FROM system_licenses
ORDER BY created_at DESC;

-- ----------------------------------------------------------------------------
-- 4. EXTEND/RENEW AN EXISTING LICENSE
-- ----------------------------------------------------------------------------
-- Use this to extend the expiration date of an existing license.

UPDATE system_licenses
SET 
    expires_at = DATE_ADD(expires_at, INTERVAL 1 YEAR),  -- Add 1 year to current expiry
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX'  -- Replace with your license key
    AND is_active = 1;

-- Alternative: Set a specific new expiration date
UPDATE system_licenses
SET 
    expires_at = '2027-12-31 23:59:59',  -- Specific date
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX';

-- ----------------------------------------------------------------------------
-- 5. DEACTIVATE A LICENSE
-- ----------------------------------------------------------------------------
-- Use this to manually disable a license (will block application access).

UPDATE system_licenses
SET 
    is_active = 0,
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX';

-- ----------------------------------------------------------------------------
-- 6. REACTIVATE A LICENSE
-- ----------------------------------------------------------------------------
-- Use this to re-enable a previously deactivated license.

UPDATE system_licenses
SET 
    is_active = 1,
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX';

-- ----------------------------------------------------------------------------
-- 7. UPDATE LICENSE TYPE
-- ----------------------------------------------------------------------------
-- Use this to upgrade/downgrade a license type.

UPDATE system_licenses
SET 
    license_type = 'enterprise',  -- Options: 'trial', 'standard', 'enterprise'
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX';

-- ----------------------------------------------------------------------------
-- 8. ADD METADATA TO EXISTING LICENSE
-- ----------------------------------------------------------------------------
-- Use this to add or update additional license information.

UPDATE system_licenses
SET 
    metadata = JSON_OBJECT(
        'max_users', 100,
        'features', JSON_ARRAY('monitoring', 'finance', 'sales', 'school'),
        'support_level', 'premium',
        'contact_email', 'support@example.com'
    ),
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX';

-- ----------------------------------------------------------------------------
-- 9. DELETE OLD/EXPIRED LICENSES
-- ----------------------------------------------------------------------------
-- Use this to clean up old expired licenses (BE CAREFUL!)

-- First, view what will be deleted:
SELECT * FROM system_licenses
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
AND is_active = 0;

-- Then delete if you're sure:
DELETE FROM system_licenses
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
AND is_active = 0;

-- ----------------------------------------------------------------------------
-- 10. FIND LICENSES EXPIRING SOON (Next 30 Days)
-- ----------------------------------------------------------------------------
-- Use this for monitoring and proactive renewal.

SELECT 
    license_key,
    license_type,
    issued_to,
    expires_at,
    DATEDIFF(expires_at, NOW()) AS days_remaining
FROM system_licenses
WHERE 
    is_active = 1
    AND expires_at > NOW()
    AND expires_at <= DATE_ADD(NOW(), INTERVAL 30 DAY)
ORDER BY expires_at ASC;

-- ============================================================================
-- QUICK REFERENCE: License Key Format
-- ============================================================================
-- Format: LYZ-YYYY-XXXX-XXXX-XXXX
-- Where:
--   LYZ  = Product prefix
--   YYYY = Year of issue
--   XXXX = Random alphanumeric segments
--
-- Example: LYZ-2026-A1B2-C3D4-E5F6
-- ============================================================================

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- 1. Only ONE license should be active at a time for normal operation
-- 2. The application checks: is_active = 1 AND expires_at > NOW()
-- 3. License status is cached for 5 minutes in both backend and frontend
-- 4. After any license change, users may need to refresh their browsers
-- 5. Always keep a backup of your license information
-- ============================================================================
