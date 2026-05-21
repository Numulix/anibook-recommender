// PROTOTYPE anime detail — THROWAWAY. Chosen design: two-column, sticky anime
// info left, book recommendations (modal on click) right.
import { animeDetail as a, recommendations, coverGradient } from "../_data/mock";
import { Synopsis } from "../_components/Synopsis";
import { BookModalList } from "../_components/BookModalList";

function AnimeRatings() {
  return (
    <div className="flex gap-3">
      <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-center ring-1 ring-emerald-500/20">
        <div className="text-[10px] uppercase tracking-wide text-emerald-300/70">MAL</div>
        <div className="text-lg font-bold text-emerald-300">{a.malRating}</div>
      </div>
      <div className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-center ring-1 ring-violet-500/20">
        <div className="text-[10px] uppercase tracking-wide text-violet-300/70">AniList</div>
        <div className="text-lg font-bold text-violet-300">{a.anilistRating}</div>
      </div>
    </div>
  );
}

export function AnimeDetailPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
      <aside className="lg:sticky lg:top-8 lg:h-fit">
        <div className="aspect-[2/3] w-full overflow-hidden rounded-xl ring-1 ring-white/10" style={{ background: coverGradient(a.id) }} />
        <h1 className="mt-4 text-2xl font-bold">{a.title}</h1>
        <div className="mt-1 text-sm text-zinc-400">{a.studios.join(", ")} · {a.year}</div>
        <div className="mt-3"><AnimeRatings /></div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.genres.map((g) => <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-300">{g}</span>)}
        </div>
        <Synopsis text={a.synopsis} className="mt-4 text-sm leading-relaxed text-zinc-300" />
      </aside>
      <section>
        <h2 className="mb-4 text-lg font-bold">Books like this <span className="text-zinc-500">({recommendations.length})</span></h2>
        <BookModalList books={recommendations} />
      </section>
    </div>
  );
}
