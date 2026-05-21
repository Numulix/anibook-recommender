import { describe, it, expect } from "vitest";
import { filterBook, buildEmbeddingInput } from "./filterBook";

// A 120-word synopsis, comfortably over the 100-word floor.
const longSynopsis = Array(120).fill("word").join(" ");

function qualifyingRaw(overrides = {}) {
  return {
    key: "/works/OL12345W",
    title: "The Last Unicorn",
    authors: ["Peter S. Beagle"],
    description: longSynopsis,
    subjects: ["Fantasy", "Fairy Tale"],
    firstPublishYear: 1968,
    coverId: 8231856,
    languages: ["eng"],
    ...overrides,
  };
}

describe("filterBook", () => {
  it("accepts a fully-qualifying book and returns a normalized CatalogBook", () => {
    expect(filterBook(qualifyingRaw())).toEqual({
      openLibraryId: "OL12345W",
      title: "The Last Unicorn",
      author: "Peter S. Beagle",
      synopsis: longSynopsis,
      genres: ["Fantasy", "Fairy Tale"],
      coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    });
  });

  it("rejects a book whose synopsis is under 100 words", () => {
    expect(filterBook(qualifyingRaw({ description: "A unicorn goes on a journey." }))).toBeNull();
  });

  it("rejects a book with no genres", () => {
    expect(filterBook(qualifyingRaw({ subjects: [] }))).toBeNull();
  });

  it("rejects a book published before 1900", () => {
    expect(filterBook(qualifyingRaw({ firstPublishYear: 1899 }))).toBeNull();
  });

  it("rejects manga, light novels, and comics by subject", () => {
    expect(filterBook(qualifyingRaw({ subjects: ["Fantasy", "Manga"] }))).toBeNull();
    expect(filterBook(qualifyingRaw({ subjects: ["Light novel"] }))).toBeNull();
    expect(filterBook(qualifyingRaw({ subjects: ["Graphic novel"] }))).toBeNull();
    expect(filterBook(qualifyingRaw({ subjects: ["Comics & graphic novels"] }))).toBeNull();
  });

  it("rejects a non-English book", () => {
    expect(filterBook(qualifyingRaw({ languages: ["fre"] }))).toBeNull();
  });

  it("normalizes a description given as an object to a synopsis string", () => {
    const result = filterBook(qualifyingRaw({ description: { value: longSynopsis } }));
    expect(result?.synopsis).toBe(longSynopsis);
  });

  it("strips namespaced junk subjects containing ':' or '='", () => {
    const result = filterBook(
      qualifyingRaw({ subjects: ["Fantasy", "series:Harry_Potter", "nyt:trade-fiction=2024-09-15", "collectionID:YDark"] })
    );
    expect(result?.genres).toEqual(["Fantasy"]);
  });

  it("strips blocklisted non-genre noise phrases (case-insensitive)", () => {
    const result = filterBook(
      qualifyingRaw({ subjects: ["Fantasy", "New York Times bestseller", "accessible book", "Protected DAISY"] })
    );
    expect(result?.genres).toEqual(["Fantasy"]);
  });

  it("dedupes genres differing only by case, keeping the first casing", () => {
    const result = filterBook(qualifyingRaw({ subjects: ["Fantasy", "fantasy", "FANTASY", "Magic"] }));
    expect(result?.genres).toEqual(["Fantasy", "Magic"]);
  });

  it("caps genres at 6", () => {
    const result = filterBook(
      qualifyingRaw({ subjects: ["Fantasy", "Adventure", "Magic", "Epic", "Quest", "Dragons", "Heroes", "Myth"] })
    );
    expect(result?.genres).toEqual(["Fantasy", "Adventure", "Magic", "Epic", "Quest", "Dragons"]);
  });

  it("rejects a book whose subjects are all junk", () => {
    expect(filterBook(qualifyingRaw({ subjects: ["series:Harry_Potter", "nyt:list=2024"] }))).toBeNull();
  });
});

describe("buildEmbeddingInput", () => {
  it("combines title, genres, and synopsis into one text blob", () => {
    const input = buildEmbeddingInput({
      openLibraryId: "OL1W",
      title: "The Last Unicorn",
      author: "Peter S. Beagle",
      synopsis: "A unicorn's journey.",
      genres: ["Fantasy", "Fairy Tale"],
      coverUrl: null,
    });
    expect(input).toBe("The Last Unicorn\n\nGenres: Fantasy, Fairy Tale\n\nA unicorn's journey.");
  });
});
