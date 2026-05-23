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

type MatchBooksRow = {
  open_library_id: string;
  title: string;
  author: string;
  synopsis: string;
  genres: string[];
  cover_url: string | null;
  similarity: number;
};

// Cosine-similarity search via the match_books RPC. The embedding is sent in
// pgvector's bracketed text form (same as the seed writer), and the candidate
// count is wider than we display so selectRecommendations has loose fallbacks.
export async function matchBooks(embedding: number[], limit = 30): Promise<ScoredBook[]> {
  const { data, error } = await db().rpc("match_books", {
    query_embedding: `[${embedding.join(",")}]`,
    match_count: limit,
  });
  if (error) throw new Error(`match_books RPC failed: ${error.message}`);

  return ((data ?? []) as MatchBooksRow[]).map((r) => ({
    openLibraryId: r.open_library_id,
    title: r.title,
    author: r.author,
    synopsis: r.synopsis,
    genres: r.genres,
    coverUrl: r.cover_url,
    score: r.similarity,
  }));
}
