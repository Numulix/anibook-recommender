# UI Prototype — THROWAWAY

**Question:** What should the two core surfaces look like — the trending homepage and the anime-detail-plus-book-recommendations page?

**Shape:** Sub-shape B (throwaway routes). Mock data only (`_data/mock.ts`) — no APIs, no DB.

Run `npm run dev`, then:

- Homepage: `/prototype/home`
- Anime detail: `/prototype/anime`

## Verdict (decided 2026-05-21)

**Homepage → source-split horizontal carousels** (one row per source). MAL/AniList
shown as brand icons (`_components/icons.tsx` — currently APPROXIMATIONS, swap for
official assets).

**Anime detail → two-column**: sticky anime info on the left (cover, ratings,
genres, collapsible synopsis), book recommendations on the right.

**Book interaction → modal.** A book card opens a modal with the full synopsis,
genres, and score, plus an explicit "View on Goodreads ↗" button. This solves the
"can't read a long book synopsis because the whole card navigates away" problem —
reading happens in-page, leaving for Goodreads is a deliberate second click.

Match-score tiers (agreed): green ≥75%, yellow 60–74%, orange 50–59%.

### When folding into real routes (#004 homepage, #006 detail, #007 recs)
- Rewrite properly against the real data layer — do not copy prototype code as-is.
- Replace `coverGradient` placeholders with real cover images.
- Replace approximated brand icons with official MAL / AniList assets.
- Then delete the entire `src/app/prototype/` directory.
