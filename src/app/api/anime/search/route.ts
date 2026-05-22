import { NextResponse } from "next/server";
import { searchAniList } from "@/lib/anime/search";

// GET /api/anime/search?q= — proxies a live search to AniList GraphQL.
// An empty query returns no results rather than hitting AniList.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  try {
    const results = await searchAniList(q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("/api/anime/search failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
