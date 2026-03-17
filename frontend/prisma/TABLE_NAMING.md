# Authentication Table Naming Convention

## Overview

All authentication-related tables use the `auth_*` prefix to clearly identify them as part of the authentication system and avoid naming conflicts with other modules.

## Table Names

| Model Name | Database Table Name |
|------------|---------------------|
| User | `auth_users` |
| Role | `auth_roles` |
| Permission | `auth_permissions` |
| UserRole | `auth_user_roles` |
| RolePermission | `auth_role_permissions` |
| UserSession | `auth_user_sessions` |
| RefreshToken | `auth_refresh_tokens` |
| UserSettings | `auth_user_settings` |
| AuditLog | `auth_audit_logs` |
| Notification | `auth_notifications` |

## Benefits

1. **Clear Organization**: All auth tables are grouped together
2. **No Conflicts**: Avoids conflicts with other modules (e.g., `users` vs `auth_users`)
3. **Easy Identification**: Quick to identify authentication tables in database
4. **Consistent Naming**: Follows a clear pattern across all auth models

## Usage in Code

When using Prisma, you reference the **model name** (not the table name):

```typescript
// ✅ Correct - Use model name
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// ❌ Wrong - Don't use table name directly
// const user = await prisma.auth_users.findUnique(...)
```

Prisma automatically maps the model name to the table name using the `@@map` directive in the schema.

## Raw SQL Queries

If you need to write raw SQL queries, use the table names:

```sql
-- ✅ Use table name in raw SQL
SELECT * FROM auth_users WHERE email = ?;

-- ✅ Join with auth tables
SELECT u.*, r.name as role_name
FROM auth_users u
JOIN auth_user_roles ur ON u.id = ur.user_id
JOIN auth_roles r ON ur.role_id = r.id;
```

## Migration Notes

When running migrations, Prisma will create tables with the `auth_*` prefix:

```bash
npx prisma migrate dev --name add_authentication_models
```

This will create:
- `auth_users`
- `auth_roles`
- `auth_permissions`
- etc.

## Related Modules

Other modules use their own prefixes:
- Finance: `finance_*` (e.g., `finance_banks`, `finance_accounts`)
- School: `school_*` (e.g., `school_grades`, `school_students`)
- Explore: `explore_*` (e.g., `explore_users`, `explore_posts`)

This consistent naming helps organize the database schema clearly.

