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
lib/                    # Data, utils, config, API
```

Path alias: `@/*` → project root.

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
