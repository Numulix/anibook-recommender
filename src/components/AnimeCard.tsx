import Link from "next/link";
import type { TrendingCard } from "@/lib/anime/trending";

// Deterministic gradient used as a cover-art fallback when no image is available.
function coverGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `linear-gradient(135deg, hsl(${h} 55% 38%), hsl(${(h + 40) % 360} 60% 22%))`;
}

// A trending anime poster card linking to its detail page. Plain <img> (not
// next/image) keeps us off a remote-host allowlist for arbitrary cover CDNs;
// optimization can come later.
export function AnimeCard({ card }: { card: TrendingCard }) {
  const subtitle = [card.genres[0], card.year].filter(Boolean).join(" · ");
  return (
    <Link href={`/anime/${card.anilistId}`} className="group w-40 shrink-0">
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-white/10 transition group-hover:ring-white/30">
        {card.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.coverUrl}
            alt={card.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-end p-2" style={{ background: coverGradient(String(card.anilistId)) }}>
            <span className="text-xs font-bold leading-tight text-white/90 drop-shadow">{card.title}</span>
          </div>
        )}
      </div>
      <div className="mt-2 truncate text-sm font-medium">{card.title}</div>
      {subtitle && <div className="truncate text-xs text-zinc-400">{subtitle}</div>}
    </Link>
  );
}
