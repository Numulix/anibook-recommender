---
id: "006"
title: "Anime detail page"
status: ready-for-human
type: HITL
---

## What to build

The `/anime/[id]` page showing full anime information fetched from the cached anime data layer. This is the page users land on after clicking a trending card or search result, and it hosts the book recommendations list below the anime info.

## Acceptance criteria

- [ ] Page fetches anime data from `/api/anime/[id]` (served from Supabase cache)
- [ ] Hero section shows: cover image, title, MAL rating + AniList rating displayed side by side, genre tags
- [ ] Studios, year shown below the hero
- [ ] Synopsis displayed with a "Show more / Show less" toggle if it exceeds ~4 lines
- [ ] Page handles loading and error states gracefully
- [ ] Book recommendations section placeholder rendered below synopsis (wired up in #007)

## Blocked by

- #003 Anime data layer
