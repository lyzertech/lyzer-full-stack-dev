# Authentication Schema Documentation

## Overview

This document describes the authentication-related database models added to the Prisma schema. These models provide a comprehensive, future-proof foundation for user authentication, authorization, and security.

## Models

### 1. User Model

The main user model that links Firebase Authentication UIDs to your database.

**Key Features:**
- Links to Firebase UID (primary authentication identifier)
- Profile information (name, email, photo, etc.)
- Account status management (active, suspended, banned)
- Security tracking (last login, IP address, 2FA)
- Multi-tenant support
- Soft delete support

**Important Fields:**
- `firebaseUid`: Unique Firebase Authentication UID
- `email`: User's email address (unique)
- `status`: Account status (Active, Inactive, Suspended, Banned, PendingVerification)
- `tenantId`: For multi-tenant applications
- `deletedAt`: Soft delete timestamp

**Relations:**
- `roles`: User's assigned roles
- `sessions`: Active user sessions
- `refreshTokens`: Refresh tokens for API access
- `auditLogs`: Security audit trail
- `userSettings`: User preferences
- `notifications`: User notifications

### 2. Role Model

Defines roles in the system (e.g., Admin, User, Moderator).

**Key Features:**
- System roles (cannot be deleted)
- Active/inactive status
- Unique slug for programmatic access

**Example Roles:**
- `admin` - Full system access
- `user` - Standard user access
- `moderator` - Content moderation access
- `finance_manager` - Finance module access

### 3. Permission Model

Granular permissions for fine-grained access control.

**Key Features:**
- Resource-based (e.g., "user", "finance", "school")
- Action-based (e.g., "create", "read", "update", "delete")
- Unique slug for programmatic access

**Example Permissions:**
- `user:create` - Create users
- `user:read` - Read user data
- `finance:transaction:create` - Create transactions
- `school:student:update` - Update student records

### 4. UserRole Model

Junction table linking users to roles.

**Key Features:**
- Many-to-many relationship
- Temporary roles (expiresAt)
- Assignment tracking (assignedBy, assignedAt)

**Use Cases:**
- Assign temporary admin access
- Track who assigned roles
- Time-limited permissions

### 5. RolePermission Model

Junction table linking roles to permissions.

**Key Features:**
- Many-to-many relationship
- Defines what each role can do

**Example:**
- Admin role → all permissions
- User role → basic read permissions
- Finance Manager → finance-related permissions

### 6. UserSession Model

Tracks active user sessions.

**Key Features:**
- Session token management
- Device tracking (deviceType, deviceId)
- IP address and user agent logging
- Last activity tracking
- Expiration management

**Use Cases:**
- Multi-device login management
- Security monitoring
- Session revocation
- "Remember me" functionality

### 7. RefreshToken Model

Manages refresh tokens for API authentication.

**Key Features:**
- Token rotation support
- Revocation tracking
- Expiration management
- Device/IP tracking

**Use Cases:**
- Long-lived API sessions
- Mobile app authentication
- Secure token refresh

### 8. UserSettings Model

User preferences and settings.

**Key Features:**
- Notification preferences
- Privacy settings
- UI preferences (theme, language, timezone)
- Application settings
- Custom settings (JSON)

**Example Settings:**
- Email notifications on/off
- Theme (light/dark)
- Language preference
- Items per page
- Date/time format

### 9. AuditLog Model

Security audit trail for all user actions.

**Key Features:**
- Action tracking (login, logout, data changes)
- Resource tracking (what was changed)
- IP address and user agent logging
- Severity levels (Info, Warning, Error, Critical)
- Metadata (JSON) for additional context

**Use Cases:**
- Security monitoring
- Compliance requirements
- Debugging issues
- User activity tracking

### 10. Notification Model

In-app notifications for users.

**Key Features:**
- Multiple notification types
- Read/unread status
- Link to related content
- Metadata for custom data

**Notification Types:**
- Info: General information
- Success: Success messages
- Warning: Warnings
- Error: Error messages
- System: System notifications
- Security: Security alerts

## Enums

### UserStatus
- `Active`: User account is active
- `Inactive`: User account is inactive
- `Suspended`: User account is temporarily suspended
- `Banned`: User account is permanently banned
- `PendingVerification`: User email/phone not verified

### ProfileVisibility
- `Public`: Profile visible to everyone
- `Private`: Profile visible only to user
- `Friends`: Profile visible to friends/followers
- `Custom`: Custom visibility rules

### AuditSeverity
- `Info`: Informational logs
- `Warning`: Warning-level events
- `Error`: Error-level events
- `Critical`: Critical security events

### NotificationType
- `Info`: General information
- `Success`: Success messages
- `Warning`: Warnings
- `Error`: Error messages
- `System`: System notifications
- `Security`: Security alerts

## Database Migrations

To apply these changes to your database:

```bash
# Create migration
npx prisma migrate dev --name add_authentication_models

# Apply migration to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## Usage Examples

### Creating a User

```typescript
const user = await prisma.user.create({
  data: {
    firebaseUid: 'firebase-uid-here',
    email: 'user@example.com',
    displayName: 'John Doe',
    status: 'Active',
  },
});
```

**Note:** The table name in the database is `auth_users` (not `users`).

### Assigning Roles

```typescript
// Assign admin role to user
await prisma.userRole.create({
  data: {
    userId: user.id,
    roleId: adminRole.id,
    assignedBy: currentUser.id,
  },
});
```

### Checking Permissions

```typescript
// Get user with roles and permissions
const userWithPermissions = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    },
  },
});

// Check if user has specific permission
const hasPermission = userWithPermissions.roles.some(
  (userRole) =>
    userRole.role.permissions.some(
      (rp) => rp.permission.slug === 'user:create'
    )
);
```

### Creating Audit Log

```typescript
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'login',
    resource: 'user',
    resourceId: user.id.toString(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    severity: 'Info',
  },
});
```

### Managing Sessions

```typescript
// Create session
const session = await prisma.userSession.create({
  data: {
    userId: user.id,
    sessionToken: generateToken(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
});

// Revoke session
await prisma.userSession.update({
  where: { id: session.id },
  data: { isActive: false },
});
```

## Integration with Firebase Auth

The schema is designed to work seamlessly with Firebase Authentication:

1. **Firebase UID as Primary Link**: The `firebaseUid` field links your database user to Firebase Auth
2. **No Password Storage**: Passwords are handled by Firebase
3. **Email Verification**: Sync with Firebase email verification status
4. **Token Management**: Use Firebase tokens for authentication, store refresh tokens in database

## Security Best Practices

1. **Indexes**: All foreign keys and frequently queried fields are indexed
2. **Soft Deletes**: Users are soft-deleted (not permanently removed)
3. **Audit Trail**: All important actions are logged
4. **Session Management**: Track and manage active sessions
5. **Role-Based Access**: Implement RBAC using roles and permissions
6. **Multi-Tenant**: Support for tenant isolation

## Future Extensions

The schema is designed to be easily extended:

1. **Two-Factor Authentication**: Fields already included (`twoFactorEnabled`, `twoFactorSecret`)
2. **Multi-Tenant**: `tenantId` field ready for use
3. **Custom Fields**: `metadata` JSON fields for flexible extensions
4. **Additional Roles**: Easy to add new roles and permissions
5. **Notification Channels**: Extend notification types as needed

## Migration Strategy

If you have existing users:

1. Create migration for new tables
2. Create a script to sync Firebase users to database
3. Assign default roles to existing users
4. Migrate user settings if applicable

## Performance Considerations

- All foreign keys are indexed
- Frequently queried fields have indexes
- Soft deletes use `deletedAt` index for efficient queries
- Consider archiving old audit logs periodically
- Clean up expired sessions and tokens regularly

## Maintenance

Regular maintenance tasks:

1. **Clean Expired Sessions**: Remove expired sessions periodically
2. **Archive Audit Logs**: Move old audit logs to archive table
3. **Revoke Old Tokens**: Clean up revoked refresh tokens
4. **Update Statistics**: Update user activity counters

## Support

For questions or issues:
1. Check Prisma documentation
2. Review Firebase Authentication docs
3. Check database indexes and query performance
4. Review audit logs for debugging

