import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CatalogBook } from "./filterBook";

export type EmbeddedBook = CatalogBook & { embedding: number[] };

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

// Idempotent: re-running with the same books overwrites by open_library_id
// rather than inserting duplicates.
export async function upsertBooks(books: EmbeddedBook[]): Promise<void> {
  if (books.length === 0) return;
  const rows = books.map((b) => ({
    open_library_id: b.openLibraryId,
    title: b.title,
    author: b.author,
    synopsis: b.synopsis,
    genres: b.genres,
    cover_url: b.coverUrl,
    embedding: `[${b.embedding.join(",")}]`,
  }));
  const { error } = await db().from("books").upsert(rows, { onConflict: "open_library_id" });
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
}
