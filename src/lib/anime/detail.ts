// Presentation helpers for the anime detail page. Pure and framework-free so
// the rating/synopsis display rules can be unit-tested independently of render.

// MAL ratings are a 0–10 mean; we show one decimal (e.g. 8.5).
export function formatMalRating(rating: number | null): string {
  return rating == null ? "—" : rating.toFixed(1);
}

// AniList averageScore is a 0–100 integer; we render it as a percent.
export function formatAnilistRating(rating: number | null): string {
  return rating == null ? "—" : `${rating}%`;
}

// The hero meta line: comma-joined studios, then the year after a middot.
// Each part is dropped when absent, so an empty result is possible.
export function formatStudiosYear(studios: string[], year: number | null): string {
  const studioPart = studios.join(", ");
  const yearPart = year == null ? "" : String(year);
  return [studioPart, yearPart].filter(Boolean).join(" · ");
}

// Roughly four lines of prose at the detail page's column width. Above this we
// clamp the synopsis and offer a Show more/less toggle; below it the full text
// fits, so no toggle is shown.
const SYNOPSIS_CLAMP_CHARS = 300;

export function shouldClampSynopsis(text: string): boolean {
  return text.trim().length > SYNOPSIS_CLAMP_CHARS;
}
