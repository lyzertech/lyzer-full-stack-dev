# Prisma Migration Management Guide

This guide explains how to use Prisma for database migration management in this project.

## Overview

Prisma has been set up as the migration management system for this project. It provides:
- **Version control** for database schema changes
- **Type-safe** database access via Prisma Client
- **Migration history** tracking
- **Rollback** capabilities
- **Team collaboration** on schema changes

## Prerequisites

1. Ensure you have a `.env` file with `DATABASE_URL` configured:
   ```env
   DATABASE_URL="mysql://username:password@host:port/database"
   ```
   
   Or use individual environment variables (already configured in `prisma.config.ts`):
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_DATABASE=lyzer-nextjs
   ```

## Initial Setup

### 1. Generate Prisma Client

After making changes to `prisma/schema.prisma`, generate the Prisma Client:

```bash
npm run prisma:generate
```

This creates the type-safe Prisma Client in `lib/generated/prisma`.

### 2. Create Initial Migration (First Time Only)

If you're setting up Prisma for the first time on an existing database:

**Option A: If your database already has tables** (recommended for existing projects):

⚠️ **Note**: If you encounter `Unknown column 'datetime_precision'` error, your MySQL version is older than 5.7. Prisma requires MySQL 5.7+ for introspection. You have two options:

**Option A1: Skip introspection (schema.prisma already created)**:
```bash
# Since schema.prisma already matches your database structure,
# create a baseline migration directly:
npm run prisma:migrate -- --name init --create-only

# Review the generated migration SQL, then apply it:
npx prisma migrate resolve --applied init
```

**Option A2: Upgrade MySQL** (recommended):
- Upgrade to MySQL 5.7+ or MariaDB 10.2+
- Then use: `npm run prisma:db:pull`

**Option B: If starting fresh**:
```bash
# Create and apply the initial migration
npm run prisma:migrate -- --name init
```

## Daily Workflow

### Creating a New Migration

1. **Edit `prisma/schema.prisma`** - Make your schema changes (add/remove/modify models)

2. **Create migration**:
   ```bash
   npm run prisma:migrate
   ```
   
   Prisma will:
   - Prompt you to name the migration
   - Generate SQL migration files in `prisma/migrations/`
   - Apply the migration to your database
   - Regenerate Prisma Client automatically

3. **Review the migration** - Check the generated SQL in `prisma/migrations/[timestamp]_[name]/migration.sql`

### Example: Adding a New Field

```prisma
// prisma/schema.prisma
model SchoolStudent {
  // ... existing fields
  email String? @db.VarChar(255)  // Add this line
}
```

Then run:
```bash
npm run prisma:migrate -- --name add_student_email
```

### Applying Migrations in Production

For production deployments, use:
```bash
npm run prisma:migrate:deploy
```

This applies pending migrations without prompting and is safe for CI/CD pipelines.

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run prisma:generate` | Generate Prisma Client from schema |
| `npm run prisma:migrate` | Create and apply a new migration (development) |
| `npm run prisma:migrate:deploy` | Apply pending migrations (production) |
| `npm run prisma:migrate:reset` | Reset database and apply all migrations |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run prisma:db:pull` | Pull schema from existing database |
| `npm run prisma:db:push` | Push schema changes without creating migration |

## Migration Best Practices

### 1. Always Review Generated SQL

Before committing migrations, review the generated SQL files:
```bash
# Check the migration file
cat prisma/migrations/[timestamp]_[name]/migration.sql
```

### 2. Use Descriptive Migration Names

```bash
npm run prisma:migrate -- --name add_email_to_students
npm run prisma:migrate -- --name create_finance_reports_table
```

### 3. Test Migrations Locally First

Always test migrations on a development database before applying to production.

### 4. Backup Before Major Migrations

For production databases, always backup before running migrations:
```bash
# Backup MySQL database
mysqldump -u username -p database_name > backup.sql
```

### 5. Handle Data Migrations Separately

Prisma migrations handle schema changes. For data migrations:
- Create a separate script in `scripts/` directory
- Run it after schema migrations
- Document it in migration comments

## Working with Existing SQL Migrations

If you have existing SQL files in the `db/` directory:

1. **One-time migration**: You can run your existing SQL migrations first, then use `prisma db pull` to sync the schema
2. **Gradual transition**: Keep using `npm run db:migrate` for legacy migrations, use Prisma for new changes
3. **Full migration**: Convert all SQL migrations to Prisma migrations (recommended for long-term)

## Using Prisma Client in Your Code

After generating Prisma Client, you can use it in your application:

```typescript
import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

// Example: Query students
const students = await prisma.schoolStudent.findMany({
  where: { status: 'Active' },
  include: { gradeRelation: true }
})

// Example: Create a transaction
const transaction = await prisma.financeTransaction.create({
  data: {
    transactionType: 'Income',
    accountId: 1,
    amount: 1000.00,
    balanceAfter: 1000.00,
    transactionDate: new Date(),
  }
})
```

## Troubleshooting

### MySQL Version Compatibility Issues

**Error: `Unknown column 'datetime_precision'`**

This means your MySQL version is older than 5.7. Prisma requires MySQL 5.7+ for introspection.

**Solutions:**
1. **Upgrade MySQL** to 5.7+ or MariaDB 10.2+ (recommended)
2. **Skip introspection**: Since `schema.prisma` already exists, create migrations directly:
   ```bash
   # Create migration without applying
   npm run prisma:migrate -- --name init --create-only
   
   # Manually review and edit the migration SQL if needed
   # Then mark it as applied (if database already has tables)
   npx prisma migrate resolve --applied init
   ```

### Migration Conflicts

If you have migration conflicts:
```bash
# Reset migrations (WARNING: This will drop your database)
npm run prisma:migrate:reset

# Or resolve manually by editing migration files
```

### Schema Drift

If your database schema doesn't match `schema.prisma`:
```bash
# Pull current schema from database (requires MySQL 5.7+)
npm run prisma:db:pull

# Review differences, then create a migration to sync
npm run prisma:migrate -- --name sync_schema
```

**Note**: If `prisma db pull` fails due to MySQL version, manually update `schema.prisma` to match your database structure.

### Connection Issues

Ensure your `DATABASE_URL` is correct:
```bash
# Test connection
npx prisma db pull
```

## Migration Files Structure

```
prisma/
├── schema.prisma          # Your schema definition
├── migrations/            # Migration history
│   ├── 20240101000000_init/
│   │   └── migration.sql
│   ├── 20240102000000_add_email/
│   │   └── migration.sql
│   └── migration_lock.toml
└── ...
```

## Next Steps

1. **Set up DATABASE_URL** in your `.env` file
2. **Generate Prisma Client**: `npm run prisma:generate`
3. **Create initial migration**: `npm run prisma:migrate -- --name init`
4. **Start using Prisma Client** in your application code

## Additional Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
