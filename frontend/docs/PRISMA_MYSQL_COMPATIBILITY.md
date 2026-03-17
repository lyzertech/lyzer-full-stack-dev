# Prisma MySQL Compatibility Workaround

## Issue: `Unknown column 'datetime_precision'` Error

This error occurs when using Prisma with MySQL versions older than 5.7. Prisma's introspection feature requires MySQL 5.7+ or MariaDB 10.2+.

## Solution: Manual Migration Creation

Since your database likely already has tables, we've created the initial migration manually. Here's how to proceed:

### Step 0: Create Prisma Migrations Table (Required First)

Prisma needs a `_prisma_migrations` table to track migrations, but it fails to create it on older MySQL versions. Create it manually:

**Option A: Using the provided script** (recommended):
```bash
# Make sure your .env file has DB credentials configured
npm run prisma:setup-migrations
```

**Option B: Manual SQL execution**:
```sql
-- Run this SQL directly in your MySQL client
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

Or use the SQL file:
```bash
mysql -u username -p database_name < scripts/create_prisma_migrations_table.sql
```

### Step 1: Review the Migration

Check the generated migration SQL:
```bash
cat prisma/migrations/[timestamp]_init/migration.sql
```

### Step 2: Mark Migration as Applied (If Database Already Has Tables)

If your database already contains the tables defined in the schema:

```bash
# Mark the migration as applied without running it
npx prisma migrate resolve --applied init
```

**Important**: Only do this if your database schema matches the migration SQL. If there are differences, you'll need to:
1. Update `prisma/schema.prisma` to match your actual database
2. Regenerate the migration using `prisma migrate diff`
3. Or manually edit the migration SQL

### Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

### Step 4: Verify Setup

```bash
# Validate the schema
npx prisma validate

# Test Prisma Client generation
npm run prisma:generate
```

## Creating Future Migrations

For future schema changes, you have two options:

### Option A: Manual Migration (Recommended for MySQL < 5.7)

1. Edit `prisma/schema.prisma`
2. Generate migration SQL:
   ```bash
   npx prisma migrate diff --from-schema prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > migration.sql
   ```
3. Create migration folder:
   ```bash
   mkdir prisma/migrations/$(date +%Y%m%d%H%M%S)_migration_name
   mv migration.sql prisma/migrations/[timestamp]_migration_name/migration.sql
   ```
4. Apply manually or use `prisma migrate deploy`

### Option B: Upgrade MySQL (Recommended Long-term)

Upgrade to MySQL 5.7+ or MariaDB 10.2+ to use full Prisma features:
- `prisma db pull` will work
- `prisma migrate dev` will work without issues
- Better performance and features

## Checking MySQL Version

To check your MySQL version:
```sql
SELECT VERSION();
```

Or via command line:
```bash
mysql --version
```

## Notes

- The migration SQL has been generated and saved in `prisma/migrations/[timestamp]_init/migration.sql`
- Foreign key constraints are included in the migration
- All indexes match your original SQL schema
- The migration is ready to be applied or marked as applied
