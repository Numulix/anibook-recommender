import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ScoredBook } from "./recommend";

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

// Returns the cached recommendation list for an anime, or null on a cache miss.
export async function getCachedRecommendations(animeId: number): Promise<ScoredBook[] | null> {
  const { data, error } = await db()
    .from("recommendation_cache")
    .select("payload")
    .eq("anime_id", animeId)
    .maybeSingle();
  if (error) throw new Error(`recommendation_cache read failed: ${error.message}`);
  if (!data) return null;
  return data.payload as ScoredBook[];
}

// Idempotent: re-running for the same anime refreshes the row in place.
export async function saveRecommendations(animeId: number, books: ScoredBook[]): Promise<void> {
  const { error } = await db()
    .from("recommendation_cache")
    .upsert(
      { anime_id: animeId, payload: books, cached_at: new Date().toISOString() },
      { onConflict: "anime_id" },
    );
  if (error) throw new Error(`recommendation_cache write failed: ${error.message}`);
}
