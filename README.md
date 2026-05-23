# Anibook Recommender

Find books that match the anime you love. Pick an anime and Anibook surfaces a
scored list of book recommendations matched by **semantic similarity** — using
OpenAI embeddings and pgvector cosine search over a curated book catalog. No
account, no friction; purely a discovery tool.

![Anibook Demo](docs/images/demo.mp4)

## How it works

- **Anime data** is pulled from **AniList** (the anchor source) and enriched with
  the **MyAnimeList** community rating, then cached in Supabase.
- **Books** come from a curated [Open Library](https://openlibrary.org) catalog,
  each embedded once with `text-embedding-3-small` into a 1536-dim vector.
- **Recommendations** embed the anime's synopsis + genres at request time and run
  a pgvector cosine-similarity query against the book catalog. Matches at or above
  50% similarity are shown as scored cards; when fewer than three clear the bar,
  the closest near-misses fill in as clearly-labelled "loosely related" reads. The
  result is cached per anime, so the embedding call happens only once per title.

## Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 16 (App Router, TypeScript)                |
| Styling        | Tailwind CSS v4                                     |
| Database       | Supabase (Postgres + pgvector)                     |
| Embeddings     | OpenAI `text-embedding-3-small`                    |
| Anime sources  | AniList GraphQL + MyAnimeList REST                 |
| Book source    | Open Library Search/Subjects API                  |
| Tests          | Vitest                                             |
| Hosting        | Vercel (planned)                                   |

## Status

**v1 complete.** Working today:

- ✅ Trending homepage (source-split carousels from MAL + AniList, 6h cached)
- ✅ Global search bar (debounced live AniList search with autocomplete)
- ✅ Anime detail page + `/api/anime/[id]` (merged AniList/MAL, cached)
- ✅ Book catalog seeding pipeline (filtering, embedding, idempotent upsert)
- ✅ Book recommendations (`/api/recommendations/[animeId]`, threshold + fallbacks, cached per anime)

## Getting started

### Prerequisites

- Node.js 20+
- The [Supabase CLI](https://supabase.com/docs/guides/cli) and a Docker daemon
  (e.g. [OrbStack](https://orbstack.dev) or Docker Desktop) for local Postgres
- An OpenAI API key, and a [MyAnimeList API client ID](https://myanimelist.net/apiconfig)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local Supabase (Postgres + pgvector) and apply migrations
npx supabase start
npx supabase migration up

# 3. Configure environment
cp .env.example .env.local
# Fill in .env.local:
#   - Supabase URL + keys from `npx supabase status`
#   - OPENAI_API_KEY
#   - MAL_CLIENT_ID

# 4. Seed the book catalog (start small to verify the pipeline)
npm run seed -- --limit=25

# 5. Run the app
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                       | Description                                  |
| ---------------------------- | -------------------------------------------- |
| `npm run dev`                | Start the dev server                         |
| `npm run build`              | Production build                             |
| `npm run start`              | Serve the production build                   |
| `npm run lint`               | Run ESLint                                   |
| `npm test`                   | Run Vitest in watch mode                     |
| `npm run test:run`           | Run the test suite once                      |
| `npm run seed -- --limit=N`  | Seed/refresh the book catalog (idempotent)   |

## Project structure

```
src/
  app/
    anime/[id]/   # Anime detail page (hero, ratings, recommendations)
    api/          # Route handlers (anime, anime search, recommendations)
  components/     # Shared UI (AnimeCard, SearchBar, BookRecommendations, icons)
  lib/
    anime/        # AniList/MAL clients, merge + trending logic, Supabase cache
    recommendations/  # Embedding input, similarity query, selection rule, cache
    seed/         # Book catalog filtering + embedding pipeline
scripts/          # One-off scripts (book seeding)
supabase/         # Migrations and local config
docs/             # Project docs and images
```
