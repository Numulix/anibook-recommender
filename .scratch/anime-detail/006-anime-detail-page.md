---
id: "006"
title: "Anime detail page"
status: ready-for-human
type: HITL
---

## What to build

The `/anime/[id]` page showing full anime information fetched from the cached anime data layer. This is the page users land on after clicking a trending card or search result, and it hosts the book recommendations list below the anime info.

## Acceptance criteria

- [x] Page fetches anime data from `/api/anime/[id]` (served from Supabase cache)
- [x] Hero section shows: cover image, title, MAL rating + AniList rating displayed side by side, genre tags
- [x] Studios, year shown below the hero
- [x] Synopsis displayed with a "Show more / Show less" toggle if it exceeds ~4 lines
- [x] Page handles loading and error states gracefully
- [x] Book recommendations section placeholder rendered below synopsis (wired up in #007)

## Blocked by

- #003 Anime data layer

## Comments

**Implemented test-first** (awaiting human visual verification — HITL):

- `src/lib/anime/detail.ts` + `detail.test.ts` — pure presentation helpers, TDD'd one behavior at a time (13 tests): `formatMalRating` (/10, one decimal, null → "—"), `formatAnilistRating` (/100 → "N%", null → "—"), `formatStudiosYear` (comma-joined studios · year, empties dropped), `shouldClampSynopsis` (clamp past ~300 chars ≈ 4 lines).
- `src/components/Synopsis.tsx` — client component; clamps to `line-clamp-4` with a Show more/less toggle **only when** `shouldClampSynopsis` is true (short synopses show no toggle).
- `src/app/anime/[id]/page.tsx` — **server component** calling `getAnime(id)` directly (per decision; same cached data layer as `/api/anime/[id]`). `notFound()` on a malformed id or unknown anime. Two-column layout from the chosen prototype: sticky left (cover w/ gradient fallback, title, studios·year, MAL+AniList rating chips, genre tags, synopsis) and a right "Books like this" placeholder for #007.
- `loading.tsx` (skeleton, streamed during the async render), `error.tsx` (retry boundary), `not-found.tsx` (friendly 404 + link home).

**Design decisions** (confirmed with user): server component over client fetch; pure char-length heuristic for the synopsis toggle.

Verified live: `/anime/20` (Naruto) → 200 with title, both rating chips, genre tags, Show more toggle, recs placeholder; malformed/unknown id → not-found UI. Full suite 49/49, `tsc` and lint clean.
