---
id: "007"
title: "Book recommendations"
status: ready-for-human
type: HITL
---

## What to build

The recommendation engine and UI: given an anime, embed its synopsis + genres, run a pgvector cosine similarity query against the book catalog, and display the results as a scored list below the anime detail. Results are cached per anime so the embedding call only happens once.

## Acceptance criteria

- [ ] Supabase `recommendation_cache` table stores cached results keyed by `anime_id`
- [ ] `/api/recommendations/[animeId]` embeds the anime's synopsis + genres using OpenAI `text-embedding-3-small`, queries pgvector for top 10 books above 50% cosine similarity, caches the result
- [ ] If fewer than 3 books clear the 50% threshold, the response includes up to 3 loose fallbacks (next closest matches below threshold)
- [ ] Book card shows: cover image, title, author, genre tags, 2–3 sentence synopsis, Goodreads search link, color-coded match % badge (green ≥75%, yellow 60–74%, orange 50–59%)
- [ ] Friendly empty state shown if no books meet the threshold and no fallbacks are available
- [ ] Recommendation list replaces the placeholder added in #006

## Blocked by

- #002 Book catalog seeding script
- #006 Anime detail page
