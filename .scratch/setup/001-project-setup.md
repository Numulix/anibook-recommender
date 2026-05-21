---
id: "001"
title: "Project setup & infrastructure"
status: ready-for-human
type: HITL
---

## What to build

Bootstrap the full project foundation end-to-end: Next.js App Router project, Supabase local instance with pgvector enabled, environment variable config, and Vercel project linked. Everything that must exist before any feature slice can start.

## Acceptance criteria

- [ ] Next.js App Router project initialised with TypeScript and Tailwind
- [ ] Supabase local dev environment running via `supabase start`
- [ ] pgvector extension enabled in local Supabase instance
- [ ] `.env.local` configured with Supabase URL/key and OpenAI API key (template committed as `.env.example`)
- [ ] Vercel project created and linked to the repo
- [ ] `supabase/migrations/` directory in place for future schema migrations

## Blocked by

None — can start immediately
