import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TrendingPayload } from "./trending";

// One global trending list, stored as a single upserted row.
const CACHE_KEY = "global";

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

export type CachedTrending = { payload: TrendingPayload; cachedAt: string };

export async function getCachedTrending(): Promise<CachedTrending | null> {
  const { data, error } = await db()
    .from("trending_cache")
    .select("payload, cached_at")
    .eq("key", CACHE_KEY)
    .maybeSingle();
  if (error) throw new Error(`trending_cache read failed: ${error.message}`);
  if (!data) return null;
  return { payload: data.payload as TrendingPayload, cachedAt: data.cached_at as string };
}

export async function saveTrending(payload: TrendingPayload): Promise<void> {
  const { error } = await db()
    .from("trending_cache")
    .upsert({ key: CACHE_KEY, payload, cached_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(`trending_cache write failed: ${error.message}`);
}
