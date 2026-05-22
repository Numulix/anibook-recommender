import { toAniListCards, type AniListTrendingMedia, type TrendingCard } from "./trending";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const TRENDING_QUERY = `
  query ($perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
        id
        title { english romaji }
        coverImage { extraLarge large }
        genres
        seasonYear
        startDate { year }
      }
    }
  }
`;

// Top trending anime on AniList. Each item carries its own AniList id, so these
// cards are directly linkable to /anime/[id].
export async function fetchAniListTrending(perPage = 20): Promise<TrendingCard[]> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: TRENDING_QUERY, variables: { perPage } }),
  });
  if (!res.ok) throw new Error(`AniList trending request failed (${res.status})`);

  const json = (await res.json()) as { data?: { Page?: { media?: AniListTrendingMedia[] } } };
  return toAniListCards(json.data?.Page?.media ?? []);
}
