import { describe, it, expect } from "vitest";
import {
  selectRecommendations,
  matchTier,
  toMatchPercent,
  buildAnimeEmbeddingInput,
  goodreadsSearchUrl,
  type ScoredBook,
} from "./recommend";

function book(score: number, id = `b${score}`): ScoredBook {
  return {
    openLibraryId: id,
    title: `Book ${id}`,
    author: "Author",
    synopsis: "A synopsis.",
    genres: ["Fantasy"],
    coverUrl: null,
    score,
  };
}

const ids = (books: ScoredBook[]) => books.map((b) => b.openLibraryId);

describe("selectRecommendations", () => {
  it("keeps only books that clear the 50% threshold when at least 3 do", () => {
    const result = selectRecommendations([book(0.9), book(0.7), book(0.6), book(0.4), book(0.2)]);
    expect(ids(result)).toEqual(["b0.9", "b0.7", "b0.6"]);
  });

  it("returns the 10 highest-scoring matches, ordered by score, from an unsorted list", () => {
    const scores = [0.55, 0.95, 0.6, 0.99, 0.7, 0.51, 0.8, 0.65, 0.9, 0.52, 0.75, 0.85];
    const result = selectRecommendations(scores.map((s) => book(s)));
    expect(result).toHaveLength(10);
    expect(result.map((b) => b.score)).toEqual([0.99, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55]);
  });

  it("tops up with the next-closest below-threshold books when fewer than 3 clear it", () => {
    const result = selectRecommendations([book(0.8), book(0.6), book(0.45), book(0.3), book(0.1)]);
    expect(ids(result)).toEqual(["b0.8", "b0.6", "b0.45"]);
  });

  it("falls back to the 3 closest matches when none clear the threshold", () => {
    const result = selectRecommendations([book(0.49), book(0.4), book(0.35), book(0.2)]);
    expect(ids(result)).toEqual(["b0.49", "b0.4", "b0.35"]);
  });

  it("returns an empty list when there are no candidates", () => {
    expect(selectRecommendations([])).toEqual([]);
  });

  it("returns everything when fewer than 3 candidates exist, even below threshold", () => {
    const result = selectRecommendations([book(0.8), book(0.3)]);
    expect(ids(result)).toEqual(["b0.8", "b0.3"]);
  });
});

describe("matchTier", () => {
  it("is green at 75% and above", () => {
    expect(matchTier(0.75)).toBe("green");
    expect(matchTier(0.92)).toBe("green");
  });

  it("is yellow from 60% up to 74%", () => {
    expect(matchTier(0.6)).toBe("yellow");
    expect(matchTier(0.74)).toBe("yellow");
  });

  it("is orange below 60%, including loose fallbacks under 50%", () => {
    expect(matchTier(0.59)).toBe("orange");
    expect(matchTier(0.45)).toBe("orange");
  });
});

describe("toMatchPercent", () => {
  it("renders a cosine score as a rounded whole-number percent", () => {
    expect(toMatchPercent(0.9123)).toBe(91);
    expect(toMatchPercent(0.5)).toBe(50);
  });
});

describe("buildAnimeEmbeddingInput", () => {
  it("composes the genres and synopsis into one embedding input", () => {
    const input = buildAnimeEmbeddingInput({
      genres: ["Adventure", "Fantasy"],
      synopsis: "An elf mage outlives her party.",
    });
    expect(input).toBe("Genres: Adventure, Fantasy\n\nAn elf mage outlives her party.");
  });
});

describe("goodreadsSearchUrl", () => {
  it("builds a Goodreads search link from the title and author, URL-encoded", () => {
    expect(goodreadsSearchUrl("The Last Unicorn", "Peter S. Beagle")).toBe(
      "https://www.goodreads.com/search?q=The%20Last%20Unicorn%20Peter%20S.%20Beagle",
    );
  });
});
