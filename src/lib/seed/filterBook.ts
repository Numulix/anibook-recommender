export type RawOpenLibraryBook = {
  key: string;
  title?: string;
  authors?: string[];
  description?: string | { value: string };
  subjects?: string[];
  firstPublishYear?: number;
  coverId?: number;
  languages?: string[];
};

export type CatalogBook = {
  openLibraryId: string;
  title: string;
  author: string;
  synopsis: string;
  genres: string[];
  coverUrl: string | null;
};

const EXCLUDED_FORMATS = ["manga", "light novel", "graphic novel", "comic"];

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const GENRE_BLOCKLIST = new Set([
  "new york times bestseller",
  "accessible book",
  "protected daisy",
  "in library",
  "large type books",
]);

function cleanGenres(subjects: string[]): string[] {
  const kept: string[] = [];
  const seen = new Set<string>();
  for (const s of subjects) {
    if (s.includes(":") || s.includes("=") || GENRE_BLOCKLIST.has(s.toLowerCase())) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(s);
  }
  return kept.slice(0, 6);
}

export function buildEmbeddingInput(book: CatalogBook): string {
  return `${book.title}\n\nGenres: ${book.genres.join(", ")}\n\n${book.synopsis}`;
}

export function filterBook(raw: RawOpenLibraryBook): CatalogBook | null {
  const synopsis = typeof raw.description === "string" ? raw.description : raw.description?.value ?? "";

  if (wordCount(synopsis) < 100) return null;

  const genres = cleanGenres(raw.subjects ?? []);
  if (genres.length === 0) return null;

  if (genres.some((g) => EXCLUDED_FORMATS.some((f) => g.toLowerCase().includes(f)))) return null;

  if ((raw.firstPublishYear ?? 0) < 1900) return null;

  if (raw.languages && !raw.languages.includes("eng")) return null;

  return {
    openLibraryId: raw.key.replace("/works/", ""),
    title: raw.title ?? "",
    author: (raw.authors ?? []).join(", "),
    synopsis,
    genres,
    coverUrl: raw.coverId ? `https://covers.openlibrary.org/b/id/${raw.coverId}-L.jpg` : null,
  };
}
