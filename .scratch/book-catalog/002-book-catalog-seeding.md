---
id: "002"
title: "Book catalog seeding script"
status: done
type: HITL
---

## What to build

A one-time Node.js script that downloads Open Library bulk data, filters it to a curated ~20k book catalog, embeds each book using OpenAI `text-embedding-3-small`, and stores the results in Supabase. This is the foundation for all recommendation queries.

## Acceptance criteria

- [x] Supabase `books` table created with columns: `id`, `title`, `author`, `synopsis`, `genres`, `cover_url`, `open_library_id`, `embedding` (vector(1536)), `created_at` (+ hnsw cosine index)
- [x] Script filters Open Library data to books with: synopsis of 100+ words, at least one genre tag, published post-1900, no manga or light novels (`filterBook`, 13 tests; also strips namespaced/blocklisted genre noise)
- [x] ~~Final catalog is ~20k books~~ → **1000 books seeded for v1** (user's call: enough to validate the recommender; OL fetch is throttled via the Search API, not bulk dumps; top up later if the project scales)
- [x] Each book is embedded as a single text blob (title + genres + synopsis concatenated) using `text-embedding-3-small`
- [x] Embeddings stored in Supabase with pgvector
- [x] Script is idempotent (safe to re-run without duplicating rows — `upsert` on `open_library_id`)
- [x] Goodreads search URL derivable from title + author (no separate field needed)

## Blocked by

- #001 Project setup & infrastructure

## Completion note

Pipeline built and TDD'd (`src/lib/seed/*`, `scripts/seed-books.ts`). Source approach changed from "bulk data dump" to the throttled Open Library Search/Subjects **API** (user wary of OL's bulk-download terms). Catalog sized at **1000** rather than ~20k for v1 — a deliberate scope reduction, not a gap. Re-run `npm run seed -- --limit=N` to grow it.
