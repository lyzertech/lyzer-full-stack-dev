# Prisma Quick Start Guide

## Setup Steps

### 1. Configure Database Connection

Ensure your `.env` file has the database connection string:

```env
DATABASE_URL="mysql://username:password@host:port/database"
```

Or use individual variables (already configured):
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=lyzer-nextjs
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

This creates the type-safe Prisma Client in `lib/generated/prisma`.

### 3. Create Initial Migration

**If your database already has tables** (existing project):
```bash
# Pull schema from existing database
npm run prisma:db:pull

# Review and adjust schema.prisma if needed, then create baseline migration
npm run prisma:migrate -- --name init
```

**If starting fresh**:
```bash
npm run prisma:migrate -- --name init
```

### 4. Use Prisma Client in Your Code

```typescript
import { prisma } from '@/lib/prisma'

// Example queries
const students = await prisma.schoolStudent.findMany({
  where: { status: 'Active' },
  include: { gradeRelation: true, roomRelation: true }
})

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

## Common Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply new migration
- `npm run prisma:migrate:deploy` - Apply migrations (production)
- `npm run prisma:studio` - Open database GUI
- `npm run prisma:db:pull` - Pull schema from database

## Next Steps

See [PRISMA_MIGRATIONS.md](./PRISMA_MIGRATIONS.md) for detailed migration workflow.
