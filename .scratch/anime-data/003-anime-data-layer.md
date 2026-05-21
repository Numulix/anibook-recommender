---
id: "003"
title: "Anime data layer"
status: ready-for-human
type: HITL
---

## What to build

The Supabase caching layer for anime data and the `/api/anime/[id]` route that fetches from both MAL and AniList, merges the results into a unified shape, and caches them. This is the shared data foundation for both the detail page and the recommendations feature.

## Acceptance criteria

- [ ] Supabase `anime_cache` table created with columns: `id`, `mal_id`, `anilist_id`, `title`, `synopsis`, `genres`, `cover_url`, `mal_rating`, `anilist_rating`, `studios`, `year`, `episode_count`, `status`, `cached_at`
- [ ] `/api/anime/[id]` fetches from MAL REST API and AniList GraphQL in parallel, merges into unified response shape
- [ ] Cache TTL of 24–48 hours enforced (re-fetch if `cached_at` is stale)
- [ ] MAL and AniList IDs are both stored to support either as the lookup key
- [ ] API route returns a consistent response shape regardless of which source has missing fields

## Blocked by

- #001 Project setup & infrastructure
