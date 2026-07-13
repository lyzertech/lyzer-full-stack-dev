# License System Documentation

## Overview

The LyZer application includes a comprehensive license protection system that enforces valid licensing before any application access, including the login page. This system uses a hybrid approach combining server-side security enforcement and client-side UX optimization.

## Architecture

### Two-Layer Protection

**1. Security Layer (Backend)**
- Global middleware (`CheckLicense`) that runs on **every** API request
- Server-side validation ensures protection cannot be bypassed from the client
- Database is the single source of truth for license validity
- Result is cached for 5 minutes to minimize database queries

**2. UX Layer (Frontend)**
- `LicenseGuard` component wraps the entire application
- Provides instant feedback using cached license status
- Shows professional "No License" page when license is invalid
- Automatically refreshes license status on app load

### Flow Diagram

```
User Opens App
    ↓
Frontend: LicenseGuard checks cache
    ↓
API Call: GET /api/v1/system/license/status
    ↓
Backend: CheckLicense middleware validates
    ↓
Database: Check valid license (is_active=1 AND expires_at > NOW())
    ↓
    ├─ Valid License → Show Login Page → User can access app
    └─ No/Invalid License → Show "No License" Page (BLOCKED)
```

## License Validation Rules

A license is considered **VALID** when:
1. `is_active = true` (manual activation flag)
2. `expires_at > NOW()` (not expired)

If either condition fails, the entire application is blocked.

## Components

### Backend Components

#### 1. Database Table: `system_licenses`
Located: `database/migrations/2026_07_12_000001_create_system_licenses_table.php`

**Structure:**
- `id` - Primary key
- `license_key` - Unique identifier (e.g., LYZ-2026-XXXX-XXXX-XXXX)
- `license_type` - ENUM: 'trial', 'standard', 'enterprise'
- `issued_to` - Company/Customer name
- `issued_at` - Issue timestamp
- `expires_at` - Expiration timestamp
- `is_active` - Manual activation/deactivation flag
- `metadata` - JSON field for additional info
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_active_license` on (`is_active`, `expires_at`) for fast validation queries

#### 2. License Model
Located: `app/Modules/System/Models/License.php`

**Key Methods:**
- `scopeValid()` - Query scope for valid licenses
- `hasValidLicense()` - Static method to check if system has valid license
- `getCurrentLicense()` - Get the active valid license
- `getDaysRemainingAttribute()` - Calculate days until expiration
- `isExpired()` - Check if license has expired
- `isExpiringSoon($days = 30)` - Check if license expires soon

#### 3. CheckLicense Middleware
Located: `app/Http/Middleware/CheckLicense.php`

**Behavior:**
- Runs **before** all API routes (including login)
- Checks license status with 5-minute cache
- Returns 403 with `error: "license_required"` if invalid
- Allows request to proceed if valid

**Registration:**
Registered globally in `bootstrap/app.php` in the API middleware stack.

#### 4. License Controller
Located: `app/Modules/System/Controllers/LicenseController.php`

**Endpoint:** `GET /api/v1/system/license/status`

**Response (Valid):**
```json
{
    "valid": true,
    "expires_at": "2027-07-12T00:00:00Z",
    "days_remaining": 365,
    "license_type": "standard",
    "issued_to": "PT. Example Company",
    "is_expiring_soon": false
}
```

**Response (Invalid):**
```json
{
    "valid": false,
    "error": "license_required"
}
```

### Frontend Components

#### 1. LicenseContext
Located: `shared/license/LicenseContext.tsx`

**Provides:**
- `licenseStatus` - Current license information
- `licenseLoading` - Loading state
- `licenseError` - Error messages
- `checkLicense()` - Function to re-check license

**Features:**
- Caches license status in localStorage (5-minute TTL)
- Automatically checks on mount
- Provides instant feedback from cache before API call

#### 2. LicenseGuard
Located: `shared/license/LicenseGuard.tsx`

**Behavior:**
- Wraps entire application (outside AuthProvider)
- Shows loading spinner while checking license
- Shows NoLicensePage if license is invalid
- Renders app normally if license is valid

#### 3. NoLicensePage
Located: `app/(components)/no-license/page.tsx`

**Features:**
- Professional, clean design
- Clear message to contact administrator
- Company logo and branding
- No confusing technical details

#### 4. API Client Enhancement
Located: `lib/api-client.ts`

**License Error Handling:**
- Detects 403 responses with `error: "license_required"`
- Clears license cache
- Reloads page to force LicenseGuard to show NoLicensePage

## Installation & Setup

### 1. Run Migration

```bash
cd backend
php artisan migrate
```

This creates the `system_licenses` table.

### 2. Insert Initial License

Use the sample SQL script: `database/seeders/sample_license.sql`

**Quick Start (1 Year License):**
```sql
INSERT INTO system_licenses (
    license_key,
    license_type,
    issued_to,
    issued_at,
    expires_at,
    is_active
) VALUES (
    'LYZ-2026-A1B2-C3D4-E5F6',
    'standard',
    'Your Company Name',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 YEAR),
    1
);
```

### 3. Verify Installation

**Backend Check:**
```bash
# Check license in database
mysql -u username -p database_name -e "SELECT * FROM system_licenses WHERE is_active = 1;"
```

**Frontend Check:**
1. Open application in browser
2. Should show "Checking license..." briefly
3. Then redirect to login page (if license valid)
4. Or show "No License" page (if no license)

## License Management

### Check Current License Status

**Via Database:**
```sql
SELECT 
    license_key,
    license_type,
    issued_to,
    expires_at,
    DATEDIFF(expires_at, NOW()) AS days_remaining,
    is_active
FROM system_licenses
WHERE is_active = 1;
```

**Via API:**
```bash
curl http://your-domain.com/api/v1/system/license/status
```

### Extend/Renew License

**Add 1 year to current expiry:**
```sql
UPDATE system_licenses
SET 
    expires_at = DATE_ADD(expires_at, INTERVAL 1 YEAR),
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX'
    AND is_active = 1;
```

**Set specific expiry date:**
```sql
UPDATE system_licenses
SET 
    expires_at = '2027-12-31 23:59:59',
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX';
```

### Deactivate License

```sql
UPDATE system_licenses
SET 
    is_active = 0,
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX';
```

**Effect:** Immediately blocks all application access (after cache expires in 5 minutes).

### Reactivate License

```sql
UPDATE system_licenses
SET 
    is_active = 1,
    updated_at = NOW()
WHERE 
    license_key = 'LYZ-2026-XXXX-XXXX-XXXX'
    AND expires_at > NOW();
```

**Note:** Also check that expires_at is still in the future!

## Monitoring & Alerts

### Find Licenses Expiring Soon

```sql
SELECT 
    license_key,
    issued_to,
    expires_at,
    DATEDIFF(expires_at, NOW()) AS days_remaining
FROM system_licenses
WHERE 
    is_active = 1
    AND expires_at > NOW()
    AND expires_at <= DATE_ADD(NOW(), INTERVAL 30 DAY);
```

### Recommended Monitoring

Set up alerts for:
- **30 days before expiry** - Warning notification
- **7 days before expiry** - Urgent notification
- **License expired** - Critical alert

## Troubleshooting

### Problem: Login page shows despite no license

**Cause:** Frontend cache may still have valid status.

**Solution:**
1. Clear browser localStorage
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Or wait 5 minutes for cache to expire

### Problem: "No License" page shows despite valid license

**Cause 1:** License may have expired
```sql
SELECT expires_at FROM system_licenses WHERE is_active = 1;
```

**Cause 2:** License is inactive
```sql
SELECT is_active FROM system_licenses WHERE license_key = 'YOUR-KEY';
```

**Solution:** Check database and fix license record.

### Problem: Application blocked after license renewal

**Cause:** Cache not cleared yet (5-minute TTL).

**Solution:**
1. Wait 5 minutes for cache to expire
2. Or restart Laravel queue/cache: `php artisan cache:clear`
3. Users can refresh browser

### Problem: License check is slow

**Cause:** Database queries on every request.

**Current:** System caches for 5 minutes. If still slow, check:
1. Database index exists: `SHOW INDEX FROM system_licenses;`
2. Database connection performance
3. Consider increasing cache duration in middleware

## Security Considerations

### Cannot Be Bypassed

✅ **Server-side enforcement** - Middleware runs on every API request
✅ **Database validation** - Single source of truth
✅ **No client-side only checks** - Frontend is just UX layer

### What's Protected

- ✅ Login endpoint
- ✅ All authenticated endpoints
- ✅ Public API endpoints
- ✅ All API routes (no exceptions)

### Best Practices

1. **Keep backups** of license information
2. **Monitor expiration dates** proactively
3. **Test license renewal** process before production
4. **Document license keys** securely
5. **Set calendar reminders** for renewal dates

## License Key Format

**Recommended Format:**
```
LYZ-YYYY-XXXX-XXXX-XXXX
```

Where:
- `LYZ` = Product prefix
- `YYYY` = Year of issue
- `XXXX` = Random alphanumeric segments (4 characters each)

**Example:**
```
LYZ-2026-A1B2-C3D4-E5F6
```

**Generation Tips:**
- Use secure random generation
- Include year for easy identification
- Keep a registry of issued licenses
- Use checksums for validation (optional)

## Migration from Non-Licensed System

If your system is currently running without license protection:

1. **Prepare license** before deployment
2. **Run migration** to create table
3. **Insert license** immediately
4. **Deploy code changes**
5. **Test thoroughly** in staging first

**Rollback Plan:**
If you need to temporarily disable license checking:
1. Comment out CheckLicense middleware in `bootstrap/app.php`
2. Run: `php artisan optimize:clear`
3. Restart application

## FAQs

**Q: Can I have multiple active licenses?**
A: Yes, but the system will use the first valid one it finds. Generally, keep only one active license.

**Q: What happens to logged-in users when license expires?**
A: Their next API call will be blocked with 403, and they'll be redirected to "No License" page.

**Q: Can I whitelist certain routes from license check?**
A: Yes, modify the `CheckLicense` middleware to add route whitelisting logic. However, this is not recommended for security.

**Q: How do I backup license information?**
A: Export the `system_licenses` table regularly:
```bash
mysqldump -u username -p database_name system_licenses > license_backup.sql
```

**Q: Can license check be disabled temporarily?**
A: Yes, but not recommended. See "Migration from Non-Licensed System" section.

## Support

For assistance with the license system:
1. Check this documentation first
2. Review the sample SQL scripts
3. Check application logs for errors
4. Contact your system administrator
5. Review code in `app/Modules/System/` and `shared/license/`

## Version History

- **v1.0** (2026-07-12) - Initial license system implementation
  - Hybrid server/client protection
  - Expiry-based validation
  - Manual database management
