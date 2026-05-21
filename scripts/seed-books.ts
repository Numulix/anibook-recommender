// Seeds the curated book catalog: Open Library -> filter -> embed -> Supabase.
// Run a small test first:  npm run seed -- --limit=20
// Full run (slow):         npm run seed -- --limit=20000
import { filterBook, buildEmbeddingInput, type CatalogBook } from "../src/lib/seed/filterBook";
import { fetchCandidates, fetchWorkDescription, toRawBook, sleep } from "../src/lib/seed/openLibrary";
import { embedInBatches } from "../src/lib/seed/embed";
import { upsertBooks, type EmbeddedBook } from "../src/lib/seed/booksRepo";

process.loadEnvFile(".env.local");

const SUBJECTS = [
  "fantasy",
  "science_fiction",
  "mystery",
  "romance",
  "thriller",
  "historical_fiction",
  "horror",
  "adventure",
];

const PAGE_SIZE = 100;
const DESCRIPTION_DELAY_MS = 150; // be polite to Open Library

function parseLimit(): number {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  const n = arg ? parseInt(arg.split("=")[1], 10) : 25;
  return Number.isFinite(n) && n > 0 ? n : 25;
}

async function collect(limit: number): Promise<CatalogBook[]> {
  const books: CatalogBook[] = [];
  const seen = new Set<string>();

  for (const subject of SUBJECTS) {
    if (books.length >= limit) break;
    console.log(`\nSubject: ${subject}`);
    let offset = 0;

    while (books.length < limit) {
      const docs = await fetchCandidates(subject, PAGE_SIZE, offset);
      if (docs.length === 0) break;

      for (const doc of docs) {
        if (books.length >= limit) break;
        if (seen.has(doc.key)) continue;
        seen.add(doc.key);

        const description = await fetchWorkDescription(doc.key);
        await sleep(DESCRIPTION_DELAY_MS);

        const book = filterBook(toRawBook(doc, description));
        if (book) {
          books.push(book);
          console.log(`  + [${books.length}/${limit}] ${book.title} — ${book.author}`);
        }
      }
      offset += PAGE_SIZE;
    }
  }
  return books;
}

async function main() {
  const limit = parseLimit();
  console.log(`Seeding up to ${limit} books...`);

  const books = await collect(limit);
  console.log(`\nCollected ${books.length} qualifying books. Embedding...`);

  const embeddings = await embedInBatches(books.map(buildEmbeddingInput));
  const embedded: EmbeddedBook[] = books.map((b, i) => ({ ...b, embedding: embeddings[i] }));

  console.log(`Upserting ${embedded.length} books into Supabase...`);
  await upsertBooks(embedded);

  console.log(`\nDone. Seeded ${embedded.length} books.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
