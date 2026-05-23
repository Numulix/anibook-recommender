---
id: "007"
title: "Book recommendations"
status: ready-for-human
type: HITL
---

## What to build

The recommendation engine and UI: given an anime, embed its synopsis + genres, run a pgvector cosine similarity query against the book catalog, and display the results as a scored list below the anime detail. Results are cached per anime so the embedding call only happens once.

## Acceptance criteria

- [x] Supabase `recommendation_cache` table stores cached results keyed by `anime_id`
- [x] `/api/recommendations/[animeId]` embeds the anime's synopsis + genres using OpenAI `text-embedding-3-small`, queries pgvector for top 10 books above 50% cosine similarity, caches the result
- [x] If fewer than 3 books clear the 50% threshold, the response includes up to 3 loose fallbacks (next closest matches below threshold)
- [x] Book card shows: cover image, title, author, genre tags, 2–3 sentence synopsis, Goodreads search link, color-coded match % badge (green ≥75%, yellow 60–74%, orange 50–59%)
- [x] Friendly empty state shown if no books meet the threshold and no fallbacks are available
- [x] Recommendation list replaces the placeholder added in #006

## Blocked by

- #002 Book catalog seeding script
- #006 Anime detail page

## Comments

**Implemented test-first** (awaiting human visual verification — HITL):

- `src/lib/recommendations/recommend.ts` + `recommend.test.ts` — pure engine, TDD'd one behavior at a time (12 tests): `selectRecommendations` (top-10 ≥50%; tops up with next-closest below-threshold to reach 3; empty/short-list edges), `matchTier` (green ≥75 / yellow 60–74 / orange below, keyed off the displayed percent), `toMatchPercent`, `buildAnimeEmbeddingInput` (genres + synopsis), `goodreadsSearchUrl`.
- `supabase/migrations/20260522213018_*.sql` — `recommendation_cache` table (keyed by `anime_id`, no TTL — catalog is static in v1) + `match_books(query_embedding, match_count)` RPC returning `1 - cosine_distance` over the HNSW index.
- `src/lib/recommendations/booksRepo.ts` (`matchBooks` RPC call, fetches 30 candidates), `recommendationsRepo.ts` (cache get/save), `service.ts` (`getRecommendations`: cache → `getAnime` → embed via `seed/embed` → `matchBooks` → `selectRecommendations` → cache; returns `null` for unknown anime, only caches non-empty so an unseeded catalog can't poison the cache).
- `src/app/api/recommendations/[animeId]/route.ts` — 400 on bad id, 404 unknown anime, 502 on failure.
- `src/components/BookRecommendations.tsx` — client component (fetched via `key={anilistId}`): loading skeleton → modal book list (cover/title/author/genres/clamped synopsis/badge; modal adds full synopsis + Goodreads link) or friendly empty state; flags loose-only (sub-threshold) fallbacks with a note. Replaces the #006 placeholder.

Verified: full suite **61/61**, `tsc` + lint clean. Live route checks — invalid id → 400; valid id → graceful **502** because the migration isn't applied yet (log: `recommendation_cache` table not found), confirming wiring + error handling.

**⚠ Before this works end-to-end (operational, against the live DB — not run by the agent):**
1. Apply the migration: `supabase db push` (creates `recommendation_cache` + `match_books`).
2. Ensure the book catalog is seeded with embeddings: `npm run seed` (#002).
Then `/anime/[id]` will show real scored recommendations.
