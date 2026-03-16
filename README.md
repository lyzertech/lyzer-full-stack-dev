# Lyzer — Modular Monolith

**Stack:** Laravel 12 (API) + Next.js 15 (Admin Template) | Single repo, subdomain-based modules

---

## Architecture

```
lyzer-full-stack-dev/
├── backend/          # Laravel 12 API
│   └── app/Modules/
│       ├── Finance/  → finance.lyzer.test
│       ├── Labs/     → labs.lyzer.test
│       └── School/   → school.lyzer.test
└── frontend/         # Next.js Admin Template
    ├── middleware.ts         # Subdomain detection
    ├── lib/api.ts            # Centralized API service
    └── app/(components)/(content-layout)/
        ├── finance/dashboard/
        ├── finance/transactions/
        ├── labs/dashboard/
        ├── labs/qc-report/
        ├── school/dashboard/
        └── school/students/
```

---

## Local Development Setup (Laragon)

### 1. Hosts File
Add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 lyzer.test
127.0.0.1 finance.lyzer.test
127.0.0.1 labs.lyzer.test
127.0.0.1 school.lyzer.test
```

### 2. Laragon Virtual Host
In Laragon → Menu → Apache → sites-enabled, add OR use Auto Virtual Hosts.
Point `lyzer.test` → `F:\+ Maman\lyzer-full-stack-dev\backend\public`

### 3. Database
Create a MySQL database named `lyzer` in Laragon's phpMyAdmin (or HeidiSQL).

### 4. Backend Setup
```bash
cd backend

# Copy and configure env (already pre-configured)
# Update DB_PASSWORD in .env if needed

php artisan migrate
php artisan db:seed
```

Seed creates these test users (password: `password`):
| Email | Role |
|---|---|
| superadmin@lyzer.test | superadmin |
| finance@lyzer.test | finance |
| labs@lyzer.test | labs |
| school@lyzer.test | school |

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev   # Starts at http://localhost:3000
```

---

## API Reference

### Auth (no subdomain required)
```
POST http://lyzer.test/api/auth/login
POST http://lyzer.test/api/auth/logout   [auth:sanctum]
GET  http://lyzer.test/api/auth/me       [auth:sanctum]
```

### Finance Module (`finance.lyzer.test`)
```
GET  /api/finance/dashboard
GET  /api/finance/transactions
POST /api/finance/transactions
GET  /api/finance/transactions/{id}
PUT  /api/finance/transactions/{id}
DELETE /api/finance/transactions/{id}
```

### Labs Module (`labs.lyzer.test`)
```
GET  /api/labs/dashboard
GET  /api/labs/qc-reports
POST /api/labs/qc-reports
GET  /api/labs/qc-reports/{id}
PUT  /api/labs/qc-reports/{id}
DELETE /api/labs/qc-reports/{id}
```

### School Module (`school.lyzer.test`)
```
GET  /api/school/dashboard
GET  /api/school/students
POST /api/school/students
GET  /api/school/students/{id}
PUT  /api/school/students/{id}
DELETE /api/school/students/{id}
```

---

## How Subdomain Detection Works

### Backend (Laravel)
`ModuleServiceProvider` registers routes per module under a subdomain group:
```php
Route::domain('finance.lyzer.test')
    ->middleware(['api', 'auth:sanctum', 'role:finance'])
    ->prefix('api/finance')
    ->group(app_path('Modules/Finance/routes.php'));
```
`CheckRole` middleware reads `$user->role` and compares with the required role.

### Frontend (Next.js)
`middleware.ts` reads the `host` header on every request:
```
Request: GET / from finance.lyzer.test:3000
→ Extracts subdomain: "finance"
→ Rewrites path: / → /finance/
→ Serves: app/(components)/(content-layout)/finance/dashboard/page.tsx
```

`lib/api.ts` reads `window.location.hostname` at runtime:
```
finance.lyzer.test → calls http://lyzer.test/api/finance/...
labs.lyzer.test    → calls http://lyzer.test/api/labs/...
school.lyzer.test  → calls http://lyzer.test/api/school/...
```

---

## Adding a New Module

1. Create `app/Modules/YourModule/` with: Controllers, Models, Requests, Services, routes.php
2. Register it in `app/Providers/ModuleServiceProvider.php` `$modules` array
3. Create migrations with the prefix `yourmodule_*`
4. Create frontend pages at `app/(components)/(content-layout)/yourmodule/`
5. Add to `middleware.ts` MODULES array
6. Add hosts entry and Laragon vhost for `yourmodule.lyzer.test`
