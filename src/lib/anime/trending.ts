// Trending homepage data: a minimal card per anime, split into two
// source rows (MAL, AniList). Cards link to /anime/[anilistId], so every card
// must carry an AniList id — for MAL-sourced cards that id is resolved from the
// MAL id via a lookup map built by the client.

export type TrendingCard = {
  anilistId: number;
  title: string;
  coverUrl: string | null;
  genres: string[];
  year: number | null;
};

export type TrendingPayload = { mal: TrendingCard[]; anilist: TrendingCard[] };

// Raw shapes, narrowed to the fields the card needs.
export type AniListTrendingMedia = {
  id: number;
  title: { english: string | null; romaji: string | null };
  coverImage: { large: string | null; extraLarge?: string | null } | null;
  genres: string[] | null;
  seasonYear: number | null;
  startDate: { year: number | null } | null;
};

export type MalRankingNode = {
  id: number;
  title: string;
  main_picture?: { medium?: string; large?: string } | null;
  genres?: { id: number; name: string }[] | null;
  start_season?: { year: number; season: string } | null;
};

export function toAniListCards(media: AniListTrendingMedia[]): TrendingCard[] {
  return media.map((m) => ({
    anilistId: m.id,
    title: m.title.english ?? m.title.romaji ?? "",
    coverUrl: m.coverImage?.extraLarge ?? m.coverImage?.large ?? null,
    genres: m.genres ?? [],
    year: m.seasonYear ?? m.startDate?.year ?? null,
  }));
}

// Maps MAL ranking nodes to cards, resolving each node's AniList id from the
// supplied map (keyed by MAL id). Nodes with no mapping are dropped, since a
// card with no AniList id cannot link to a detail page.
export function toMalCards(nodes: MalRankingNode[], idMap: Map<number, number>): TrendingCard[] {
  const cards: TrendingCard[] = [];
  for (const n of nodes) {
    const anilistId = idMap.get(n.id);
    if (anilistId == null) continue;
    cards.push({
      anilistId,
      title: n.title,
      coverUrl: n.main_picture?.large ?? n.main_picture?.medium ?? null,
      genres: (n.genres ?? []).map((g) => g.name),
      year: n.start_season?.year ?? null,
    });
  }
  return cards;
}

export function dedupeByAnilistId(cards: TrendingCard[]): TrendingCard[] {
  const seen = new Set<number>();
  return cards.filter((c) => (seen.has(c.anilistId) ? false : (seen.add(c.anilistId), true)));
}
