import { after } from "next/server";
import { getTrending, refreshTrending } from "@/lib/anime/trendingService";
import { AnimeCard } from "@/components/AnimeCard";
import { MalIcon, AniListIcon } from "@/components/icons";
import type { TrendingCard, TrendingPayload } from "@/lib/anime/trending";

// Reads our 6h Supabase cache on every request (and triggers a background
// refresh when stale), so the page must not be statically cached.
export const dynamic = "force-dynamic";

function Carousel({ icon, title, items }: { icon: React.ReactNode; title: string; items: TrendingCard[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        {icon}
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {items.map((a) => (
          <AnimeCard key={a.anilistId} card={a} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  let payload: TrendingPayload = { mal: [], anilist: [] };
  let failed = false;
  try {
    const result = await getTrending();
    payload = result.payload;
    if (result.revalidate) {
      after(() => refreshTrending().catch((e) => console.warn("trending revalidate failed:", e)));
    }
  } catch (err) {
    console.error("homepage trending load failed:", err);
    failed = true;
  }

  const empty = payload.mal.length === 0 && payload.anilist.length === 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold">Trending</h1>
      {empty ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
          {failed
            ? "Couldn’t load trending anime right now. Please try again shortly."
            : "No trending anime available yet."}
        </div>
      ) : (
        <>
          <Carousel icon={<MalIcon />} title="Popular on MyAnimeList" items={payload.mal} />
          <Carousel icon={<AniListIcon />} title="Popular on AniList" items={payload.anilist} />
        </>
      )}
    </main>
  );
}
