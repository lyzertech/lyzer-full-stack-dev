# Database Authentication Setup Guide

## ✅ Implementation Complete

The authentication system has been switched from Firebase to a simple database-based authentication system using:
- **bcryptjs** for password hashing
- **Session cookies** for authentication
- **Prisma** for database operations
- **MySQL** database

## 📋 Setup Steps

### 1. Update Database Schema

You need to run a migration to add the `password` field to the `auth_users` table and make `firebase_uid` optional.

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_password_field

# Or if you prefer to push without migration
npx prisma db push
```

### 2. Verify Schema Changes

The `User` model now includes:
- `password` field (String?, nullable) - stores hashed passwords
- `firebaseUid` is now optional (String?) - for backward compatibility

### 3. Test the Authentication

1. **Sign Up**: Go to `/authentication/sign-up`
   - Enter email, password, confirm password
   - Optional: Enter display name
   - Click "Sign Up"

2. **Sign In**: Go to `/authentication/sign-in`
   - Enter the email and password you just created
   - Click "Sign In"

3. **Verify**: You should be redirected to the dashboard and see your user info in the header

## 🔧 API Routes

### POST `/api/auth/signup`
- Creates a new user account
- Hashes password with bcrypt
- Creates default user settings
- Assigns default 'user' role (if exists)
- Creates audit log entry

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe" // optional
}
```

### POST `/api/auth/signin`
- Authenticates user with email and password
- Creates session token
- Sets session cookie
- Updates last login info

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET `/api/auth/me`
- Returns current authenticated user
- Validates session token
- Updates last activity

### POST `/api/auth/signout`
- Invalidates session
- Clears session cookie

## 🔐 Security Features

- ✅ Passwords are hashed with bcrypt (10 rounds)
- ✅ Session tokens stored in database
- ✅ HTTP-only cookies for session management
- ✅ IP address and user agent tracking
- ✅ Audit logging for security events
- ✅ Account status checks (active/suspended)
- ✅ Session expiration (7 days)

## 📝 Notes

1. **Social Login**: Google and Facebook login are currently disabled. They can be implemented later if needed.

2. **Password Requirements**: 
   - Minimum 6 characters
   - Validated on both client and server

3. **Session Management**:
   - Sessions expire after 7 days
   - Sessions are stored in `auth_user_sessions` table
   - Multiple sessions per user are supported

4. **Backward Compatibility**:
   - `firebaseUid` field is now optional
   - Existing Firebase users can still exist in the database
   - New users won't have a `firebaseUid`

## 🚨 Troubleshooting

### Error: "User with this email already exists"
- The email is already registered
- Try signing in instead, or use a different email

### Error: "Invalid email or password"
- Check that email and password are correct
- Make sure the user account is active

### Error: "Account is inactive or suspended"
- User account has been deactivated
- Contact administrator to reactivate

### Migration Issues
- Make sure database connection is configured in `.env`
- Run `npx prisma generate` before migrations
- Check Prisma schema for syntax errors

## 📚 Next Steps

1. **Email Verification**: Add email verification flow
2. **Password Reset**: Implement password reset functionality
3. **Social Login**: Add Google/Facebook OAuth if needed
4. **Two-Factor Auth**: Enable 2FA using existing schema fields
5. **Role Management**: Set up default roles and permissions

