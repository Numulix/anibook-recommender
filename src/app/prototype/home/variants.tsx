// PROTOTYPE home — THROWAWAY. Chosen design: source-split horizontal carousels.
import { trending, coverGradient, type TrendingAnime } from "../_data/mock";
import { MalIcon, AniListIcon } from "../_components/icons";

function Carousel({ icon, title, items }: { icon: React.ReactNode; title: string; items: TrendingAnime[] }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        {icon}
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {items.map((a) => (
          <a key={a.id} href="/prototype/anime" className="group w-40 shrink-0">
            <div
              className="aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-white/10 transition group-hover:ring-white/30"
              style={{ background: coverGradient(a.id) }}
            >
              <div className="flex h-full items-end p-2">
                <span className="text-xs font-bold leading-tight text-white/90 drop-shadow">{a.title}</span>
              </div>
            </div>
            <div className="mt-2 truncate text-sm font-medium">{a.title}</div>
            <div className="text-xs text-zinc-400">{a.genres[0]} · {a.year}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function TrendingHome() {
  const mal = trending.filter((a) => a.sources.includes("MAL"));
  const anilist = trending.filter((a) => a.sources.includes("AniList"));
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold">Trending</h1>
      <Carousel icon={<MalIcon />} title="Popular on MyAnimeList" items={mal} />
      <Carousel icon={<AniListIcon />} title="Popular on AniList" items={anilist} />
    </div>
  );
}
