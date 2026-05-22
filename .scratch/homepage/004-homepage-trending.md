---
id: "004"
title: "Homepage — trending anime"
status: done
type: HITL
---

## What to build

The homepage showing trending anime pulled from both MAL and AniList, cached in Supabase and refreshed every 6 hours. Each anime card is clickable and navigates to the anime detail page.

## Acceptance criteria

- [x] `/api/anime/trending` route fetches trending from MAL and AniList in parallel (`Promise.allSettled`), caches in Supabase with 6h TTL. **Dedup:** by AniList id within each row, not cross-source by title — the chosen UI is source-split (see below), so the same anime legitimately appears in both rows.
- [x] Homepage renders anime cards (cover image, title, genre tag, year) — see deviation note on ratings
- [x] Cards link to `/anime/[id]` (AniList id; MAL-row cards resolve their AniList id via a batched lookup)
- [x] Stale cache is served while revalidating in the background (SWR via Next `after()`)
- [x] Empty/error state handled gracefully if both APIs fail

## Implementation notes (for review)

- **Layout:** source-split horizontal carousels ("Popular on MyAnimeList" / "Popular on AniList"), per the prototype verdict — not the single merged grid the original AC implied.
- **Card content (deviation, user-confirmed):** minimal cards show cover + title + `genre · year` and **no rating badges**. The AC text said show MAL + AniList ratings; the user chose the minimal prototype card instead. Ratings still appear on the detail page (#006).
- **MAL → AniList linking:** every card links to our AniList-keyed `/anime/[id]`. MAL ranking items only carry a MAL id, so `malTrending.ts` resolves them to AniList ids in a single batched aliased GraphQL query; unresolved items are dropped. Verified live: all 20 MAL cards resolved.
- **Files:** `src/lib/anime/trending.ts` (+ `.test.ts`, 9 tests — pure normalize/link/dedupe), `anilistTrending.ts`, `malTrending.ts`, `trendingRepo.ts`, `trendingService.ts` (SWR, `TRENDING_TTL_HOURS = 6`); route `src/app/api/anime/trending/route.ts`; UI `src/app/page.tsx` + `src/components/{AnimeCard,icons}.tsx`; migration `20260522145144_create_trending_cache_table.sql`. App theme set dark in `globals.css` to match the prototype.
- **Covers** use plain `<img>` (no next/image remote-host allowlist) — optimization deferred.
- **Brand icons** are still the approximated MAL/AniList placeholders — swap for official assets before launch.
- The homepage Server Component calls `trendingService` directly (no self-fetch to the API route); the route exists per AC and for any client/external consumer.

Verified: 32 tests pass, tsc + lint clean, `next build` clean; live refresh returns 20 + 20 cards, fresh cache hit ~16ms.

## Follow-ups (not blockers)
- `/anime/[id]` detail page doesn't exist yet (#006) — card links 404 until then.
- Delete `src/app/prototype/` once #006 and #007 have folded in their designs.

## Blocked by

- #003 Anime data layer
