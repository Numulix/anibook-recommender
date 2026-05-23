"use client";

import { useEffect, useState } from "react";
import {
  matchTier,
  toMatchPercent,
  goodreadsSearchUrl,
  MATCH_THRESHOLD,
  type MatchTier,
  type ScoredBook,
} from "@/lib/recommendations/recommend";

const TIER_CLASSES: Record<MatchTier, string> = {
  green: "text-emerald-300 bg-emerald-500/15 ring-emerald-500/30",
  yellow: "text-amber-300 bg-amber-500/15 ring-amber-500/30",
  orange: "text-orange-300 bg-orange-500/15 ring-orange-500/30",
};

function coverGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `linear-gradient(135deg, hsl(${h} 55% 38%), hsl(${(h + 40) % 360} 60% 22%))`;
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${TIER_CLASSES[matchTier(score)]}`}
    >
      {toMatchPercent(score)}% match
    </span>
  );
}

function Cover({ book, className = "" }: { book: ScoredBook; className?: string }) {
  if (book.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={book.coverUrl} alt={book.title} className={`object-cover ${className}`} />
    );
  }
  return (
    <div className={`overflow-hidden ${className}`} style={{ background: coverGradient(book.openLibraryId) }}>
      <div className="flex h-full flex-col justify-between p-2">
        <span className="text-[11px] font-bold leading-tight text-white/90 drop-shadow">{book.title}</span>
        <span className="text-[10px] text-white/70">{book.author}</span>
      </div>
    </div>
  );
}

function BookModal({ book, onClose }: { book: ScoredBook; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="flex gap-4">
          <Cover book={book} className="h-40 w-28 shrink-0 rounded-lg" />
          <div className="min-w-0 pr-6">
            <h3 className="text-xl font-bold leading-tight">{book.title}</h3>
            <div className="text-sm text-zinc-400">{book.author}</div>
            <div className="mt-2">
              <ScoreBadge score={book.score} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {book.genres.map((g) => (
                <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-300">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-zinc-200">{book.synopsis}</p>
        <a
          href={goodreadsSearchUrl(book.title, book.author)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
        >
          View on Goodreads ↗
        </a>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse gap-4 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/10">
          <div className="h-32 w-22 shrink-0 rounded-lg bg-white/5" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-1/2 rounded bg-white/5" />
            <div className="h-3 w-1/3 rounded bg-white/5" />
            <div className="h-3 w-full rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Fetches and renders the book recommendations for an anime, replacing the
// #006 placeholder. Loading skeleton → list (cards open a modal) or a friendly
// empty state; loose (sub-threshold) fallbacks are flagged with a note.
export function BookRecommendations({ animeId }: { animeId: number }) {
  const [books, setBooks] = useState<ScoredBook[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<ScoredBook | null>(null);

  // Remounted per anime via a `key` at the call site, so initial state already
  // shows the skeleton — no need to reset state synchronously here.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/recommendations/${animeId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { books?: ScoredBook[] };
        setBooks(data.books ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setFailed(true);
      }
    })();
    return () => controller.abort();
  }, [animeId]);

  if (failed) {
    return (
      <p className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        Couldn’t load recommendations right now. Please try again shortly.
      </p>
    );
  }

  if (books === null) return <Skeleton />;

  if (books.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        We couldn’t find books that match this anime yet — try another title.
      </p>
    );
  }

  const looseOnly = books.every((b) => b.score < MATCH_THRESHOLD);

  return (
    <>
      {looseOnly && (
        <p className="mb-3 text-sm text-zinc-500">
          No strong matches — here are a few loosely related reads.
        </p>
      )}
      <div className="space-y-3">
        {books.map((b) => (
          <button
            key={b.openLibraryId}
            onClick={() => setSelected(b)}
            className="flex w-full cursor-pointer gap-4 rounded-xl bg-white/[0.03] p-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.06]"
          >
            <Cover book={b} className="h-32 w-22 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{b.title}</div>
                  <div className="text-sm text-zinc-400">{b.author}</div>
                </div>
                <ScoreBadge score={b.score} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{b.synopsis}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {b.genres.map((g) => (
                  <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-300">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && <BookModal book={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
