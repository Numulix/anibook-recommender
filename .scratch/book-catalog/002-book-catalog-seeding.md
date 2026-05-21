---
id: "002"
title: "Book catalog seeding script"
status: ready-for-human
type: HITL
---

## What to build

A one-time Node.js script that downloads Open Library bulk data, filters it to a curated ~20k book catalog, embeds each book using OpenAI `text-embedding-3-small`, and stores the results in Supabase. This is the foundation for all recommendation queries.

## Acceptance criteria

- [ ] Supabase `books` table created with columns: `id`, `title`, `author`, `synopsis`, `genres`, `cover_url`, `open_library_id`, `embedding` (vector), `created_at`
- [ ] Script filters Open Library data to books with: synopsis of 100+ words, at least one genre tag, published post-1900, no manga or light novels
- [ ] Final catalog is ~20k books
- [ ] Each book is embedded as a single text blob (title + genres + synopsis concatenated) using `text-embedding-3-small`
- [ ] Embeddings stored in Supabase with pgvector
- [ ] Script is idempotent (safe to re-run without duplicating rows)
- [ ] Goodreads search URL derivable from title + author (no separate field needed)

## Blocked by

- #001 Project setup & infrastructure
