# Agent instructions — Marham Frontend

## Next.js

This is **not** the Next.js you know. This project uses **Next.js 16** with breaking changes — APIs, conventions, and file structure may differ from your training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.** Heed deprecation notices.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
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
  logo/                 # Brand assets
hooks/                  # use-* hooks
lib/                    # Data, utils, config, API clients (consume MarhamOne)
```

Path alias: `@/*` → project root.

## Backend API consumption (mandatory)

This frontend **never hosts HTTP APIs**. All endpoints live in `MarhamOne/` (NestJS).

### Never create

- `app/api/**/route.ts` (Route Handlers)
- Next.js API proxies or BFF layers
- Server Actions used as API endpoints
- TanStack `createServerFn` wrappers acting as backend logic

### Always do

1. Add the endpoint in `MarhamOne/src/modules/` and update `MarhamOne/API_DOCUMENTATION.md`
2. Add a typed fetch helper in `lib/` (e.g. `lib/marham-api.ts`, `lib/types/`)
3. Call the helper from pages or components — never implement endpoints in Next.js

### Fetching patterns

- **Server Components:** call `lib/` fetchers with `next: { revalidate }` where appropriate
- **Client Components:** call the same `lib/` fetchers using `NEXT_PUBLIC_MARHAM_API_URL` (browser → NestJS via CORS)
- **Env:** `NEXT_PUBLIC_MARHAM_API_URL` for the NestJS base URL — never put secrets in `NEXT_PUBLIC_*`

See `.cursor/rules/api-consumption.mdc` for examples.

### API and legacy URL organization

- **API paths:** `lib/constants/marham-api-endpoints.ts`
- **Fetch services:** `lib/services/` (e.g. `doctors-listing-service.ts`)
- **Legacy Marham.pk URLs:** `NEXT_PUBLIC_MARHAM_HOME_URL` + `lib/doctors-urls.ts` + `lib/constants/marham-legacy-urls.ts`
- **Speciality slug → ID:** `lib/constants/speciality-slugs.ts`

Experimental pages (e.g. doctors listing) redirect booking/profile actions to the legacy Marham.pk site. Do not build booking or profile pages in Next.js until the migration is ready.

## Page routes

Every `app/**/page.tsx` should be a **thin orchestrator**:

1. Resolve params / searchParams
2. Fetch or load data from `lib/`
3. Compose feature components from `components/<feature>/`

Move all substantial UI and logic out of page files. See `.cursor/rules/pages.mdc`.

## Styling & colors

- Use **Tailwind** exclusively.
- Colors are defined in `app/globals.css` — use them via Tailwind classes:
  - **Semantic**: `primary`, `secondary`, `muted`, `accent`, `background`, `foreground`, `border`, `destructive`
  - **Brand**: `maingreen`, `darknavy`, `brandblue`, `brandteal`, `mainblue`, `deepblue`, `skyblue`, `washblue`, `pagegray`, `maingray`, `mainred`, etc.
- Do not add new color hex values inline; extend `globals.css` if a token is missing.
- Use `cn()` from `@/lib/utils` for conditional classes.

## shadcn workflow

- Add components: `npx shadcn@latest add <name>`
- Config: `components.json`
- Customize in `components/ui/` sparingly; prefer wrapping in feature components.

## Conventions

- Server Components by default; `"use client"` only when needed.
- PascalCase component files; kebab-case for non-component lib/hook files.
- Small, focused components in the correct `components/<feature>/` folder.
- Match existing code style and keep diffs minimal.
