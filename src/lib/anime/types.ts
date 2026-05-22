// Unified anime shape returned by /api/anime/[id] and consumed by the UI.
// AniList is the anchor source; MAL contributes the community rating.
export type UnifiedAnime = {
  anilistId: number;
  malId: number | null;
  title: string;
  synopsis: string;
  genres: string[];
  coverUrl: string | null;
  malRating: number | null; // out of 10
  anilistRating: number | null; // out of 100
  studios: string[];
  year: number | null;
  episodeCount: number | null;
  status: string | null;
};

// Normalized data extracted from an AniList Media query. Always present for a
// successful lookup since the AniList id is the route key.
export type AniListSource = {
  anilistId: number;
  malId: number | null;
  title: string;
  synopsis: string;
  genres: string[];
  coverUrl: string | null;
  anilistRating: number | null; // averageScore, 0..100
  studios: string[];
  year: number | null;
  episodeCount: number | null;
  status: string | null;
};

// Normalized data extracted from a MAL anime query. Optional: the lookup is
// skipped when AniList has no idMal, and tolerated to fail gracefully.
export type MalSource = {
  malId: number;
  malRating: number | null; // "mean", 0..10
};
