---
id: "000"
title: "PRD — Anibook Recommender"
status: ready-for-human
type: HITL
---

## Problem Statement

Anime fans want to find books that match the stories, themes, and emotional tone of anime they love — but there is no dedicated tool for this. Generic book recommendation engines don't understand anime as a domain, and searching manually is hit-or-miss.

## Solution

A public, read-only web app where users browse trending anime or search by title, open an anime's detail page, and get a scored list of book recommendations matched by semantic similarity (synopsis, genres, themes). No account required. Designed as a discovery tool — fast, focused, frictionless.

## User Stories

1. As a user, I want to see trending anime on the homepage so that I can discover popular titles without knowing what to search for.
2. As a user, I want trending anime sourced from both MAL and AniList so that I get a broad, deduplicated view of what's popular.
3. As a user, I want each trending anime card to show a cover image, title, and ratings so that I can quickly assess what looks interesting.
4. As a user, I want to click a trending anime card and go to its detail page so that I can learn more and see book recommendations.
5. As a user, I want a search bar available on every page so that I can look up any anime by name at any time.
6. As a user, I want the search bar to show results as I type (with debounce) so that I don't have to press Enter to get results.
7. As a user, I want typo-tolerant search so that misspellings still return relevant results.
8. As a user, I want to select a search result and go directly to that anime's detail page so that the flow from search to recommendations is seamless.
9. As a user, I want the anime detail page to show the cover image, title, synopsis, genre tags, studios, and year so that I have full context before reading book recommendations.
10. As a user, I want to see both the MAL rating and AniList rating displayed side by side so that I can compare how each community rates the anime.
11. As a user, I want long synopses to be collapsible so that the page doesn't feel overwhelming before I scroll to recommendations.
12. As a user, I want a list of book recommendations below the anime info so that everything I need is on one page.
13. As a user, I want each book recommendation to show a cover, title, author, genres, a short plot summary, and a match score so that I can quickly judge whether a book is right for me.
14. As a user, I want the match score displayed as a percentage badge so that I can understand how closely a book matches the anime at a glance.
15. As a user, I want the match score badge to be color-coded (green/yellow/orange) so that I can visually rank books without reading numbers.
16. As a user, I want the match score color to reflect strength: green for ≥75%, yellow for 60–74%, orange for 50–59% so that the visual hierarchy is intuitive.
17. As a user, I want each book card to link to its Goodreads page so that I can read reviews and add it to my reading list.
18. As a user, I want only books above a 50% similarity threshold shown so that I don't see irrelevant recommendations.
19. As a user, I want a friendly empty state with up to 3 loose fallbacks if no books clear 50% so that I always leave with some suggestions.
20. As a user, I want recommendations to load quickly so that I don't wait long after landing on an anime page.

## Implementation Decisions

### Stack
- **Frontend:** Next.js (App Router) with TypeScript and Tailwind CSS, deployed on Vercel
- **Database:** Supabase (Postgres + pgvector extension) — single service for relational data, vector storage, and caching
- **Embeddings:** OpenAI `text-embedding-3-small` — low cost (~$0.02/million tokens), sufficient quality for semantic similarity
- **Anime sources:** MAL REST API + AniList GraphQL API fetched in parallel and merged
- **Book source:** Open Library bulk data dump, pre-processed into a ~20k book catalog

### Modules

**Anime cache module**
- Encapsulates all reads and writes to the `anime_cache` Supabase table
- Fetches MAL and AniList data in parallel, merges into a unified anime shape
- Enforces a 24–48h TTL: returns cached data if fresh, re-fetches if stale
- Unified shape includes: `mal_id`, `anilist_id`, `title`, `synopsis`, `genres`, `cover_url`, `mal_rating`, `anilist_rating`, `studios`, `year`
- Exposed via `/api/anime/[id]` route handler

**Recommendation engine**
- Pure function: accepts an anime text blob (synopsis + genres concatenated) and returns a ranked list of books with cosine similarity scores
- Calls OpenAI to embed the anime text, runs a pgvector similarity query against the `books` table
- Filters to books above 50% similarity; falls back to top 3 below-threshold results if needed
- Result cached in `recommendation_cache` table keyed by `anime_id` — embedding only runs once per anime ever
- Exposed via `/api/recommendations/[animeId]` route handler

**Trending poller**
- Fetches trending anime from MAL and AniList in parallel
- Deduplicates by normalized title
- Caches result in Supabase with a 6h TTL, serves stale while revalidating
- Exposed via `/api/anime/trending` route handler

**Search proxy**
- Thin wrapper around AniList GraphQL search endpoint
- No caching — results are live per query
- Exposed via `/api/anime/search?q=` route handler
- AniList handles fuzzy/typo tolerance server-side

**Book catalog seeder (one-time script)**
- Downloads and parses Open Library bulk data dump
- Filters to books with: synopsis ≥100 words, ≥1 genre tag, published post-1900, excludes manga and light novels
- Target catalog size: ~20k books
- Embeds each book as a single text blob: `title + genres + synopsis`
- Upserts to Supabase `books` table (idempotent)
- Run once locally; not an API route

### Schema (high-level)

**`books`**: `id`, `title`, `author`, `synopsis`, `genres`, `cover_url`, `open_library_id`, `embedding` (vector(1536)), `created_at`

**`anime_cache`**: `id`, `mal_id`, `anilist_id`, `title`, `synopsis`, `genres`, `cover_url`, `mal_rating`, `anilist_rating`, `studios`, `year`, `cached_at`

**`recommendation_cache`**: `id`, `anime_id`, `results` (jsonb), `created_at`

### UI decisions
- Match score badge: percentage derived from cosine similarity × 100, color-coded green (≥75%) / yellow (60–74%) / orange (50–59%)
- Goodreads link: constructed as a search URL from title + author (no stored field needed)
- Synopsis: collapsible toggle at ~4 lines
- Search autocomplete: 8 results max, cover thumbnail + title, closes on outside click or Escape

## Testing Decisions

A good test covers external behavior only — what goes in and what comes out — not internal implementation details like which Supabase query was called or how data was transformed internally.

**Anime cache module** — highest priority
- Test the merge logic: given a MAL response and AniList response, the unified shape is correct
- Test TTL logic: a fresh cache hit returns cached data without re-fetching; a stale cache triggers a re-fetch
- Test partial data: if one API returns missing fields, the merge fills in nulls gracefully rather than throwing

**Search proxy**
- Test that the route correctly passes the query string to AniList and returns the transformed response shape
- Test empty query handling (returns empty array, not an error)
- Test that AniList error responses are caught and returned as a clean API error

**Recommendation engine**
- Test the score filtering: results below 50% are excluded; fallback logic activates when fewer than 3 results clear the threshold
- Test the score display mapping: cosine values map correctly to percentage and color tier
- Test the empty state: when no results and no fallbacks exist, the correct empty response shape is returned
- These tests should mock the OpenAI embedding call and the pgvector query to keep them fast and free

**Book catalog seeder — filtering logic**
- Test the filter function in isolation: books missing a synopsis, with a synopsis under 100 words, published pre-1900, or tagged as manga/light novels are excluded
- Test that the filter is idempotent on re-run (no duplicate rows created)

No prior test art exists in the codebase — this is a greenfield project. Use Vitest as the test runner (natural fit with the Next.js/TypeScript stack).

## Out of Scope

- User authentication, accounts, or saved lists
- Filtering or sorting the homepage trending list
- Episode count, airing status, or other anime metadata beyond what's listed
- Manga or light novels in the book catalog
- Admin UI (Supabase dashboard is sufficient)
- Real-time trending data (6h cache TTL is acceptable)
- Mobile app

## Further Notes

- The one-time embedding cost for the full 20k book catalog is approximately $0.12 at current OpenAI pricing — negligible.
- Vercel serverless function free tier has a 10s timeout; the embedding + pgvector query pipeline is expected to complete in <2s.
- MAL requires an API client ID for public endpoints; AniList GraphQL requires no API key.
- Supabase local dev (`supabase start`) mirrors the cloud environment, so development and production parity is high.
