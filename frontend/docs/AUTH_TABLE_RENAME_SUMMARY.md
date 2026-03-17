# Authentication Table Rename Summary

## ✅ Changes Completed

All authentication model table names have been updated to use the `auth_*` prefix for better organization and to avoid naming conflicts.

## 📋 Table Name Changes

| Old Table Name | New Table Name | Model Name (Unchanged) |
|----------------|----------------|------------------------|
| `users` | `auth_users` | User |
| `roles` | `auth_roles` | Role |
| `permissions` | `auth_permissions` | Permission |
| `user_roles` | `auth_user_roles` | UserRole |
| `role_permissions` | `auth_role_permissions` | RolePermission |
| `user_sessions` | `auth_user_sessions` | UserSession |
| `refresh_tokens` | `auth_refresh_tokens` | RefreshToken |
| `user_settings` | `auth_user_settings` | UserSettings |
| `audit_logs` | `auth_audit_logs` | AuditLog |
| `notifications` | `auth_notifications` | Notification |

## 🔄 What Changed

### Schema Updates
- ✅ All `@@map()` directives updated in `prisma/schema.prisma`
- ✅ Model names remain unchanged (still use `User`, `Role`, etc. in code)
- ✅ All relationships and indexes preserved

### Documentation Updates
- ✅ `prisma/AUTH_SCHEMA_DOCUMENTATION.md` - Updated with table name notes
- ✅ `AUTH_SCHEMA_SUMMARY.md` - Updated with table naming convention
- ✅ `prisma/TABLE_NAMING.md` - New file explaining naming convention

## 📝 Important Notes

### Using Prisma (Recommended)
When using Prisma Client, continue using **model names** (not table names):

```typescript
// ✅ Correct - Use model name
const user = await prisma.user.findUnique({
  where: { id: userId }
});

const role = await prisma.role.findMany();
```

Prisma automatically maps model names to table names.

### Raw SQL Queries
If writing raw SQL, use the **table names**:

```sql
-- ✅ Use table name in raw SQL
SELECT * FROM auth_users WHERE email = ?;

-- ✅ Join auth tables
SELECT u.*, r.name as role_name
FROM auth_users u
JOIN auth_user_roles ur ON u.id = ur.user_id
JOIN auth_roles r ON ur.role_id = r.id;
```

## 🚀 Next Steps

### 1. Run Migration

If you haven't created the tables yet:
```bash
npx prisma migrate dev --name add_authentication_models
```

If tables already exist with old names, you'll need to:
1. Create a migration to rename tables
2. Or drop and recreate (if no production data)

### 2. Update Any Raw SQL Queries

If you have any raw SQL queries referencing the old table names, update them:
- `users` → `auth_users`
- `roles` → `auth_roles`
- etc.

### 3. Verify

After migration, verify tables are created correctly:
```bash
npx prisma studio
```

Or check in your database:
```sql
SHOW TABLES LIKE 'auth_%';
```

## ✨ Benefits

1. **Clear Organization**: All auth tables grouped with `auth_*` prefix
2. **No Conflicts**: Avoids conflicts with other modules
3. **Easy Identification**: Quick to identify authentication tables
4. **Consistent Pattern**: Matches other module naming (e.g., `finance_*`, `school_*`)

## 📚 Related Documentation

- `prisma/TABLE_NAMING.md` - Detailed naming convention guide
- `prisma/AUTH_SCHEMA_DOCUMENTATION.md` - Complete schema documentation
- `AUTH_SCHEMA_SUMMARY.md` - Quick reference guide

All changes are complete and ready for migration! 🎉

