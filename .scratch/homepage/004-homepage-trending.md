---
id: "004"
title: "Homepage — trending anime"
status: ready-for-human
type: HITL
---

## What to build

The homepage showing trending anime pulled from both MAL and AniList, cached in Supabase and refreshed every 6 hours. Each anime card is clickable and navigates to the anime detail page.

## Acceptance criteria

- [ ] `/api/anime/trending` route fetches trending from MAL and AniList in parallel, deduplicates by title, caches result in Supabase with 6h TTL
- [ ] Homepage renders a grid of anime cards (cover image, title, MAL rating, AniList rating, genre tags)
- [ ] Cards link to `/anime/[id]`
- [ ] Stale cache is served while revalidating in the background (stale-while-revalidate pattern)
- [ ] Empty/error state handled gracefully if both APIs fail

## Blocked by

- #003 Anime data layer
