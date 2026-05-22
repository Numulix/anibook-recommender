import { describe, it, expect } from "vitest";
import { toSearchResults } from "./search";

describe("toSearchResults", () => {
  it("maps media to results, preferring the English title and large cover", () => {
    const results = toSearchResults([
      {
        id: 154587,
        title: { english: "Frieren: Beyond Journey's End", romaji: "Sousou no Frieren" },
        coverImage: { medium: "https://img/medium.jpg", large: "https://img/large.jpg" },
      },
    ]);
    expect(results).toEqual([
      {
        anilistId: 154587,
        title: "Frieren: Beyond Journey's End",
        coverUrl: "https://img/large.jpg",
      },
    ]);
  });

  it("falls back to the romaji title and the medium cover", () => {
    const results = toSearchResults([
      {
        id: 1,
        title: { english: null, romaji: "Sousou no Frieren" },
        coverImage: { medium: "https://img/medium.jpg", large: null },
      },
    ]);
    expect(results[0]).toMatchObject({
      title: "Sousou no Frieren",
      coverUrl: "https://img/medium.jpg",
    });
  });

  it("tolerates a missing coverImage", () => {
    const results = toSearchResults([
      { id: 2, title: { english: "Some Anime", romaji: null }, coverImage: null },
    ]);
    expect(results[0].coverUrl).toBeNull();
  });

  it("drops entries that have no usable title", () => {
    const results = toSearchResults([
      { id: 3, title: { english: null, romaji: null }, coverImage: null },
    ]);
    expect(results).toEqual([]);
  });
});
