import type { AniListSource } from "./types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const MEDIA_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title { english romaji }
      description(asHtml: false)
      genres
      averageScore
      seasonYear
      startDate { year }
      episodes
      status
      coverImage { extraLarge large }
      studios(isMain: true) { nodes { name } }
    }
  }
`;

type AniListMedia = {
  id: number;
  idMal: number | null;
  title: { english: string | null; romaji: string | null };
  description: string | null;
  genres: string[] | null;
  averageScore: number | null;
  seasonYear: number | null;
  startDate: { year: number | null } | null;
  episodes: number | null;
  status: string | null;
  coverImage: { extraLarge: string | null; large: string | null } | null;
  studios: { nodes: { name: string }[] } | null;
};

// AniList descriptions come back with light HTML (<br>, <i>, …) even with
// asHtml:false. Strip tags and collapse the resulting whitespace.
function stripHtml(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toSource(media: AniListMedia): AniListSource {
  return {
    anilistId: media.id,
    malId: media.idMal,
    title: media.title.english ?? media.title.romaji ?? "",
    synopsis: stripHtml(media.description),
    genres: media.genres ?? [],
    coverUrl: media.coverImage?.extraLarge ?? media.coverImage?.large ?? null,
    anilistRating: media.averageScore,
    studios: media.studios?.nodes.map((n) => n.name) ?? [],
    year: media.seasonYear ?? media.startDate?.year ?? null,
    episodeCount: media.episodes,
    status: media.status,
  };
}

// Fetches a single anime from AniList by its AniList id. Returns null when the
// id is unknown so callers can return a clean 404.
export async function fetchAniListById(anilistId: number): Promise<AniListSource | null> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: MEDIA_QUERY, variables: { id: anilistId } }),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`AniList request failed (${res.status}) for id=${anilistId}`);

  const json = (await res.json()) as { data?: { Media: AniListMedia | null }; errors?: unknown };
  const media = json.data?.Media;
  if (!media) return null;

  return toSource(media);
}
