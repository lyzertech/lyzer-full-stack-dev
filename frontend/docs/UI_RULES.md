# UI Rules & Templates — School Pages

This document defines the **UI rules and template** to ensure all `app/(components)/(content-layout)/school/*` pages follow a consistent structure and theme.

## Purpose

- Provide a clear, human-readable guide for building or updating school pages (Grades, Students, Teachers, Settings, etc.)
- Make it easy for contributors to match the project's style and layout

## Core rules

1. Layout & Placement

   - All pages under `/school` must be wrapped by `app/school/layout.tsx` so Header, Sidebar, Footer and Switcher are present.
   - Use the `(content-layout)` layout inside `app/(components)/(content-layout)/layout.tsx` for shared header/sidebar.

2. File structure & naming

   - Page components follow the pattern: `app/(components)/(content-layout)/school/<feature>/<page>.tsx` where `<page>.tsx` is a client component (starts with `'use client'` if it uses hooks).
   - Expose the canonical page as the default export; top-level route files should import the component from the components layout folder.

3. Page shell

   - Include `Seo` and `Pageheader` at the top:
     ```tsx
     <Seo title="<Title>" />
     <Pageheader title="School" subtitle="<Subtitle>" currentpage="<Current>" activepage="<Active>" />
     ```

4. Card + header + actions

   - Wrap content in:
     ```tsx
     <Card className="custom-card">
       <Card.Header className="justify-content-between d-flex align-items-center">
         ...
       </Card.Header>
       <Card.Body className="custom-data-table">...</Card.Body>
     </Card>
     ```
   - Header actions should use small buttons (`size="sm"`) with icons and `btn-wave` for primary actions.
   - Use `Edit` / `Cancel` / `Save` pattern for editable pages (when applicable).

5. Forms and edit mode

   - Use `Form ref={formRef}` with `formRef.current?.requestSubmit()` to support header Save button.
   - Inputs should be disabled when not in edit mode and enabled when editing.
   - Cancel should reload server values (re-fetch) to revert changes.

6. Button styles

   - Use `variant="primary"` and `className="btn-wave"` for primary save actions.
   - Use `outline-secondary` / `secondary` for toggle or small actions.

7. API usage
   - Use fetch to `/api/school/<resource>` endpoints. Keep methods RESTful (GET/PUT/POST/DELETE).

## Examples

- Follow `app/(components)/(content-layout)/school/student/list/page.tsx` and `app/(components)/(content-layout)/school/grade/page.tsx` for concrete examples.

---

If you want more rules (access control, automated linting, or an ESLint plugin for rules), I can add a machine-readable rules file and CI checks.
