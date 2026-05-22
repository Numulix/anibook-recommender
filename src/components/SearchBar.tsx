"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AnimeSearchResult } from "@/lib/anime/search";

const DEBOUNCE_MS = 300;

// Global header search. Debounces input before querying /api/anime/search,
// shows an autocomplete dropdown, and navigates to the detail page on select.
// AniList handles fuzzy/typo tolerance server-side, so this stays presentation-only.
export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  // The trimmed query the current `results` correspond to. When it lags behind
  // `query`, a search is pending — which is how we tell "searching" from "no
  // results" without a separate loading flag (and avoids an empty-state flash).
  const [resultsFor, setResultsFor] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // highlighted result index for keyboard nav
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search. A fresh AbortController per keystroke cancels in-flight
  // requests so a slow earlier response can't overwrite a newer one.
  useEffect(() => {
    const q = query.trim();
    if (!q) return; // dropdown is hidden for an empty query; nothing to fetch

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { results?: AnimeSearchResult[] };
        setResults(data.results ?? []);
        setResultsFor(q);
        setActive(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
          setResultsFor(q);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close the dropdown when clicking anywhere outside the search box.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function select(id: number) {
    setOpen(false);
    setQuery("");
    setResults([]);
    setResultsFor("");
    setActive(-1);
    router.push(`/anime/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      e.currentTarget.blur();
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      select(results[active].anilistId);
    }
  }

  const q = query.trim();
  const showDropdown = open && q.length > 0;
  const searching = resultsFor !== q; // a request is debouncing or in flight

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          // Drop the previous query's results so they don't linger under a new
          // search; the dropdown shows "Searching…" until fresh ones arrive.
          setResults([]);
          setResultsFor("");
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search anime…"
        aria-label="Search anime"
        autoComplete="off"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-white/30"
      />

      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-xl">
          {results.length > 0 ? (
            <ul>
              {results.map((r, i) => (
                <li key={r.anilistId}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(r.anilistId)}
                    className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left ${
                      i === active ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="h-12 w-8 shrink-0 overflow-hidden rounded bg-zinc-800">
                      {r.coverUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.coverUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>
                    <span className="truncate text-sm">{r.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-3 text-sm text-zinc-400">
              {searching ? "Searching…" : "No anime found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
