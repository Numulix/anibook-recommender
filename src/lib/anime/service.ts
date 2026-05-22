import { fetchAniListById } from "./anilist";
import { fetchMalById } from "./mal";
import { getCachedAnime, upsertAnime } from "./cacheRepo";
import { isStale, mergeAnime } from "./merge";
import type { MalSource, UnifiedAnime } from "./types";

// Resolves a unified anime by AniList id, serving fresh cache when possible and
// otherwise fetching AniList (anchor) + MAL (rating), merging, and caching.
//
// Resilience: if AniList is unreachable but we hold a (stale) cache, we serve
// it rather than failing. MAL is best-effort — a failed MAL lookup degrades to
// a null rating instead of breaking the response. Returns null only when the
// anime is genuinely unknown and we have nothing cached.
export async function getAnime(anilistId: number): Promise<UnifiedAnime | null> {
  const cached = await getCachedAnime(anilistId);
  if (cached && !isStale(cached.cachedAt, new Date())) return cached.anime;

  let anilist;
  try {
    anilist = await fetchAniListById(anilistId);
  } catch (err) {
    if (cached) return cached.anime; // serve stale on upstream failure
    throw err;
  }
  if (!anilist) return cached?.anime ?? null;

  let mal: MalSource | null = null;
  if (anilist.malId != null) {
    try {
      mal = await fetchMalById(anilist.malId);
    } catch {
      mal = null;
    }
  }

  const unified = mergeAnime(anilist, mal);
  try {
    await upsertAnime(unified);
  } catch (err) {
    console.warn(`anime_cache upsert failed for anilist ${anilistId}:`, err);
  }
  return unified;
}
