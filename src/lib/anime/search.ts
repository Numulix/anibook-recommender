const ANILIST_ENDPOINT = "https://graphql.anilist.co";

// SEARCH_MATCH ordering lets AniList rank by relevance and absorb typos
// server-side, which is exactly the fuzzy behaviour we want for autocomplete.
const SEARCH_QUERY = `
  query ($search: String, $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH, isAdult: false) {
        id
        title { english romaji }
        coverImage { medium large }
      }
    }
  }
`;

type AniListSearchMedia = {
  id: number;
  title: { english: string | null; romaji: string | null };
  coverImage: { medium: string | null; large: string | null } | null;
};

// A single autocomplete suggestion. Minimal by design: the dropdown only needs
// to render a thumbnail + title and link to /anime/[anilistId].
export type AnimeSearchResult = {
  anilistId: number;
  title: string;
  coverUrl: string | null;
};

export function toSearchResults(media: AniListSearchMedia[]): AnimeSearchResult[] {
  return media
    .filter((m) => m.title.english || m.title.romaji)
    .map((m) => ({
      anilistId: m.id,
      title: m.title.english ?? m.title.romaji ?? "",
      coverUrl: m.coverImage?.large ?? m.coverImage?.medium ?? null,
    }));
}

// Live anime search against AniList GraphQL. Returns up to `perPage` results
// ordered by relevance; an empty/whitespace query short-circuits to no results.
export async function searchAniList(query: string, perPage = 8): Promise<AnimeSearchResult[]> {
  const search = query.trim();
  if (!search) return [];

  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: SEARCH_QUERY, variables: { search, perPage } }),
  });
  if (!res.ok) throw new Error(`AniList search request failed (${res.status}) for q=${search}`);

  const json = (await res.json()) as { data?: { Page?: { media?: AniListSearchMedia[] } } };
  return toSearchResults(json.data?.Page?.media ?? []);
}
