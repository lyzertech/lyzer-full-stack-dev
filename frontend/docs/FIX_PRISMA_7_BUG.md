# Fix Prisma 7.3.0 Engine Type Bug

## The Problem

Prisma 7.3.0 has a bug where it incorrectly detects the environment and generates the client with engine type "client" (for edge runtimes) instead of "library" (for Node.js). This causes the error:

```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"
```

## The Solution: Downgrade to Prisma 6.x

Prisma 6.x is stable and works correctly with standard Node.js/Next.js setups.

### Step 1: Stop Your Dev Server
Press `Ctrl+C` to stop the Next.js dev server.

### Step 2: Uninstall Prisma 7.x
```bash
npm uninstall prisma @prisma/client
```

### Step 3: Install Prisma 6.x
```bash
npm install prisma@^6.0.0 --save-dev
npm install @prisma/client@^6.0.0
```

### Step 4: Delete Generated Client
```powershell
# Windows PowerShell:
Remove-Item -Recurse -Force lib\generated\prisma

# Or manually delete: lib/generated/prisma
```

### Step 5: Clear Next.js Cache
```powershell
# Windows PowerShell:
Remove-Item -Recurse -Force .next

# Or manually delete: .next
```

### Step 6: Regenerate Prisma Client
```bash
npx prisma generate --schema=prisma/schema.prisma
```

### Step 7: Restart Dev Server
```bash
npm run dev
```

## Why This Works

- Prisma 6.x uses the library engine by default for Node.js
- No adapter or accelerateUrl required
- Stable and well-tested
- Works perfectly with Next.js API routes

## Verification

After downgrading, you should:
- ✅ No more `PrismaClientConstructorValidationError`
- ✅ `/api/auth/me` returns JSON (not HTML)
- ✅ Sign-up and sign-in work correctly
- ✅ All API routes work properly

## Alternative: Wait for Prisma 7.x Fix

If you prefer to stay on Prisma 7.x, you can:
1. Monitor Prisma GitHub issues for a fix
2. Use Prisma Accelerate (requires paid subscription)
3. Use a Prisma adapter for edge runtimes

But for standard Next.js API routes, Prisma 6.x is the recommended solution.

