# License System Testing Guide

This guide provides comprehensive testing instructions for the license protection system. Follow these tests to verify that the license system is working correctly in all scenarios.

## Prerequisites

1. Backend server running (Laravel)
2. Frontend server running (Next.js)
3. Database access (MySQL/phpMyAdmin/command line)
4. API testing tool (Postman, Insomnia, or curl)
5. Browser with DevTools

## Backend Testing

### Test 1: No License in Database

**Objective:** Verify that application blocks access when no license exists.

**Setup:**
```sql
-- Make sure no active licenses exist
DELETE FROM system_licenses;
-- Or deactivate all
UPDATE system_licenses SET is_active = 0;
```

**Test Steps:**
1. Clear Laravel cache: `php artisan cache:clear`
2. Make API call to any endpoint:
   ```bash
   curl http://localhost:8000/api/v1/system/license/status
   ```

**Expected Result:**
```json
{
    "error": "license_required",
    "message": "Valid license required to access this application",
    "status": 403
}
```

**Also Test:**
```bash
# Try login endpoint
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**Expected:** Same 403 license_required error

✅ **PASS if:** All API endpoints return 403 with license_required error

---

### Test 2: Valid Active License

**Objective:** Verify that valid license allows access.

**Setup:**
```sql
INSERT INTO system_licenses (
    license_key,
    license_type,
    issued_to,
    issued_at,
    expires_at,
    is_active
) VALUES (
    'LYZ-TEST-2026-VALID',
    'standard',
    'Test Installation',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 YEAR),
    1
);
```

**Test Steps:**
1. Clear cache: `php artisan cache:clear`
2. Call license status endpoint:
   ```bash
   curl http://localhost:8000/api/v1/system/license/status
   ```

**Expected Result:**
```json
{
    "valid": true,
    "expires_at": "2027-07-12T...",
    "days_remaining": 365,
    "license_type": "standard",
    "issued_to": "Test Installation",
    "is_expiring_soon": false
}
```

**Also Test:**
- Other API endpoints should work normally
- Login should be accessible

✅ **PASS if:** License status shows valid and other endpoints work

---

### Test 3: Expired License

**Objective:** Verify that expired license blocks access.

**Setup:**
```sql
-- Update license to be expired
UPDATE system_licenses
SET expires_at = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE license_key = 'LYZ-TEST-2026-VALID';
```

**Test Steps:**
1. Clear cache: `php artisan cache:clear`
2. Call any API endpoint

**Expected Result:**
- 403 error with license_required message
- Same behavior as no license

✅ **PASS if:** Expired license is treated as no license

---

### Test 4: Inactive License (is_active = false)

**Objective:** Verify that deactivated license blocks access.

**Setup:**
```sql
-- Set license to inactive
UPDATE system_licenses
SET 
    is_active = 0,
    expires_at = DATE_ADD(NOW(), INTERVAL 1 YEAR)
WHERE license_key = 'LYZ-TEST-2026-VALID';
```

**Test Steps:**
1. Clear cache: `php artisan cache:clear`
2. Call any API endpoint

**Expected Result:**
- 403 error with license_required message

✅ **PASS if:** Inactive license blocks access even if not expired

---

### Test 5: Middleware Caching

**Objective:** Verify that license check is cached to reduce database load.

**Setup:**
```sql
-- Ensure valid license exists
UPDATE system_licenses
SET is_active = 1, expires_at = DATE_ADD(NOW(), INTERVAL 1 YEAR)
WHERE license_key = 'LYZ-TEST-2026-VALID';
```

**Test Steps:**
1. Clear cache: `php artisan cache:clear`
2. Make first API call (will check database)
3. Make second API call immediately (should use cache)
4. Check Laravel logs or enable query logging

**Expected Result:**
- First call queries database
- Subsequent calls within 5 minutes use cache
- No database query on cached calls

**Verify Cache:**
```bash
# In Laravel tinker
php artisan tinker
> Cache::get('system_has_valid_license')
```

✅ **PASS if:** Cache reduces database queries

---

### Test 6: License Expiring Soon Warning

**Objective:** Verify that system detects licenses about to expire.

**Setup:**
```sql
-- Set license to expire in 15 days
UPDATE system_licenses
SET expires_at = DATE_ADD(NOW(), INTERVAL 15 DAY)
WHERE license_key = 'LYZ-TEST-2026-VALID';
```

**Test Steps:**
1. Clear cache
2. Call license status endpoint

**Expected Result:**
```json
{
    "valid": true,
    "expires_at": "...",
    "days_remaining": 15,
    "license_type": "standard",
    "issued_to": "Test Installation",
    "is_expiring_soon": true  // <-- Should be true
}
```

✅ **PASS if:** is_expiring_soon is true when <= 30 days remaining

---

### Test 7: Multiple Licenses

**Objective:** Verify behavior with multiple license records.

**Setup:**
```sql
-- Create multiple licenses
INSERT INTO system_licenses (license_key, license_type, issued_to, issued_at, expires_at, is_active)
VALUES 
    ('LYZ-TEST-1', 'trial', 'Test 1', NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY), 1),  -- Expired
    ('LYZ-TEST-2', 'standard', 'Test 2', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 0),  -- Inactive
    ('LYZ-TEST-3', 'standard', 'Test 3', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1);  -- Valid
```

**Test Steps:**
1. Clear cache
2. Call license status endpoint

**Expected Result:**
- Should find and use the valid license (LYZ-TEST-3)
- Other invalid licenses ignored

✅ **PASS if:** System correctly identifies valid license among multiple records

---

## Frontend Testing

### Test 8: Initial Load with No License

**Objective:** Verify that frontend shows "No License" page when no license exists.

**Setup:**
```sql
DELETE FROM system_licenses;
```

**Test Steps:**
1. Clear browser cache and localStorage
2. Close and reopen browser
3. Navigate to application URL

**Expected Result:**
- Shows "Checking license..." briefly
- Then displays "No License" page with:
  - Lock icon
  - "License Required" heading
  - Contact administrator message
  - Logo and branding

**Verify:**
- Open DevTools → Network tab
- Should see API call to `/api/v1/system/license/status`
- Should receive 403 response

✅ **PASS if:** NoLicensePage is displayed and login page is NOT accessible

---

### Test 9: Initial Load with Valid License

**Objective:** Verify that frontend shows login page when license is valid.

**Setup:**
```sql
INSERT INTO system_licenses (license_key, license_type, issued_to, issued_at, expires_at, is_active)
VALUES ('LYZ-TEST-VALID', 'standard', 'Test', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1);
```

**Test Steps:**
1. Clear browser cache and localStorage
2. Clear Laravel cache: `php artisan cache:clear`
3. Reload application

**Expected Result:**
- Shows "Checking license..." briefly
- Then displays login page normally
- Can interact with login form

**Verify in DevTools:**
- Network tab shows license check returning `valid: true`
- localStorage contains `system_license_status` with cached data

✅ **PASS if:** Login page is accessible

---

### Test 10: License Cache in Frontend

**Objective:** Verify that frontend caches license status.

**Setup:**
- Valid license exists in database
- Application has been loaded once

**Test Steps:**
1. Open application (loads with valid license)
2. Open DevTools → Application → Local Storage
3. Check for `system_license_status` key
4. Refresh page

**Expected Result:**
- First load: Shows "Checking license..." then caches result
- Refresh: Instantly shows login page (uses cache)
- Cache contains timestamp and status
- Cache expires after 5 minutes

**Verify:**
```javascript
// In browser console
localStorage.getItem('system_license_status')
```

✅ **PASS if:** License status is cached and reused on refresh

---

### Test 11: License Expires During Active Session

**Objective:** Verify that application blocks access when license expires during use.

**Setup:**
1. Start with valid license
2. User is logged in and using application

**Test Steps:**
1. While user is logged in, deactivate license:
   ```sql
   UPDATE system_licenses SET is_active = 0;
   ```
2. Clear Laravel cache: `php artisan cache:clear`
3. In the logged-in session, make any action (click navigation, etc.)

**Expected Result:**
- Next API call returns 403 license_required
- Frontend detects error
- Page reloads automatically
- Shows "No License" page

**Verify in DevTools Console:**
- Should see error message
- localStorage cache cleared
- Page reload triggered

✅ **PASS if:** User is blocked from further access and shown NoLicensePage

---

### Test 12: License Renewed During "No License" State

**Objective:** Verify that users can access app after license renewal.

**Setup:**
1. Start with no license (NoLicensePage showing)

**Test Steps:**
1. Insert valid license:
   ```sql
   INSERT INTO system_licenses (license_key, license_type, issued_to, issued_at, expires_at, is_active)
   VALUES ('LYZ-TEST-RENEWED', 'standard', 'Test', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1);
   ```
2. Clear Laravel cache: `php artisan cache:clear`
3. In browser, refresh page (F5)

**Expected Result:**
- License check runs again
- Detects valid license
- Shows login page
- Users can now log in

✅ **PASS if:** Application becomes accessible after license added

---

### Test 13: Browser Console Errors

**Objective:** Verify no JavaScript errors in console.

**Test Steps:**
1. Open DevTools → Console
2. Test with valid license
3. Test with no license
4. Test license state transitions

**Expected Result:**
- No React errors
- No uncaught exceptions
- Only expected license-related logs (if any)

✅ **PASS if:** Console is clean except for intentional logging

---

### Test 14: Multiple Browser Tabs

**Objective:** Verify license checking across multiple tabs.

**Test Steps:**
1. Open application in multiple browser tabs
2. Deactivate license in database
3. Clear cache
4. Interact with each tab

**Expected Result:**
- All tabs eventually show NoLicensePage
- Each tab detects license error on next API call
- Cache is shared across tabs (localStorage)

✅ **PASS if:** All tabs respect license status

---

### Test 15: Hard Refresh Behavior

**Objective:** Verify that hard refresh respects current license state.

**Test Steps:**
1. Start with valid license (logged in)
2. Deactivate license
3. Perform hard refresh (Ctrl+Shift+R)

**Expected Result:**
- Cache is cleared by hard refresh
- New license check runs
- Shows NoLicensePage if license invalid

✅ **PASS if:** Hard refresh always checks fresh license status

---

## Integration Testing

### Test 16: Complete User Flow - No License

**Objective:** End-to-end test of blocked access.

**Scenario:** New user tries to access application without license.

**Steps:**
1. No license in database
2. User opens application URL
3. Sees "No License" page
4. Tries to manually navigate to `/authentication/sign-in`
5. Tries API calls via DevTools

**Expected Result:**
- Cannot access login page
- Cannot access any protected routes
- All API calls return 403
- User is properly blocked

✅ **PASS if:** No way to bypass license check

---

### Test 17: Complete User Flow - With License

**Objective:** End-to-end test of normal access.

**Scenario:** User accesses application with valid license.

**Steps:**
1. Valid license in database
2. User opens application
3. Sees login page
4. Logs in successfully
5. Uses application features

**Expected Result:**
- Login page accessible
- Authentication works
- All features available
- License check transparent to user

✅ **PASS if:** Normal user flow works seamlessly

---

### Test 18: Admin Workflow - License Management

**Objective:** Test typical admin license management tasks.

**Scenario:** Admin needs to manage licenses.

**Steps:**
1. Check current license status
2. See expiration warning
3. Extend license
4. Verify extension worked

**SQL Commands:**
```sql
-- Check status
SELECT * FROM system_licenses WHERE is_active = 1;

-- Extend license
UPDATE system_licenses
SET expires_at = DATE_ADD(NOW(), INTERVAL 1 YEAR)
WHERE license_key = 'YOUR-KEY';

-- Verify
SELECT DATEDIFF(expires_at, NOW()) AS days_remaining 
FROM system_licenses 
WHERE license_key = 'YOUR-KEY';
```

✅ **PASS if:** Admin can successfully manage licenses via SQL

---

## Performance Testing

### Test 19: Response Time with License Check

**Objective:** Verify that license check doesn't significantly slow down requests.

**Test Steps:**
1. Use valid license
2. Measure API response times:
   ```bash
   # First request (no cache)
   time curl http://localhost:8000/api/v1/system/license/status
   
   # Second request (with cache)
   time curl http://localhost:8000/api/v1/system/license/status
   ```

**Expected Result:**
- First request: Normal + database query (~100-200ms)
- Cached requests: Fast (~10-50ms)
- Cache lasts 5 minutes

✅ **PASS if:** Cached requests are significantly faster

---

### Test 20: Concurrent Requests

**Objective:** Verify license check handles concurrent requests.

**Test Steps:**
1. Make multiple simultaneous API requests
2. Monitor database connections
3. Check for race conditions

**Tools:**
- Apache Bench: `ab -n 100 -c 10 http://localhost:8000/api/v1/system/license/status`
- Or Postman Collection Runner

**Expected Result:**
- All requests handled correctly
- No database connection issues
- Cache prevents excessive queries

✅ **PASS if:** System handles concurrent load

---

## Security Testing

### Test 21: Bypass Attempts

**Objective:** Verify that license check cannot be bypassed.

**Attempts:**
1. **Direct API calls without license:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}'
   ```
   Expected: 403 license_required

2. **Modify localStorage in browser:**
   ```javascript
   localStorage.setItem('system_license_status', JSON.stringify({
     status: { valid: true },
     timestamp: Date.now()
   }));
   location.reload();
   ```
   Expected: Frontend may show login briefly, but API calls still fail

3. **Disable JavaScript:**
   - Disable JS in browser
   - Try to access application
   Expected: Cannot render React app, but even if static HTML loads, API calls fail

4. **Manually navigate to routes:**
   - Try `/school/dashboard` directly
   Expected: Blocked by license guard

✅ **PASS if:** All bypass attempts fail

---

## Test Summary Checklist

Use this checklist to track your testing progress:

**Backend Tests:**
- [ ] Test 1: No license blocks access
- [ ] Test 2: Valid license allows access
- [ ] Test 3: Expired license blocks access
- [ ] Test 4: Inactive license blocks access
- [ ] Test 5: Middleware caching works
- [ ] Test 6: Expiring soon warning
- [ ] Test 7: Multiple licenses handled correctly

**Frontend Tests:**
- [ ] Test 8: NoLicensePage shows when no license
- [ ] Test 9: Login page shows with valid license
- [ ] Test 10: Frontend caching works
- [ ] Test 11: License expiry during session
- [ ] Test 12: License renewal detection
- [ ] Test 13: No console errors
- [ ] Test 14: Multiple tabs behavior
- [ ] Test 15: Hard refresh behavior

**Integration Tests:**
- [ ] Test 16: Complete blocked flow
- [ ] Test 17: Complete normal flow
- [ ] Test 18: Admin management workflow

**Performance Tests:**
- [ ] Test 19: Response time acceptable
- [ ] Test 20: Concurrent requests handled

**Security Tests:**
- [ ] Test 21: Cannot bypass license check

---

## Automated Testing Script

For quick verification, use this bash script:

```bash
#!/bin/bash
# license-test.sh - Quick license system test

BASE_URL="http://localhost:8000/api/v1"

echo "=== License System Quick Test ==="
echo ""

# Test 1: Check license status
echo "Test 1: Checking license status..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/system/license/status")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✅ Valid license found"
    echo "$body" | python3 -m json.tool
elif [ "$http_code" = "403" ]; then
    echo "❌ No valid license (403)"
    echo "$body" | python3 -m json.tool
else
    echo "⚠️  Unexpected response: $http_code"
fi

echo ""

# Test 2: Try login endpoint
echo "Test 2: Testing login endpoint..."
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}')
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "403" ]; then
    echo "✅ Login blocked without license (as expected)"
elif [ "$http_code" = "422" ] || [ "$http_code" = "401" ]; then
    echo "✅ Login accessible with license (got auth error, which is ok)"
else
    echo "⚠️  Unexpected response: $http_code"
fi

echo ""
echo "=== Testing Complete ==="
```

Save as `license-test.sh`, make executable, and run:
```bash
chmod +x license-test.sh
./license-test.sh
```

---

## Reporting Issues

When reporting issues with the license system, include:

1. **Environment details:**
   - Laravel version
   - PHP version
   - Database type and version
   - Browser and version

2. **License status:**
   - Output of license status SQL query
   - Cache status (`php artisan cache:clear` done?)

3. **Error details:**
   - API response codes and messages
   - Browser console errors
   - Laravel log entries

4. **Steps to reproduce:**
   - Exact sequence of actions
   - Database state before testing
   - Expected vs actual behavior

5. **Network information:**
   - API request/response from DevTools Network tab
   - Any CORS or network errors

---

## Next Steps After Testing

After completing all tests:

1. ✅ Document test results
2. ✅ Fix any identified issues
3. ✅ Re-test failed scenarios
4. ✅ Deploy to staging environment
5. ✅ Perform user acceptance testing
6. ✅ Create monitoring alerts for license expiry
7. ✅ Document license renewal process for operations team
8. ✅ Schedule regular license audits

---

**Testing completed successfully? You're ready for production! 🎉**
