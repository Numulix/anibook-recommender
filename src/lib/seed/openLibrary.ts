import type { RawOpenLibraryBook } from "./filterBook";

const UA = "anibook-recommender/0.1 (jbabic999@gmail.com)";
const SEARCH_FIELDS = ["key", "title", "author_name", "first_publish_year", "subject", "language", "cover_i"].join(",");

export type SearchDoc = {
  key: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
  language?: string[];
  cover_i?: number;
};

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// One page of works for a subject, English-only, popularity-sorted (popular
// works are far more likely to carry a usable description).
export async function fetchCandidates(subject: string, limit: number, offset: number): Promise<SearchDoc[]> {
  const url =
    `https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}` +
    `&language=eng&sort=readinglog&fields=${SEARCH_FIELDS}&limit=${limit}&offset=${offset}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Open Library search failed (${res.status}) for subject=${subject}`);
  const data = (await res.json()) as { docs?: SearchDoc[] };
  return data.docs ?? [];
}

// Descriptions are not in search results — fetch them per work.
export async function fetchWorkDescription(workKey: string): Promise<string | { value: string } | undefined> {
  const res = await fetch(`https://openlibrary.org${workKey}.json`, { headers: { "User-Agent": UA } });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { description?: string | { value: string } };
  return data.description;
}

export function toRawBook(doc: SearchDoc, description: string | { value: string } | undefined): RawOpenLibraryBook {
  return {
    key: doc.key,
    title: doc.title,
    authors: doc.author_name,
    description,
    subjects: (doc.subject ?? []).slice(0, 8),
    firstPublishYear: doc.first_publish_year,
    coverId: doc.cover_i,
    languages: doc.language,
  };
}
