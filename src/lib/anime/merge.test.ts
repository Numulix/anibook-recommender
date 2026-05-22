import { describe, it, expect } from "vitest";
import { mergeAnime, isStale, CACHE_TTL_HOURS } from "./merge";
import type { AniListSource, MalSource } from "./types";

function anilistSource(overrides: Partial<AniListSource> = {}): AniListSource {
  return {
    anilistId: 154587,
    malId: 52991,
    title: "Frieren: Beyond Journey's End",
    synopsis: "The elf mage Frieren outlives her party and sets out anew.",
    genres: ["Adventure", "Drama", "Fantasy"],
    coverUrl: "https://img.anili.st/frieren.jpg",
    anilistRating: 90,
    studios: ["Madhouse"],
    year: 2023,
    episodeCount: 28,
    status: "FINISHED",
    ...overrides,
  };
}

describe("mergeAnime", () => {
  it("merges AniList data with the MAL rating into the unified shape", () => {
    const mal: MalSource = { malId: 52991, malRating: 9.3 };
    expect(mergeAnime(anilistSource(), mal)).toEqual({
      anilistId: 154587,
      malId: 52991,
      title: "Frieren: Beyond Journey's End",
      synopsis: "The elf mage Frieren outlives her party and sets out anew.",
      genres: ["Adventure", "Drama", "Fantasy"],
      coverUrl: "https://img.anili.st/frieren.jpg",
      malRating: 9.3,
      anilistRating: 90,
      studios: ["Madhouse"],
      year: 2023,
      episodeCount: 28,
      status: "FINISHED",
    });
  });

  it("fills malRating with null when MAL data is absent", () => {
    const result = mergeAnime(anilistSource(), null);
    expect(result.malRating).toBeNull();
    // Everything else still comes from AniList.
    expect(result.anilistRating).toBe(90);
    expect(result.title).toBe("Frieren: Beyond Journey's End");
  });

  it("keeps malId from AniList even when the MAL lookup is skipped", () => {
    const result = mergeAnime(anilistSource({ malId: 52991 }), null);
    expect(result.malId).toBe(52991);
  });

  it("yields a null malId when AniList has no idMal", () => {
    const result = mergeAnime(anilistSource({ malId: null }), null);
    expect(result.malId).toBeNull();
  });

  it("carries a null MAL mean through as a null rating", () => {
    const mal: MalSource = { malId: 52991, malRating: null };
    expect(mergeAnime(anilistSource(), mal).malRating).toBeNull();
  });

  it("passes through missing AniList optional fields as nulls/empties without throwing", () => {
    const result = mergeAnime(
      anilistSource({
        coverUrl: null,
        anilistRating: null,
        year: null,
        episodeCount: null,
        status: null,
        genres: [],
        studios: [],
      }),
      null,
    );
    expect(result).toMatchObject({
      coverUrl: null,
      anilistRating: null,
      malRating: null,
      year: null,
      episodeCount: null,
      status: null,
      genres: [],
      studios: [],
    });
  });
});

describe("isStale", () => {
  const cachedAt = "2026-05-22T12:00:00.000Z";

  it("returns false when the cache is within the TTL window", () => {
    const oneHourLater = new Date("2026-05-22T13:00:00.000Z");
    expect(isStale(cachedAt, oneHourLater)).toBe(false);
  });

  it("returns true once the cache is older than the TTL", () => {
    const wellPastTtl = new Date("2026-05-25T12:00:00.000Z");
    expect(isStale(cachedAt, wellPastTtl)).toBe(true);
  });

  it("treats the exact TTL boundary as fresh", () => {
    const atBoundary = new Date(
      new Date(cachedAt).getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000,
    );
    expect(isStale(cachedAt, atBoundary)).toBe(false);
  });

  it("accepts a Date for cachedAt as well as a string", () => {
    const fresh = new Date("2026-05-22T13:00:00.000Z");
    expect(isStale(new Date(cachedAt), fresh)).toBe(false);
  });
});
