# Agent instructions — Marham Frontend

## Next.js

This is **not** the Next.js you know. This project uses **Next.js 16** with breaking changes — APIs, conventions, and file structure may differ from your training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.** Heed deprecation notices.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| ORM | Drizzle ORM + mysql2 pool |
| UI | shadcn/ui (`components/ui/`) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Forms | react-hook-form + zod (when needed) |

**Do not** introduce other UI libraries (MUI, Chakra, Ant Design, Bootstrap, etc.).

## Project layout

```
app/                    # Routes — keep page.tsx files minimal
components/
  ui/                   # shadcn primitives (add via CLI)
  doctors/              # Doctors feature components
  layout/               # SiteHeader, Footer, etc.
hooks/                  # use-* hooks
lib/
  api/                  # Route helpers (handle-api, http-error, api-response)
  client/               # Client-side HTTP fetch helpers
  db/
    index.ts            # Singleton mysql2 pool + drizzle db
    schema/             # Drizzle table definitions (all 30 tables)
    queries/            # Plain exported query functions
  schemas/              # Zod input validation
  services/             # Server business logic (plain async functions)
```

Path alias: `@/*` → project root.

## Backend APIs (nextjstemp)

APIs live in `app/api/` and use Drizzle in `lib/db/` against the same MySQL DB as MarhamOne.

### Active endpoints

| Method | Path |
|--------|------|
| GET | `/api/doctors/listing` |
| GET | `/api/doctors/profile` |
| GET | `/api/doctors/available-slots` |
| POST | `/api/promo-codes/validate` |
| POST | `/api/web/online-consultation/book` |

### Adding endpoints

1. Zod schema in `lib/schemas/`
2. Query functions in `lib/db/queries/`
3. Plain async function in `lib/services/`
4. Thin Route Handler in `app/api/`
5. Path constant in `lib/constants/marham-api-endpoints.ts`
6. Fetch helper in `lib/client/` (client components only)

### Fetching patterns

- **Server Components:** import `lib/services/*` directly (no HTTP)
- **Client Components:** call `lib/client/*` via `NEXT_PUBLIC_MARHAM_API_URL`
- **Env:** `DB_*` for server-only MySQL; `NEXT_PUBLIC_MARHAM_API_URL` for client API base URL

See `.cursor/rules/api-consumption.mdc` for examples.

## Page routes

Every `app/**/page.tsx` should be a **thin orchestrator**:

1. Resolve params / searchParams
2. Fetch or load data from `lib/services/`
3. Compose feature components from `components/<feature>/`

Move all substantial UI and logic out of page files. See `.cursor/rules/pages.mdc`.

## Styling & colors

- Use **Tailwind** exclusively.
- Colors are defined in `app/globals.css` — use them via Tailwind classes.
- Use `cn()` from `@/lib/utils` for conditional classes.

## Conventions

- Server Components by default; `"use client"` only when needed.
- PascalCase component files; kebab-case for non-component lib/hook files.
- Small, focused components in the correct `components/<feature>/` folder.
- Match existing code style and keep diffs minimal.
