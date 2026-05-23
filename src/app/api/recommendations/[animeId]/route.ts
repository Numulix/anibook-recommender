import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations/service";

// GET /api/recommendations/[animeId] — [animeId] is an AniList id.
// Returns { books: ScoredBook[] }; 404 when the anime is unknown.
export async function GET(_req: Request, ctx: { params: Promise<{ animeId: string }> }) {
  const { animeId } = await ctx.params;
  const id = Number(animeId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid anime id" }, { status: 400 });
  }

  try {
    const books = await getRecommendations(id);
    if (books === null) return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    return NextResponse.json({ books });
  } catch (err) {
    console.error(`/api/recommendations/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to load recommendations" }, { status: 502 });
  }
}
