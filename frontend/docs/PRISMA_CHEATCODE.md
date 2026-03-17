# Prisma CLI Command Reference (2026)

## 1. Setup & Maintenance
npx prisma init                 # Initialize a new Prisma project
npx prisma format               # Format the schema.prisma file
npx prisma validate             # Check schema for errors/constraints
npx prisma version              # Check CLI and Engine versions
npx prisma help                 # Show all commands

## 2. Development Workflow (Migrate)
npx prisma migrate dev          # Create and apply migrations (Dev environment)
npx prisma migrate reset        # Wipe database and re-run all migrations
npx prisma migrate deploy       # Apply migrations (Production/Staging)
npx prisma migrate status       # Check if DB is in sync with migrations
npx prisma migrate diff         # Compare two schema/database states

## 3. Database Introspection & Syncing
npx prisma db pull              # Update schema.prisma from existing database
npx prisma db push              # Sync schema to database (No migration files)
npx prisma db seed              # Run the seed script from package.json
npx prisma db execute           # Run a specific SQL command against the DB

## 4. Code Generation & Visualization
npx prisma generate             # Generate Prisma Client (TypeScript/JS)
npx prisma studio               # Open Browser GUI to view/edit data

## 5. Debugging & Prototyping
# Example: migrate dev with a specific name
npx prisma migrate dev --name init_database

# Example: Generate client with custom schema path
npx prisma generate --schema=./custom/path/schema.prisma