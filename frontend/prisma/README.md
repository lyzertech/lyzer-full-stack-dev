# Prisma Setup Guide

This directory contains the Prisma schema for the lyzer-nextjs project.

## Quick Start

### 1. Install Dependencies

Prisma is already installed in the project. If you need to reinstall:

```bash
npm install
```

### 2. Configure Database Connection

Create a `.env` file in the project root with your database configuration:

```env
# Option 1: Use DATABASE_URL
DATABASE_URL="mysql://root:root@127.0.0.1:3306/lyzer-nextjs"

# Option 2: Use individual variables (already configured in prisma.config.ts)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=lyzer-nextjs
```

### 3. Generate Prisma Client

After making changes to `schema.prisma`, generate the Prisma Client:

```bash
npm run prisma:generate
```

This creates the type-safe Prisma Client in `lib/generated/prisma`.

### 4. Create Initial Migration

**If your database already has tables** (existing project):

```bash
# Option A: Create baseline migration (recommended if schema matches)
npm run prisma:migrate -- --name init --create-only

# Review the generated migration SQL in prisma/migrations, then mark as applied:
npx prisma migrate resolve --applied init
```

**If starting fresh**:

```bash
npm run prisma:migrate -- --name init
```

### 5. Apply Migrations

```bash
npm run prisma:migrate
```

## Schema Overview

The schema includes the following models:

### Finance Models
- `FinanceBank` - Bank information
- `FinanceAccount` - Financial accounts linked to banks
- `FinanceCategory` - Income/Expense categories (with hierarchical support)
- `FinanceTransaction` - Financial transactions (Income, Expense, Transfer)

### School Models
- `SchoolGrade` - Grade levels
- `SchoolRoom` - Classrooms/rooms
- `SchoolSetting` - School configuration
- `SchoolStudent` - Student information
- `SchoolSubject` - Subject/course information
- `SchoolTeacher` - Teacher information

## Important Notes

### Enum Values

The Prisma schema uses enum values without spaces (e.g., `OnLeave`), while your existing MySQL database might have enum values with spaces (e.g., `On Leave`). 

If you're migrating from an existing database:
1. The first migration will create the new enum structure
2. You may need to manually update existing data to match the new enum values
3. Or update the database enum to match Prisma conventions

### Relationships

All foreign key relationships are properly configured:
- `FinanceAccount` → `FinanceBank` (many-to-one)
- `FinanceTransaction` → `FinanceAccount` (many-to-one, with transfer support)
- `FinanceTransaction` → `FinanceCategory` (many-to-one, optional)
- `FinanceCategory` → `FinanceCategory` (self-referential for hierarchy)
- `SchoolStudent` → `SchoolGrade` (many-to-one, optional)
- `SchoolStudent` → `SchoolRoom` (many-to-one, optional)
- `SchoolRoom` → `SchoolGrade` (many-to-one)

## Common Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply new migration
- `npm run prisma:migrate:deploy` - Apply migrations (production)
- `npm run prisma:migrate:reset` - Reset database and apply all migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:db:pull` - Pull schema from existing database
- `npm run prisma:db:push` - Push schema changes to database (dev only)

## Usage Example

```typescript
import { prisma } from '@/lib/prisma'

// Query examples
const accounts = await prisma.financeAccount.findMany({
  where: { isActive: true },
  include: { bank: true }
})

const transactions = await prisma.financeTransaction.findMany({
  where: { 
    transactionDate: { gte: new Date('2026-01-01') }
  },
  include: {
    account: true,
    category: true
  }
})

const students = await prisma.schoolStudent.findMany({
  where: { status: 'Active' },
  include: { 
    gradeRelation: true,
    roomRelation: true 
  }
})

// Create example
const newAccount = await prisma.financeAccount.create({
  data: {
    bankId: 1,
    name: 'New Account',
    accountType: 'Savings',
    currency: 'IDR',
    initialBalance: 0,
    currentBalance: 0
  }
})
```

## Troubleshooting

### Connection Issues
- Verify your `.env` file has the correct database credentials
- Ensure MySQL is running (Laragon)
- Check that the database exists

### Migration Issues
- If you get enum mismatch errors, check the enum values in your database match the schema
- Use `prisma db pull` to introspect your existing database structure
- Review migration files in `prisma/migrations` before applying

### Type Generation Issues
- Run `npm run prisma:generate` after any schema changes
- Clear `node_modules` and reinstall if types are stale
- Check that `lib/generated/prisma` directory exists after generation

