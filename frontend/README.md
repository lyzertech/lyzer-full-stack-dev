This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## New: School General Settings

Added a simple general settings feature to manage school information.

- DB: `db/create_school_settings_table.sql` — schema for `school_settings` table.
- Note: other core tables were updated to use the `school_` prefix for consistency: `school_grades`, `school_rooms`, `school_students`, `school_subjects`, `school_teachers` (see corresponding `db/` files).
- API: `app/api/school/settings/route.ts` — GET returns settings (first row), PUT creates or updates settings.
- Page: `/school/setting/general` implemented at `app/school/setting/general/page.tsx` — UI form to view and update settings.

Usage examples:

- Fetch settings:
  GET /api/school/settings

- Update settings (PUT JSON):
  PUT /api/school/settings
  Content-Type: application/json
  Body: { "school_name": "My School", "phone": "+12345" }

Notes:

- The table is intended as a singleton; the API operates on the first row (create if none exists).
- The API includes basic validation and sanitization; extend as needed for your business rules.
