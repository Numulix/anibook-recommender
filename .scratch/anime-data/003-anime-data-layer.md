---
id: "003"
title: "Anime data layer"
status: ready-for-human
type: HITL
---

## What to build

The Supabase caching layer for anime data and the `/api/anime/[id]` route that fetches from both MAL and AniList, merges the results into a unified shape, and caches them. This is the shared data foundation for both the detail page and the recommendations feature.

## Acceptance criteria

- [x] Supabase `anime_cache` table created with columns: `id`, `mal_id`, `anilist_id`, `title`, `synopsis`, `genres`, `cover_url`, `mal_rating`, `anilist_rating`, `studios`, `year`, `episode_count`, `status`, `cached_at`
- [x] `/api/anime/[id]` fetches from MAL REST API and AniList GraphQL, merges into unified response shape (AniList anchors, MAL enriches the rating — sequential, not parallel; see notes)
- [x] Cache TTL of 24–48 hours enforced (`CACHE_TTL_HOURS = 24`, re-fetch if `cached_at` is stale)
- [x] MAL and AniList IDs are both stored; AniList id is the canonical lookup key
- [x] API route returns a consistent response shape regardless of which source has missing fields

## Implementation notes (for review)

Built `src/lib/anime/` — pure tested core + thin I/O shells + orchestrator, mirroring `src/lib/seed/`:
- `types.ts` — `UnifiedAnime`, `AniListSource`, `MalSource`.
- `merge.ts` + `merge.test.ts` — pure `mergeAnime(anilist, mal|null)` and `isStale()` (10 tests). `CACHE_TTL_HOURS = 24`.
- `anilist.ts` — GraphQL fetch by AniList id (anchor); strips HTML from the description.
- `mal.ts` — REST fetch by MAL id for the `mean` rating (`X-MAL-CLIENT-ID`).
- `cacheRepo.ts` — Supabase read/upsert + row↔`UnifiedAnime` mapping.
- `service.ts` — `getAnime(anilistId)`: fresh-cache → AniList+MAL → merge → upsert; serves stale on AniList failure, degrades to a null MAL rating.
- Route: `src/app/api/anime/[id]/route.ts` (`[id]` = AniList id).
- Migration: `20260522123318_create_anime_cache_table.sql`.

**Decisions (confirmed with user):**
- `[id]` is the **AniList id** — AniList is the anchor (search is AniList-based; its `idMal` gives us the MAL id for the rating fetch). MAL fetch is sequential-after-AniList, not parallel; fine because caching makes it once-per-anime.
- `episode_count` + `status` are **stored but not displayed** (satisfies AC; PRD out-of-scope concerns UI/features).

Verified: 23 tests pass, tsc + lint clean; live fetch of Frieren (154587) returns MAL 9.27 / AniList 91, warm cache hit ~9ms.

## Blocked by

- #001 Project setup & infrastructure
