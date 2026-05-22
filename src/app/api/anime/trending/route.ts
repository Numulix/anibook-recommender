import { NextResponse, after } from "next/server";
import { getTrending, refreshTrending } from "@/lib/anime/trendingService";

// GET /api/anime/trending — merged trending payload { mal, anilist }.
// Stale cache is served immediately and refreshed in the background.
export async function GET() {
  try {
    const { payload, revalidate } = await getTrending();
    if (revalidate) {
      after(() => refreshTrending().catch((e) => console.warn("trending revalidate failed:", e)));
    }
    return NextResponse.json(payload);
  } catch (err) {
    console.error("/api/anime/trending failed:", err);
    return NextResponse.json({ mal: [], anilist: [] }, { status: 502 });
  }
}
