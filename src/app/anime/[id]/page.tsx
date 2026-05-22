import { notFound } from "next/navigation";
import { getAnime } from "@/lib/anime/service";
import { formatAnilistRating, formatMalRating, formatStudiosYear } from "@/lib/anime/detail";
import { MalIcon, AniListIcon } from "@/components/icons";
import { Synopsis } from "@/components/Synopsis";

// The detail page reads the (possibly background-refreshed) Supabase cache, so
// it must not be statically cached — same policy as the homepage.
export const dynamic = "force-dynamic";

// Deterministic gradient cover fallback, mirroring AnimeCard's treatment.
function coverGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `linear-gradient(135deg, hsl(${h} 55% 38%), hsl(${(h + 40) % 360} 60% 22%))`;
}

function RatingChip({
  label,
  icon,
  value,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  tone: string;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ring-1 ${tone}`}>
      {icon}
      <div>
        <div className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</div>
        <div className="text-lg font-bold leading-tight">{value}</div>
      </div>
    </div>
  );
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anilistId = Number(id);
  if (!Number.isInteger(anilistId) || anilistId <= 0) notFound();

  const anime = await getAnime(anilistId);
  if (!anime) notFound();

  const meta = formatStudiosYear(anime.studios, anime.year);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div
          className="aspect-[2/3] w-full overflow-hidden rounded-xl ring-1 ring-white/10"
          style={anime.coverUrl ? undefined : { background: coverGradient(String(anime.anilistId)) }}
        >
          {anime.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={anime.coverUrl} alt={anime.title} className="h-full w-full object-cover" />
          )}
        </div>

        <h1 className="mt-4 text-2xl font-bold">{anime.title}</h1>
        {meta && <div className="mt-1 text-sm text-zinc-400">{meta}</div>}

        <div className="mt-3 flex flex-wrap gap-3">
          <RatingChip
            label="MAL"
            icon={<MalIcon size={18} />}
            value={formatMalRating(anime.malRating)}
            tone="bg-blue-500/10 ring-blue-500/20"
          />
          <RatingChip
            label="AniList"
            icon={<AniListIcon size={18} />}
            value={formatAnilistRating(anime.anilistRating)}
            tone="bg-sky-500/10 ring-sky-500/20"
          />
        </div>

        {anime.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {anime.genres.map((g) => (
              <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-300">
                {g}
              </span>
            ))}
          </div>
        )}

        {anime.synopsis && (
          <Synopsis text={anime.synopsis} className="mt-4 text-sm leading-relaxed text-zinc-300" />
        )}
      </aside>

      <section>
        <h2 className="mb-4 text-lg font-bold">Books like this</h2>
        {/* Placeholder — the recommendations list is wired up in #007. */}
        <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-zinc-500">
          Book recommendations are coming soon.
        </div>
      </section>
    </main>
  );
}
