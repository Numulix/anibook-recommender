"use client";

// PROTOTYPE — book list where a card opens a modal with the full synopsis,
// then an explicit "View on Goodreads" action. Keeps the user on the page to
// read, navigation is a deliberate second step.
import { useEffect, useState } from "react";
import { coverGradient, type BookMatch } from "../_data/mock";
import { scoreTier } from "./score";

function ScoreBadge({ score }: { score: number }) {
  const t = scoreTier(score);
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${t.text} ${t.bg} ${t.ring}`}>
      {t.pct}% match
    </span>
  );
}

function Cover({ b, className = "" }: { b: BookMatch; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ background: coverGradient(b.id) }}>
      <div className="flex h-full flex-col justify-between p-2">
        <span className="text-[11px] font-bold leading-tight text-white/90 drop-shadow">{b.title}</span>
        <span className="text-[10px] text-white/70">{b.author}</span>
      </div>
    </div>
  );
}

export function BookModalList({ books }: { books: BookMatch[] }) {
  const [selected, setSelected] = useState<BookMatch | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="space-y-3">
        {books.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelected(b)}
            className="flex w-full gap-4 rounded-xl bg-white/[0.03] p-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.06]"
          >
            <Cover b={b} className="h-32 w-22 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{b.title}</div>
                  <div className="text-sm text-zinc-400">{b.author}</div>
                </div>
                <ScoreBadge score={b.score} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{b.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {b.genres.map((g) => (
                  <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-300">{g}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex gap-4">
              <Cover b={selected} className="h-40 w-28 shrink-0 rounded-lg" />
              <div className="min-w-0 pr-6">
                <h3 className="text-xl font-bold leading-tight">{selected.title}</h3>
                <div className="text-sm text-zinc-400">{selected.author}</div>
                <div className="mt-2"><ScoreBadge score={selected.score} /></div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.genres.map((g) => (
                    <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-300">{g}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-200">{selected.summary}</p>
            <a
              href={selected.goodreadsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            >
              View on Goodreads ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
