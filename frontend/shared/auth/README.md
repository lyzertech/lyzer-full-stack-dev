# Authentication System Documentation

## Overview

This is a production-ready, future-proof authentication system built with Firebase Authentication and React Context API. It provides secure authentication, route protection, and session management while maintaining the existing UI.

## Architecture

### Core Components

1. **AuthContext** (`AuthContext.tsx`)
   - Global authentication state management
   - Provides auth methods (login, logout, social login)
   - Listens to Firebase auth state changes
   - Persists auth state across page reloads

2. **ProtectedRoute** (`ProtectedRoute.tsx`)
   - Client-side route protection component
   - Redirects unauthenticated users to login
   - Redirects authenticated users away from login page
   - Shows loading state during auth check

3. **Types** (`types.ts`)
   - TypeScript type definitions
   - AuthUser interface
   - AuthContextType interface
   - Helper functions for user mapping

4. **Middleware** (`middleware.ts`)
   - Next.js edge middleware for route protection
   - Can be extended for server-side token validation
   - Currently allows client-side handling

## File Structure

```
shared/auth/
├── AuthContext.tsx      # Auth provider and context
├── ProtectedRoute.tsx   # Route protection component
├── types.ts            # Type definitions
└── README.md           # This file

middleware.ts           # Next.js middleware (root level)
```

## Usage

### 1. Wrap Your App with AuthProvider

The `AuthProvider` is already added to `app/layout.tsx`:

```tsx
import { AuthProvider } from '@/shared/auth/AuthContext';

<AuthProvider>
  {children}
</AuthProvider>
```

### 2. Use Auth in Components

```tsx
import { useAuth } from '@/shared/auth/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Access user data
  console.log(user?.email);
  
  // Check auth status
  if (isAuthenticated) {
    // User is logged in
  }
};
```

### 3. Protect Routes

#### Option A: Wrap Layout (Recommended for dashboard routes)

```tsx
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';

const DashboardLayout = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
};
```

#### Option B: Wrap Individual Pages

```tsx
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';

const ProtectedPage = () => {
  return (
    <ProtectedRoute requireAuth={true}>
      <div>Protected Content</div>
    </ProtectedRoute>
  );
};
```

#### Option C: Redirect Authenticated Users (Login Page)

```tsx
<ProtectedRoute requireAuth={false}>
  <LoginForm />
</ProtectedRoute>
```

### 4. Login Methods

#### Email/Password Login

```tsx
const { login } = useAuth();

try {
  await login(email, password);
  // Success - user is automatically logged in
} catch (error) {
  // Handle error
  console.error(error.message);
}
```

#### Google Login

```tsx
const { loginWithGoogle } = useAuth();

try {
  await loginWithGoogle();
  // Success
} catch (error) {
  // Handle error
}
```

#### Facebook Login

```tsx
const { loginWithFacebook } = useAuth();

try {
  await loginWithFacebook();
  // Success
} catch (error) {
  // Handle error
}
```

### 5. Logout

```tsx
const { logout } = useAuth();

const handleLogout = async () => {
  try {
    await logout();
    // User is logged out and redirected
  } catch (error) {
    // Handle error
  }
};
```

## API Reference

### AuthContext Methods

#### `user: AuthUser | null`
Current authenticated user object, or `null` if not authenticated.

#### `loading: boolean`
`true` while authentication state is being determined.

#### `isAuthenticated: boolean`
`true` if user is authenticated, `false` otherwise.

#### `login(email: string, password: string): Promise<void>`
Signs in with email and password. Throws error on failure.

#### `loginWithGoogle(): Promise<void>`
Signs in with Google OAuth. Throws error on failure.

#### `loginWithFacebook(): Promise<void>`
Signs in with Facebook OAuth. Throws error on failure.

#### `logout(): Promise<void>`
Signs out the current user. Clears auth state.

#### `refreshUser(): Promise<void>`
Refreshes user data from Firebase. Useful after profile updates.

### AuthUser Interface

```typescript
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role?: string;              // Optional: for role-based access
  permissions?: string[];     // Optional: for permission-based access
}
```

## Features

### ✅ Implemented

- [x] Email/password authentication
- [x] Google OAuth (ready to use)
- [x] Facebook OAuth (ready to use)
- [x] Global auth state management
- [x] Auth state persistence across reloads
- [x] Route protection
- [x] Automatic redirects
- [x] Loading states
- [x] Error handling
- [x] Logout functionality
- [x] Session management

### 🔄 Ready for Extension

- [ ] Role-based access control (RBAC)
- [ ] Permission-based access control
- [ ] Refresh tokens
- [ ] Multi-tenant authentication
- [ ] Two-factor authentication (2FA)
- [ ] Session timeout handling
- [ ] Remember me functionality
- [ ] Password reset flow
- [ ] Email verification flow

## Extending the System

### Adding Roles and Permissions

1. **Update Firebase Custom Claims** (Backend/Cloud Functions):

```javascript
// Firebase Cloud Function example
admin.auth().setCustomUserClaims(uid, {
  role: 'admin',
  permissions: ['read', 'write', 'delete']
});
```

2. **Update types.ts**:

```typescript
export interface AuthUser {
  // ... existing fields
  role?: string;
  permissions?: string[];
}
```

3. **Update AuthContext.tsx** to read custom claims:

```typescript
const mapFirebaseUser = (firebaseUser: FirebaseUser | null): AuthUser | null => {
  if (!firebaseUser) return null;
  
  const token = await firebaseUser.getIdTokenResult();
  
  return {
    // ... existing fields
    role: token.claims.role,
    permissions: token.claims.permissions,
  };
};
```

4. **Create Role-Based ProtectedRoute**:

```tsx
// shared/auth/RoleProtectedRoute.tsx
export const RoleProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole: string;
}) => {
  const { user } = useAuth();
  
  if (user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

### Adding Refresh Tokens

1. **Store refresh token** in AuthContext
2. **Implement token refresh logic** before API calls
3. **Handle token expiration** gracefully

### Adding Multi-Tenant Support

1. **Add tenantId to AuthUser** interface
2. **Store tenant context** in AuthContext
3. **Filter data by tenant** in API calls
4. **Add tenant switching** functionality

### Adding Session Timeout

1. **Track last activity** in AuthContext
2. **Set timeout interval** (e.g., 30 minutes)
3. **Auto-logout** on timeout
4. **Show warning** before timeout

## Security Best Practices

1. **Firebase Security Rules**: Configure Firestore/Storage rules properly
2. **HTTPS Only**: Ensure all auth endpoints use HTTPS
3. **Token Validation**: Validate tokens on server-side when needed
4. **Error Messages**: Don't expose sensitive error details to users
5. **Rate Limiting**: Implement rate limiting for login attempts
6. **Password Policy**: Enforce strong password requirements
7. **Email Verification**: Require email verification for sensitive operations

## Troubleshooting

### User not persisting after page reload

- Check Firebase auth persistence is enabled (default: enabled)
- Verify `onAuthStateChanged` listener is set up correctly
- Check browser console for errors

### Redirects not working

- Ensure `ProtectedRoute` wraps the component correctly
- Check `useRouter` is imported from `next/navigation`
- Verify redirect paths are correct

### Social login not working

- Verify OAuth providers are configured in Firebase Console
- Check authorized domains in Firebase settings
- Ensure popup blockers aren't blocking the OAuth popup

### Auth state not updating

- Check `onAuthStateChanged` listener is active
- Verify Firebase auth instance is correctly initialized
- Check for errors in browser console

## Testing

### Manual Testing Checklist

- [ ] Login with email/password
- [ ] Login with Google
- [ ] Login with Facebook
- [ ] Logout
- [ ] Access protected route while logged out (should redirect)
- [ ] Access login page while logged in (should redirect)
- [ ] Refresh page while logged in (should stay logged in)
- [ ] Session persists across browser tabs

## Migration Notes

### From Old System

The old system used direct Firebase calls. The new system:
- Centralizes auth logic in AuthContext
- Provides consistent API across the app
- Handles auth state automatically
- Provides better error handling

### Breaking Changes

- Direct `auth.signInWithEmailAndPassword` calls should use `login()` from `useAuth()`
- Direct `auth.signOut()` calls should use `logout()` from `useAuth()`
- Auth state checks should use `isAuthenticated` from `useAuth()`

## Support

For issues or questions:
1. Check this documentation
2. Review Firebase Authentication docs
3. Check browser console for errors
4. Review Next.js middleware documentation

## License

Part of the main project license.

