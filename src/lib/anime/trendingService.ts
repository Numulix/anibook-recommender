import { fetchAniListTrending } from "./anilistTrending";
import { fetchMalTrending } from "./malTrending";
import { getCachedTrending, saveTrending } from "./trendingRepo";
import { dedupeByAnilistId, type TrendingPayload } from "./trending";
import { isStale } from "./merge";

export const TRENDING_TTL_HOURS = 6;

// Fetches both sources in parallel and caches the merged payload. Resilient: if
// one source fails the other still fills its row; only when BOTH fail do we
// throw, so the caller can fall back to stale cache or an empty state.
export async function refreshTrending(): Promise<TrendingPayload> {
  const [mal, anilist] = await Promise.allSettled([fetchMalTrending(), fetchAniListTrending()]);
  if (mal.status === "rejected" && anilist.status === "rejected") {
    throw new Error("Both trending sources failed");
  }
  const payload: TrendingPayload = {
    mal: mal.status === "fulfilled" ? dedupeByAnilistId(mal.value) : [],
    anilist: anilist.status === "fulfilled" ? dedupeByAnilistId(anilist.value) : [],
  };
  try {
    await saveTrending(payload);
  } catch (err) {
    console.warn("trending_cache save failed:", err);
  }
  return payload;
}

export type TrendingResult = { payload: TrendingPayload; revalidate: boolean };

// Stale-while-revalidate: a fresh cache is returned as-is; a stale cache is
// returned immediately with revalidate=true so the caller can refresh in the
// background; a missing cache is fetched synchronously.
export async function getTrending(): Promise<TrendingResult> {
  const cached = await getCachedTrending();
  if (!cached) return { payload: await refreshTrending(), revalidate: false };
  if (isStale(cached.cachedAt, new Date(), TRENDING_TTL_HOURS)) {
    return { payload: cached.payload, revalidate: true };
  }
  return { payload: cached.payload, revalidate: false };
}
