import { toMalCards, type MalRankingNode, type TrendingCard } from "./trending";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const MAL_RANKING_FIELDS = "title,main_picture,genres,start_season";

function clientId(): string {
  const id = process.env.MAL_CLIENT_ID;
  if (!id) throw new Error("Missing MAL_CLIENT_ID");
  return id;
}

// MAL's "airing" ranking — the closest analogue to AniList's trending: the
// currently-airing anime ranked by community score.
async function fetchMalRanking(limit: number): Promise<MalRankingNode[]> {
  const url =
    `https://api.myanimelist.net/v2/anime/ranking?ranking_type=airing` +
    `&limit=${limit}&fields=${MAL_RANKING_FIELDS}`;
  const res = await fetch(url, { headers: { "X-MAL-CLIENT-ID": clientId() } });
  if (!res.ok) throw new Error(`MAL ranking request failed (${res.status})`);

  const data = (await res.json()) as { data?: { node: MalRankingNode }[] };
  return (data.data ?? []).map((d) => d.node);
}

// Resolves MAL ids -> AniList ids in a single aliased GraphQL request, so MAL
// cards can link to our AniList-keyed detail route. Unmatched ids are simply
// absent from the map (and their cards get dropped downstream).
async function resolveAniListIds(malIds: number[]): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (malIds.length === 0) return map;

  const aliases = malIds
    .map((id, i) => `m${i}: Media(idMal: ${id}, type: ANIME) { id idMal }`)
    .join("\n");
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: `query {\n${aliases}\n}` }),
  });
  if (!res.ok) throw new Error(`AniList id resolution failed (${res.status})`);

  // GraphQL returns null for any unresolved alias plus an `errors` array; the
  // resolved aliases still come through in `data`, so we just skip the nulls.
  const json = (await res.json()) as {
    data?: Record<string, { id: number; idMal: number | null } | null>;
  };
  for (const node of Object.values(json.data ?? {})) {
    if (node?.idMal != null) map.set(node.idMal, node.id);
  }
  return map;
}

export async function fetchMalTrending(limit = 20): Promise<TrendingCard[]> {
  const nodes = await fetchMalRanking(limit);
  const idMap = await resolveAniListIds(nodes.map((n) => n.id));
  return toMalCards(nodes, idMap);
}
