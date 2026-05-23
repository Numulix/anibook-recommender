import { getAnime } from "@/lib/anime/service";
import { embedBatch } from "@/lib/seed/embed";
import { buildAnimeEmbeddingInput, selectRecommendations, type ScoredBook } from "./recommend";
import { matchBooks } from "./booksRepo";
import { getCachedRecommendations, saveRecommendations } from "./recommendationsRepo";

// Resolves book recommendations for an anime. Serves the per-anime cache when
// present; otherwise embeds the anime's genres + synopsis, runs the pgvector
// similarity search, applies the threshold/fallback rule, and caches the result.
//
// Returns null when the anime itself is unknown (so the route can 404), versus
// an empty array when the anime exists but nothing matched.
export async function getRecommendations(animeId: number): Promise<ScoredBook[] | null> {
  const cached = await getCachedRecommendations(animeId);
  if (cached) return cached;

  const anime = await getAnime(animeId);
  if (!anime) return null;

  const [embedding] = await embedBatch([buildAnimeEmbeddingInput(anime)]);
  const candidates = await matchBooks(embedding);
  const books = selectRecommendations(candidates);

  // Only cache real results: an empty list usually means the catalog hasn't
  // been seeded yet, and there's no TTL — caching it would stick.
  if (books.length > 0) {
    try {
      await saveRecommendations(animeId, books);
    } catch (err) {
      console.warn(`recommendation_cache write failed for anime ${animeId}:`, err);
    }
  }
  return books;
}
