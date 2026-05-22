---
id: "005"
title: "Global search bar"
status: done
type: HITL
---

## What to build

A debounced search bar available in the site header on every page, querying AniList's GraphQL API live. Results appear in an autocomplete dropdown and navigate to the anime detail page on selection. Fuzzy/typo tolerance is handled server-side by AniList.

## Acceptance criteria

- [x] `/api/anime/search?q=` route proxies the query to AniList GraphQL search endpoint
- [x] Search bar component is in the global layout header (visible on all pages)
- [x] Input is debounced (300ms) before firing the search request
- [x] Autocomplete dropdown shows up to 8 results with cover thumbnail and title
- [x] Selecting a result navigates to `/anime/[id]`
- [x] Dropdown closes on outside click or Escape key
- [x] Empty state shown if no results found

## Blocked by

- #001 Project setup & infrastructure

## Comments

**Implemented** (awaiting human visual verification — HITL):

- `src/lib/anime/search.ts` — `searchAniList(query)` fetcher + pure `toSearchResults` mapper (unit-tested in `search.test.ts`).
- `src/app/api/anime/search/route.ts` — `GET /api/anime/search?q=` proxy; empty query short-circuits, AniList failures return 502.
- `src/components/SearchBar.tsx` — 300ms debounce, AbortController to drop stale responses, up to 8 results with cover thumbnail + title, arrow-key + Enter selection, Escape and outside-click close, "Searching…" / "No anime found." states.
- `src/app/layout.tsx` — sticky global header with the search bar + home link, visible on all pages.

Verified live: `?q=naruto` → 8 results; empty `?q=` → `[]`; homepage renders the header (HTTP 200). Tests, `tsc`, and lint all pass.

**Caveat on fuzzy/typo tolerance:** the issue assumes AniList handles typos server-side, but in practice AniList's search is substring/prefix-based, not Levenshtein. Verified directly against AniList: `narto`, `bleech`, `attak` all return 0 results regardless of `sort: SEARCH_MATCH`. We proxy AniList faithfully; real typo correction would require our own search index and is out of scope for v1.
