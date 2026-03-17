# Prisma Setup Steps for Older MySQL Versions

## Quick Setup Guide

If you're encountering MySQL compatibility issues with Prisma, follow these steps:

### 1. Create Prisma Migrations Table

Prisma needs a tracking table that it can't create on older MySQL versions. Create it manually:

**Using the script** (requires .env configured):
```bash
npm run prisma:setup-migrations
```

**Or manually via MySQL client**:
```sql
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` VARCHAR(36) NOT NULL,
  `checksum` VARCHAR(64) NOT NULL,
  `finished_at` DATETIME NULL,
  `migration_name` VARCHAR(255) NOT NULL,
  `logs` TEXT NULL,
  `rolled_back_at` DATETIME NULL,
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `applied_steps_count` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Mark Initial Migration as Applied

If your database already has the tables:

```bash
# Find your migration name (it's in prisma/migrations/)
# Example: 20260129113126_init
npx prisma migrate resolve --applied init
```

If your database is empty, apply the migration:
```bash
# Apply the migration SQL manually or use:
mysql -u username -p database_name < prisma/migrations/[timestamp]_init/migration.sql
```

Then mark it as applied:
```bash
npx prisma migrate resolve --applied init
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Verify Everything Works

```bash
# Validate schema
npx prisma validate

# Test Prisma Client (optional)
node -e "const { PrismaClient } = require('./lib/generated/prisma'); console.log('Prisma Client loaded successfully')"
```

## Troubleshooting

### Error: "Unknown column 'datetime_precision'"
- Your MySQL version is < 5.7
- Solution: Use manual migrations (see PRISMA_MYSQL_COMPATIBILITY.md)

### Error: "SQL syntax error near '(3)'"
- Prisma is trying to create `_prisma_migrations` table with incompatible syntax
- Solution: Create the table manually using Step 1 above

### Error: "Migration not found"
- Make sure the migration folder exists in `prisma/migrations/`
- Check that `migration_lock.toml` exists

## Next Steps

Once setup is complete:
- Use Prisma Client in your code: `import { prisma } from '@/lib/prisma'`
- For future migrations, see PRISMA_MIGRATIONS.md
