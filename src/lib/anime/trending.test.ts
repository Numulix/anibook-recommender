import { describe, it, expect } from "vitest";
import {
  toAniListCards,
  toMalCards,
  dedupeByAnilistId,
  type AniListTrendingMedia,
  type MalRankingNode,
} from "./trending";

describe("toAniListCards", () => {
  const media: AniListTrendingMedia = {
    id: 154587,
    title: { english: "Frieren: Beyond Journey's End", romaji: "Sousou no Frieren" },
    coverImage: { large: "https://img/frieren.jpg", extraLarge: null },
    genres: ["Adventure", "Drama", "Fantasy"],
    seasonYear: 2023,
    startDate: { year: 2023 },
  };

  it("maps an AniList media item to a card keyed by its AniList id", () => {
    expect(toAniListCards([media])).toEqual([
      {
        anilistId: 154587,
        title: "Frieren: Beyond Journey's End",
        coverUrl: "https://img/frieren.jpg",
        genres: ["Adventure", "Drama", "Fantasy"],
        year: 2023,
      },
    ]);
  });

  it("falls back to the romaji title when there is no English title", () => {
    const card = toAniListCards([{ ...media, title: { english: null, romaji: "Sousou no Frieren" } }])[0];
    expect(card.title).toBe("Sousou no Frieren");
  });

  it("falls back to startDate.year when seasonYear is missing, else null", () => {
    expect(toAniListCards([{ ...media, seasonYear: null }])[0].year).toBe(2023);
    expect(toAniListCards([{ ...media, seasonYear: null, startDate: null }])[0].year).toBeNull();
  });

  it("tolerates missing cover and genres", () => {
    const card = toAniListCards([{ ...media, coverImage: null, genres: null }])[0];
    expect(card.coverUrl).toBeNull();
    expect(card.genres).toEqual([]);
  });
});

describe("toMalCards", () => {
  const node: MalRankingNode = {
    id: 52991,
    title: "Sousou no Frieren",
    main_picture: { medium: "https://mal/med.jpg", large: "https://mal/large.jpg" },
    genres: [{ id: 2, name: "Adventure" }, { id: 8, name: "Drama" }],
    start_season: { year: 2023, season: "fall" },
  };

  it("maps a MAL node to a card, resolving the AniList id from the map", () => {
    const idMap = new Map<number, number>([[52991, 154587]]);
    expect(toMalCards([node], idMap)).toEqual([
      {
        anilistId: 154587,
        title: "Sousou no Frieren",
        coverUrl: "https://mal/large.jpg",
        genres: ["Adventure", "Drama"],
        year: 2023,
      },
    ]);
  });

  it("drops nodes whose MAL id has no AniList mapping (unlinkable)", () => {
    const idMap = new Map<number, number>(); // no entry for 52991
    expect(toMalCards([node], idMap)).toEqual([]);
  });

  it("prefers the large cover but falls back to medium", () => {
    const idMap = new Map<number, number>([[52991, 154587]]);
    const card = toMalCards([{ ...node, main_picture: { medium: "https://mal/med.jpg" } }], idMap)[0];
    expect(card.coverUrl).toBe("https://mal/med.jpg");
  });

  it("tolerates missing season and picture", () => {
    const idMap = new Map<number, number>([[52991, 154587]]);
    const card = toMalCards([{ ...node, main_picture: null, start_season: null, genres: null }], idMap)[0];
    expect(card).toMatchObject({ coverUrl: null, year: null, genres: [] });
  });
});

describe("dedupeByAnilistId", () => {
  it("keeps the first occurrence of each AniList id", () => {
    const cards = [
      { anilistId: 1, title: "A", coverUrl: null, genres: [], year: null },
      { anilistId: 1, title: "A dup", coverUrl: null, genres: [], year: null },
      { anilistId: 2, title: "B", coverUrl: null, genres: [], year: null },
    ];
    expect(dedupeByAnilistId(cards).map((c) => c.title)).toEqual(["A", "B"]);
  });
});
