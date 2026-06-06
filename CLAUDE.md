# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Non-Negotiable Rules
- DO NOT install anything on my own. Provide instructions to user.
- All code sync from local to Git will ALWAYS be done by the user.
- Afer any new install instructions, prompt the user to check for Vercel version compatibility.


## Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui — always use theme tokens (`bg-primary`, `text-primary-foreground`, `bg-popover`, etc.) instead of hardcoded colors (`gray-900`, `white`, etc.)
- **Database**: Vercel Postgres (Neon) via Prisma
- **Auth**: NextAuth.js v5
- **Validation**: Zod

## Commands

```bash
npm run dev          # start local dev server (localhost:3000)
npm run build        # production build
npm run lint         # ESLint
npx tsc --noEmit     # type check
npx prisma studio    # visual DB browser
npx prisma db push   # push schema changes to DB
npx prisma generate  # regenerate Prisma client after schema changes
```

## Architecture

Data flow: `app/` routes → `lib/services/` → `lib/db.ts` → Prisma → DB

### Folder Structure

```
app/
  (admin)/              # Admin module — route group, not in URL
    dashboard/page.tsx
    users/page.tsx
    settings/page.tsx
  (inventory)/          # Inventory module — route group, not in URL
    list/page.tsx
    add/page.tsx
    [id]/page.tsx
  api/
    admin/route.ts
    inventory/route.ts
  layout.tsx

components/
  ui/                   # shadcn/ui primitives — do not edit
  custom/               # App-specific hand-written components

lib/
  db.ts                 # Prisma client singleton
  services/
    admin/              # Admin module services (one file per entity)
      prod-category.ts
    inventory/          # Inventory module services (one file per entity)
  validations/
    admin/              # Admin module validations (one file per entity)
    inventory/          # Inventory module validations (one file per entity)
  lookup-master/        # Static reference data (no DB calls)

middleware.ts            # Auth guards and redirects
types/index.ts           # Shared TypeScript interfaces
prisma/schema.prisma
```

### Module Rules

- Each module has its own folder in `app/`, `components/`, `lib/services/`, and `lib/validations/`
- No cross-module imports between services — if logic is shared, extract to `lib/shared/`
- `app/api/` route handlers must stay thin — delegate all logic to `lib/services/`
- Components never import from `lib/db.ts` directly
- Add `components/ui/` components flat — only create subfolders when a module has 4+ components

## Development order
Always build in this sequence — never skip ahead:
Spec → Prisma schema + migrate → server/queries + server/actions (auth + Zod) → middleware.ts (route guards) → app/ + components/ (UI last)
Each layer must be complete and working before the next begins.

## Environment Variables

- `.env.local` for local development — never commit
- Production vars must be set in the **Vercel dashboard**
- Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

## Current Version Registry

| Package | Version | Vercel Compatible |
|---|---|---|
| `next` | 15.5.15 | ✅ |
| `react` / `react-dom` | 19.2.5 | ✅ |
| `next-auth` | 5.0.0-beta.31 | ✅ |
| `prisma` | 7.8.0 | ✅ |
| `@prisma/client` | 7.8.0 | ✅ |
| `zod` | 4.3.6 | ✅ |
| `typescript` | 5.9.3 | ✅ |
| `tailwindcss` | 4.x | ✅ |
| Node.js | 24.13.0 | ✅ |

## Deployment

- Pushing to `main` triggers auto-deploy on Vercel
- Every PR gets an automatic Vercel preview URL
- Run `npm run build` locally before pushing to catch build errors early