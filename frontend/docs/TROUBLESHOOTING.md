# Troubleshooting Authentication Errors

## Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

This error means the API route is returning HTML (an error page) instead of JSON. This usually happens when:

### 1. Prisma Client Not Generated

**Solution:** Generate the Prisma client with the updated schema:

```bash
npx prisma generate --schema=./prisma/schema.prisma
```

Or if you're in the project root:

```bash
npx prisma generate
```

### 2. Database Connection Issues

**Check:** Make sure your `.env` file has the correct database connection string:

```env
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
```

**Solution:** Verify the database is running and accessible.

### 3. Missing Database Tables

**Solution:** Run the migration to create the tables:

```bash
npx prisma migrate dev --name add_password_field
```

Or push the schema directly:

```bash
npx prisma db push
```

### 4. Check Server Logs

Look at your Next.js development server console for detailed error messages. The error should show:
- What import is failing
- What database error occurred
- Any Prisma-related issues

### Quick Fix Steps

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Run Migration:**
   ```bash
   npx prisma migrate dev --name add_password_field
   ```

3. **Restart Dev Server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

4. **Test Again:**
   - Go to `/authentication/sign-up`
   - Try creating an account
   - Check browser console for errors
   - Check server console for errors

### Common Error Messages

- **"Cannot find module '@/lib/generated/prisma'"** → Run `npx prisma generate`
- **"P1001: Can't reach database server"** → Check DATABASE_URL and database connection
- **"Table 'auth_users' doesn't exist"** → Run `npx prisma migrate dev`
- **"P2002: Unique constraint failed"** → Email already exists (this is expected if trying to sign up with existing email)

### Still Having Issues?

1. Check the browser's Network tab to see the actual API response
2. Check the server console for detailed error logs
3. Verify all dependencies are installed: `npm install`
4. Make sure you're using the correct Node.js version

