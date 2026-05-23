// A book candidate scored by cosine similarity to an anime (0..1).
export type ScoredBook = {
  openLibraryId: string;
  title: string;
  author: string;
  synopsis: string;
  genres: string[];
  coverUrl: string | null;
  score: number;
};

// The text we embed for an anime to query the book catalog. Uses the anime's
// genres + synopsis (per #007), echoing the "Genres: …" structure the books
// were embedded with so query and catalog share the same vector space.
export function buildAnimeEmbeddingInput(anime: { genres: string[]; synopsis: string }): string {
  return `Genres: ${anime.genres.join(", ")}\n\n${anime.synopsis}`;
}

// Goodreads has no stable per-book URL from our data, so we link to a search
// for the title + author (per the agreed book-card design).
export function goodreadsSearchUrl(title: string, author: string): string {
  return `https://www.goodreads.com/search?q=${encodeURIComponent(`${title} ${author}`)}`;
}

export const MATCH_THRESHOLD = 0.5;
export const MAX_RESULTS = 10;
export const MIN_RESULTS = 3;

// Selects the books to recommend from scored candidates: the highest-scoring
// books that clear the 50% similarity threshold (capped at 10). If fewer than
// 3 clear it, tops up with the next-closest below-threshold books so the user
// always sees at least 3 loose suggestions when the catalog can supply them.
export function selectRecommendations(candidates: ScoredBook[]): ScoredBook[] {
  const byScoreDesc = [...candidates].sort((a, b) => b.score - a.score);
  const matches = byScoreDesc.filter((b) => b.score >= MATCH_THRESHOLD);
  if (matches.length >= MIN_RESULTS) return matches.slice(0, MAX_RESULTS);
  return byScoreDesc.slice(0, MIN_RESULTS);
}

// A 0..1 cosine score as a whole-number percent for display.
export function toMatchPercent(score: number): number {
  return Math.round(score * 100);
}

export type MatchTier = "green" | "yellow" | "orange";

// Color tier for the match badge, keyed off the displayed percent so the color
// always agrees with the number shown: green ≥75%, yellow 60–74%, orange below.
export function matchTier(score: number): MatchTier {
  const pct = toMatchPercent(score);
  if (pct >= 75) return "green";
  if (pct >= 60) return "yellow";
  return "orange";
}
