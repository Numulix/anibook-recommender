import type { AniListSource, MalSource, UnifiedAnime } from "./types";

// Cache freshness window. The PRD allows 24–48h; 24h keeps ratings reasonably
// current while still serving nearly every request from cache.
export const CACHE_TTL_HOURS = 24;

// AniList is the anchor: it supplies every descriptive field plus the MAL id.
// MAL contributes only its community rating, and is optional — when the lookup
// is skipped or fails, malRating falls back to null and nothing else changes.
export function mergeAnime(anilist: AniListSource, mal: MalSource | null): UnifiedAnime {
  return {
    anilistId: anilist.anilistId,
    malId: anilist.malId,
    title: anilist.title,
    synopsis: anilist.synopsis,
    genres: anilist.genres,
    coverUrl: anilist.coverUrl,
    malRating: mal?.malRating ?? null,
    anilistRating: anilist.anilistRating,
    studios: anilist.studios,
    year: anilist.year,
    episodeCount: anilist.episodeCount,
    status: anilist.status,
  };
}

// A cache row is stale once it is older than the TTL. The exact boundary still
// counts as fresh.
export function isStale(
  cachedAt: string | Date,
  now: Date,
  ttlHours: number = CACHE_TTL_HOURS,
): boolean {
  const cachedMs = (cachedAt instanceof Date ? cachedAt : new Date(cachedAt)).getTime();
  const ageMs = now.getTime() - cachedMs;
  return ageMs > ttlHours * 60 * 60 * 1000;
}
