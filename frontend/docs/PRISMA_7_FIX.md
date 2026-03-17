# Fix for Prisma 7 Engine Type Error

## Error
```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

## Solution

This error occurs because Prisma 7.x has changed how the client works. The Prisma client needs to be regenerated with the updated schema.

### Step 1: Regenerate Prisma Client

Run this command in your project root:

```bash
npx prisma generate --schema=prisma/schema.prisma
```

Or use the npm script:

```bash
npm run prisma:generate
```

### Step 2: Run Database Migration

After regenerating, apply the schema changes to your database:

```bash
npx prisma migrate dev --name add_password_field
```

Or push the schema directly:

```bash
npx prisma db push
```

### Step 3: Restart Dev Server

After regenerating and migrating:

1. Stop your Next.js dev server (Ctrl+C)
2. Restart it: `npm run dev`

## Why This Happens

Prisma 7.x changed the default engine configuration. When the schema is updated (like adding the `password` field), the Prisma client must be regenerated to match the new schema. The error occurs because:

1. The old generated client doesn't match the new schema
2. Prisma 7 requires explicit engine configuration
3. The client needs to be regenerated to use the correct engine type

## Alternative: If Regeneration Doesn't Work

If you continue to see this error after regeneration, you may need to:

1. **Clear the generated client:**
   ```bash
   rm -rf lib/generated/prisma
   # Or on Windows:
   rmdir /s /q lib\generated\prisma
   ```

2. **Regenerate:**
   ```bash
   npx prisma generate --schema=prisma/schema.prisma
   ```

3. **Verify the DATABASE_URL is set** in your `.env` file

## Verification

After fixing, you should be able to:
- Sign up new users at `/authentication/sign-up`
- Sign in at `/authentication/sign-in`
- No more PrismaClientConstructorValidationError

