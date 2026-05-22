import type { MalSource } from "./types";

// MAL's public endpoints authenticate with a client id sent as a header.
function clientId(): string {
  const id = process.env.MAL_CLIENT_ID;
  if (!id) throw new Error("Missing MAL_CLIENT_ID");
  return id;
}

type MalAnime = { id: number; mean?: number };

// Fetches a single anime's community rating from MAL by its MAL id. The "mean"
// field is what we surface as the MAL rating (out of 10); MAL omits it for
// unrated titles, in which case malRating is null.
export async function fetchMalById(malId: number): Promise<MalSource> {
  const url = `https://api.myanimelist.net/v2/anime/${malId}?fields=mean`;
  const res = await fetch(url, { headers: { "X-MAL-CLIENT-ID": clientId() } });
  if (!res.ok) throw new Error(`MAL request failed (${res.status}) for id=${malId}`);

  const data = (await res.json()) as MalAnime;
  return { malId, malRating: data.mean ?? null };
}
