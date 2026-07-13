# License System - Quick Start Guide

## 🎉 Implementation Complete!

The license protection system has been fully implemented and is ready for activation.

## 📋 What Was Implemented

### Backend (Laravel)
- ✅ Database migration for `system_licenses` table
- ✅ License model with validation logic
- ✅ Global `CheckLicense` middleware (runs on ALL API requests)
- ✅ License status endpoint (`GET /api/v1/system/license/status`)
- ✅ 5-minute caching to optimize performance

### Frontend (Next.js)
- ✅ `LicenseContext` for state management
- ✅ `LicenseGuard` wrapper component
- ✅ Professional "No License" page
- ✅ License error handling in API client
- ✅ Integrated into root layout

### Documentation
- ✅ Comprehensive system documentation (`backend/docs/LICENSE_SYSTEM.md`)
- ✅ Testing guide with 21 test scenarios (`backend/docs/LICENSE_TESTING_GUIDE.md`)
- ✅ Sample SQL scripts (`backend/database/seeders/sample_license.sql`)

## 🚀 Getting Started (3 Steps)

### Step 1: Run the Migration

```bash
cd backend
php artisan migrate
```

This creates the `system_licenses` table in your database.

### Step 2: Insert Your First License

Choose one of these options:

**Option A: Via phpMyAdmin / Database GUI**
1. Open phpMyAdmin
2. Select your database
3. Go to SQL tab
4. Paste and run:

```sql
INSERT INTO system_licenses (
    license_key,
    license_type,
    issued_to,
    issued_at,
    expires_at,
    is_active
) VALUES (
    'LYZ-2026-PROD-0001',
    'standard',
    'Your Company Name',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 YEAR),
    1
);
```

**Option B: Via MySQL Command Line**

```bash
mysql -u your_username -p your_database_name

INSERT INTO system_licenses (license_key, license_type, issued_to, issued_at, expires_at, is_active)
VALUES ('LYZ-2026-PROD-0001', 'standard', 'Your Company Name', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1);
```

**Option C: Use Laravel Tinker**

```bash
php artisan tinker

App\Modules\System\Models\License::create([
    'license_key' => 'LYZ-2026-PROD-0001',
    'license_type' => 'standard',
    'issued_to' => 'Your Company Name',
    'issued_at' => now(),
    'expires_at' => now()->addYear(),
    'is_active' => true,
]);
```

### Step 3: Clear Cache and Test

```bash
# Clear Laravel cache
php artisan cache:clear

# Verify license is active
php artisan tinker
>>> App\Modules\System\Models\License::hasValidLicense()
# Should return: true
```

## ✅ Verification

### Backend Test
```bash
# Test license status endpoint
curl http://localhost:8000/api/v1/system/license/status
```

**Expected response:**
```json
{
    "valid": true,
    "expires_at": "2027-07-12T...",
    "days_remaining": 365,
    "license_type": "standard",
    "issued_to": "Your Company Name",
    "is_expiring_soon": false
}
```

### Frontend Test
1. Open your browser
2. Navigate to your application
3. You should see:
   - Brief "Checking license..." message
   - Then normal login page

**If you see the "No License" page:**
- Check that license was inserted correctly
- Clear Laravel cache: `php artisan cache:clear`
- Clear browser cache and localStorage
- Refresh the page

## 📊 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    User Opens App                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Frontend: LicenseGuard     │
        │   Checks cached status first │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │   API: GET /license/status       │
        └──────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │   Middleware: CheckLicense       │
        │   (with 5-minute cache)          │
        └──────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │   Database: system_licenses      │
        │   WHERE is_active=1              │
        │   AND expires_at > NOW()         │
        └──────────────┬───────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ✅ Valid                      ❌ Invalid
   │                             │
   │                             │
   ▼                             ▼
Show Login Page            Show "No License" Page
(App accessible)           (App BLOCKED)
```

## 🔐 Security Features

1. **Server-side enforcement** - Cannot be bypassed from browser
2. **All API endpoints protected** - Including `/login`
3. **Database validation** - Single source of truth
4. **Automatic blocking** - No manual checks needed
5. **Cached for performance** - 5-minute cache TTL

## 📅 License Management

### Check License Status
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

### Extend License (Add 1 Year)
```sql
UPDATE system_licenses
SET expires_at = DATE_ADD(expires_at, INTERVAL 1 YEAR)
WHERE license_key = 'LYZ-2026-PROD-0001';
```

### Deactivate License
```sql
UPDATE system_licenses
SET is_active = 0
WHERE license_key = 'LYZ-2026-PROD-0001';
```

## 📖 Documentation Reference

- **Full Documentation:** `backend/docs/LICENSE_SYSTEM.md`
- **Testing Guide:** `backend/docs/LICENSE_TESTING_GUIDE.md`
- **Sample SQL:** `backend/database/seeders/sample_license.sql`

## 🧪 Testing

Run through the test scenarios in `LICENSE_TESTING_GUIDE.md`:

**Quick tests:**
1. Test with no license (should block access)
2. Test with valid license (should allow access)
3. Test with expired license (should block access)
4. Test license expiry during active session

**Use the automated test script:**
```bash
cd backend/docs
# Create test script from documentation
chmod +x license-test.sh
./license-test.sh
```

## 🚨 Important Notes

### Before Deploying to Production

1. ✅ **Backup your database** before running migration
2. ✅ **Insert valid license** immediately after migration
3. ✅ **Test in staging first** - Verify all scenarios
4. ✅ **Clear all caches** - Both Laravel and browser
5. ✅ **Document your license key** - Store it securely
6. ✅ **Set renewal reminders** - 30 days before expiry

### Current Behavior

**WITHOUT LICENSE:**
- Login page: ❌ Not accessible
- API endpoints: ❌ All return 403
- Authenticated features: ❌ Blocked
- User sees: "No License" page

**WITH VALID LICENSE:**
- Login page: ✅ Accessible
- API endpoints: ✅ All work normally
- Authenticated features: ✅ Full access
- User sees: Normal application

## 🆘 Troubleshooting

### Problem: "No License" page shows despite having license

**Solutions:**
1. Verify license in database:
   ```sql
   SELECT * FROM system_licenses WHERE is_active = 1;
   ```
2. Check expiration date is in future
3. Clear Laravel cache: `php artisan cache:clear`
4. Clear browser cache and localStorage
5. Hard refresh browser (Ctrl+Shift+R)

### Problem: Login page accessible without license

**Cause:** Cache hasn't expired yet (5-minute TTL)

**Solutions:**
1. Clear Laravel cache manually
2. Wait 5 minutes for cache to expire
3. Restart Laravel application

### Problem: License check is slow

**Solutions:**
1. Verify database index exists:
   ```sql
   SHOW INDEX FROM system_licenses;
   ```
2. Check cache is working:
   ```php
   php artisan tinker
   >>> Cache::get('system_has_valid_license')
   ```
3. Increase cache duration in middleware if needed

## 📞 Support

For help with the license system:
1. Check `LICENSE_SYSTEM.md` documentation
2. Review `LICENSE_TESTING_GUIDE.md`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Check browser console for frontend errors

## 🎯 Next Steps

1. ✅ Run migration
2. ✅ Insert license
3. ✅ Test functionality
4. ✅ Deploy to staging
5. ✅ User acceptance testing
6. ✅ Deploy to production
7. ✅ Set up monitoring alerts
8. ✅ Document for operations team

## 🎉 You're Done!

The license system is now active and protecting your application. Users cannot access the login page or any features without a valid license.

**License successfully blocks access before login! ✅**
