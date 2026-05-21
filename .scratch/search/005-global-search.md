---
id: "005"
title: "Global search bar"
status: ready-for-human
type: HITL
---

## What to build

A debounced search bar available in the site header on every page, querying AniList's GraphQL API live. Results appear in an autocomplete dropdown and navigate to the anime detail page on selection. Fuzzy/typo tolerance is handled server-side by AniList.

## Acceptance criteria

- [ ] `/api/anime/search?q=` route proxies the query to AniList GraphQL search endpoint
- [ ] Search bar component is in the global layout header (visible on all pages)
- [ ] Input is debounced (300ms) before firing the search request
- [ ] Autocomplete dropdown shows up to 8 results with cover thumbnail and title
- [ ] Selecting a result navigates to `/anime/[id]`
- [ ] Dropdown closes on outside click or Escape key
- [ ] Empty state shown if no results found

## Blocked by

- #001 Project setup & infrastructure
