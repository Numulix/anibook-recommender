import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { UnifiedAnime } from "./types";

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    client = createClient(url, key);
  }
  return client;
}

type AnimeCacheRow = {
  anilist_id: number;
  mal_id: number | null;
  title: string;
  synopsis: string;
  genres: string[];
  cover_url: string | null;
  mal_rating: number | null;
  anilist_rating: number | null;
  studios: string[];
  year: number | null;
  episode_count: number | null;
  status: string | null;
  cached_at: string;
};

function rowToAnime(row: AnimeCacheRow): UnifiedAnime {
  return {
    anilistId: row.anilist_id,
    malId: row.mal_id,
    title: row.title,
    synopsis: row.synopsis,
    genres: row.genres,
    coverUrl: row.cover_url,
    malRating: row.mal_rating,
    anilistRating: row.anilist_rating,
    studios: row.studios,
    year: row.year,
    episodeCount: row.episode_count,
    status: row.status,
  };
}

export type CachedAnime = { anime: UnifiedAnime; cachedAt: string };

export async function getCachedAnime(anilistId: number): Promise<CachedAnime | null> {
  const { data, error } = await db()
    .from("anime_cache")
    .select("*")
    .eq("anilist_id", anilistId)
    .maybeSingle();
  if (error) throw new Error(`anime_cache read failed: ${error.message}`);
  if (!data) return null;
  const row = data as AnimeCacheRow;
  return { anime: rowToAnime(row), cachedAt: row.cached_at };
}

// Idempotent: re-running for the same anilist_id refreshes the row in place.
export async function upsertAnime(anime: UnifiedAnime): Promise<void> {
  const row: AnimeCacheRow = {
    anilist_id: anime.anilistId,
    mal_id: anime.malId,
    title: anime.title,
    synopsis: anime.synopsis,
    genres: anime.genres,
    cover_url: anime.coverUrl,
    mal_rating: anime.malRating,
    anilist_rating: anime.anilistRating,
    studios: anime.studios,
    year: anime.year,
    episode_count: anime.episodeCount,
    status: anime.status,
    cached_at: new Date().toISOString(),
  };
  const { error } = await db().from("anime_cache").upsert(row, { onConflict: "anilist_id" });
  if (error) throw new Error(`anime_cache upsert failed: ${error.message}`);
}
