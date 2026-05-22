import { NextResponse } from "next/server";
import { getAnime } from "@/lib/anime/service";

// GET /api/anime/[id] — [id] is an AniList id (the canonical lookup key).
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const anilistId = Number(id);
  if (!Number.isInteger(anilistId) || anilistId <= 0) {
    return NextResponse.json({ error: "Invalid anime id" }, { status: 400 });
  }

  try {
    const anime = await getAnime(anilistId);
    if (!anime) return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    return NextResponse.json(anime);
  } catch (err) {
    console.error(`/api/anime/${anilistId} failed:`, err);
    return NextResponse.json({ error: "Failed to load anime" }, { status: 502 });
  }
}
