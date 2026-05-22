---
id: "001"
title: "Project setup & infrastructure"
status: done
type: HITL
---

## What to build

Bootstrap the full project foundation end-to-end: Next.js App Router project, Supabase local instance with pgvector enabled, environment variable config, and Vercel project linked. Everything that must exist before any feature slice can start.

## Acceptance criteria

- [x] Next.js App Router project initialised with TypeScript and Tailwind (Next 16, src/ layout, Tailwind v4)
- [x] Supabase local dev environment running via `supabase start` (Orbstack Docker daemon)
- [x] pgvector extension enabled in local Supabase instance (migration `20260521154953_enable_pgvector.sql`)
- [x] `.env.local` configured with Supabase URL/key and OpenAI API key (template committed as `.env.example`)
- [ ] Vercel project created and linked to the repo — **deferred until first deploy**; not required for any local feature work (#002–#007 all run locally)
- [x] `supabase/migrations/` directory in place for future schema migrations

## Blocked by

None — can start immediately

## Completion note

Done apart from Vercel linking, which was consciously deferred until we're ready to deploy (it blocks nothing locally). Vitest was also added as the test runner during this slice.
