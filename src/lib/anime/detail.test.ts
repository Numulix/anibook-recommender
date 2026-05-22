import { describe, it, expect } from "vitest";
import {
  formatMalRating,
  formatAnilistRating,
  formatStudiosYear,
  shouldClampSynopsis,
} from "./detail";

describe("formatMalRating", () => {
  it("formats a MAL mean to one decimal place", () => {
    expect(formatMalRating(8.51)).toBe("8.5");
  });

  it("shows an em dash when the rating is missing", () => {
    expect(formatMalRating(null)).toBe("—");
  });
});

describe("formatAnilistRating", () => {
  it("shows the AniList score as a whole-number percent", () => {
    expect(formatAnilistRating(90)).toBe("90%");
  });

  it("shows an em dash when the score is missing", () => {
    expect(formatAnilistRating(null)).toBe("—");
  });
});

describe("formatStudiosYear", () => {
  it("joins studios and appends the year with a middot", () => {
    expect(formatStudiosYear(["Madhouse"], 2023)).toBe("Madhouse · 2023");
  });

  it("comma-separates multiple studios", () => {
    expect(formatStudiosYear(["Madhouse", "Bones"], 2023)).toBe("Madhouse, Bones · 2023");
  });

  it("omits the year when it is missing", () => {
    expect(formatStudiosYear(["Madhouse"], null)).toBe("Madhouse");
  });

  it("shows only the year when there are no studios", () => {
    expect(formatStudiosYear([], 2023)).toBe("2023");
  });

  it("returns an empty string when nothing is known", () => {
    expect(formatStudiosYear([], null)).toBe("");
  });
});

describe("shouldClampSynopsis", () => {
  it("clamps a synopsis long enough to need a toggle", () => {
    expect(shouldClampSynopsis("x".repeat(400))).toBe(true);
  });

  it("does not clamp a short synopsis", () => {
    expect(shouldClampSynopsis("A brief blurb.")).toBe(false);
  });

  it("ignores surrounding whitespace when measuring", () => {
    expect(shouldClampSynopsis("  short  ")).toBe(false);
  });

  it("does not clamp an empty synopsis", () => {
    expect(shouldClampSynopsis("")).toBe(false);
  });
});
