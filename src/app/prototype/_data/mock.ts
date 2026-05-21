// PROTOTYPE mock data — throwaway. Delete when the UI direction is chosen.
// Stands in for the cached anime shape (#003) and recommendation shape (#007).

export type Source = "MAL" | "AniList";

export type TrendingAnime = {
  id: string;
  title: string;
  malRating: number; // out of 10
  anilistRating: number; // out of 100
  genres: string[];
  year: number;
  sources: Source[];
};

export type AnimeDetail = TrendingAnime & {
  synopsis: string;
  studios: string[];
};

export type BookMatch = {
  id: string;
  title: string;
  author: string;
  genres: string[];
  summary: string;
  score: number; // 0..1 cosine similarity
  goodreadsUrl: string;
};

// A deterministic gradient placeholder for cover art (no external image deps).
export function coverGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const h2 = (h + 40) % 360;
  return `linear-gradient(135deg, hsl(${h} 55% 38%), hsl(${h2} 60% 22%))`;
}

export const animeDetail: AnimeDetail = {
  id: "frieren",
  title: "Frieren: Beyond Journey's End",
  malRating: 9.3,
  anilistRating: 90,
  genres: ["Adventure", "Drama", "Fantasy"],
  year: 2023,
  sources: ["MAL", "AniList"],
  studios: ["Madhouse"],
  synopsis:
    "The elf mage Frieren was part of the hero's party that defeated the Demon King and brought peace to the land. Frieren and her companions then went their separate ways to live out their remaining days. But the immortal Frieren outlives the rest of her party, and a half-century later she sets out on a new journey to understand the humans she once travelled beside — confronting the meaning of memory, mortality, and the connections that outlast a single lifetime. Along the way she takes on an apprentice and retraces the route of her old adventure, finding that the world she helped save has quietly changed without her.",
};

export const trending: TrendingAnime[] = [
  { id: "frieren", title: "Frieren: Beyond Journey's End", malRating: 9.3, anilistRating: 90, genres: ["Adventure", "Drama", "Fantasy"], year: 2023, sources: ["MAL", "AniList"] },
  { id: "fmab", title: "Fullmetal Alchemist: Brotherhood", malRating: 9.1, anilistRating: 89, genres: ["Action", "Adventure", "Drama"], year: 2009, sources: ["MAL", "AniList"] },
  { id: "steinsgate", title: "Steins;Gate", malRating: 9.0, anilistRating: 88, genres: ["Sci-Fi", "Thriller"], year: 2011, sources: ["MAL", "AniList"] },
  { id: "vinland", title: "Vinland Saga", malRating: 8.7, anilistRating: 85, genres: ["Action", "Adventure", "Drama"], year: 2019, sources: ["MAL", "AniList"] },
  { id: "mushishi", title: "Mushishi", malRating: 8.7, anilistRating: 84, genres: ["Adventure", "Mystery", "Slice of Life"], year: 2005, sources: ["MAL"] },
  { id: "monster", title: "Monster", malRating: 8.8, anilistRating: 86, genres: ["Drama", "Mystery", "Thriller"], year: 2004, sources: ["MAL", "AniList"] },
  { id: "violet", title: "Violet Evergarden", malRating: 8.6, anilistRating: 85, genres: ["Drama", "Fantasy", "Slice of Life"], year: 2018, sources: ["AniList"] },
  { id: "madoka", title: "Puella Magi Madoka Magica", malRating: 8.4, anilistRating: 83, genres: ["Drama", "Fantasy", "Thriller"], year: 2011, sources: ["MAL", "AniList"] },
  { id: "odd-taxi", title: "Odd Taxi", malRating: 8.7, anilistRating: 84, genres: ["Drama", "Mystery"], year: 2021, sources: ["AniList"] },
  { id: "dorohedoro", title: "Dorohedoro", malRating: 8.1, anilistRating: 80, genres: ["Action", "Comedy", "Horror"], year: 2020, sources: ["MAL"] },
  { id: "ping-pong", title: "Ping Pong the Animation", malRating: 8.4, anilistRating: 82, genres: ["Drama", "Sports"], year: 2014, sources: ["AniList"] },
  { id: "made-abyss", title: "Made in Abyss", malRating: 8.6, anilistRating: 84, genres: ["Adventure", "Drama", "Fantasy"], year: 2017, sources: ["MAL", "AniList"] },
];

function goodreads(title: string, author: string): string {
  return `https://www.goodreads.com/search?q=${encodeURIComponent(`${title} ${author}`)}`;
}

export const recommendations: BookMatch[] = [
  { id: "last-unicorn", title: "The Last Unicorn", author: "Peter S. Beagle", genres: ["Fantasy", "Fairy Tale"], score: 0.91, summary: "An immortal unicorn learns she may be the last of her kind and leaves her forest to find the others, accompanied by a bumbling magician — a meditation on time, loss, and what it costs to feel mortal things.", goodreadsUrl: goodreads("The Last Unicorn", "Peter S. Beagle") },
  { id: "tehanu", title: "Tehanu", author: "Ursula K. Le Guin", genres: ["Fantasy"], score: 0.88, summary: "Years after her adventures, a former priestess lives a quiet life until a burned child and a powerless former mage re-enter her world, in a story about aging, ordinary life, and quiet power.", goodreadsUrl: goodreads("Tehanu", "Ursula K. Le Guin") },
  { id: "buried-giant", title: "The Buried Giant", author: "Kazuo Ishiguro", genres: ["Fantasy", "Literary"], score: 0.84, summary: "An elderly couple journeys across a mist-shrouded post-Arthurian Britain where a strange amnesia has settled over the land, searching for a son they can barely remember.", goodreadsUrl: goodreads("The Buried Giant", "Kazuo Ishiguro") },
  { id: "uprooted", title: "Uprooted", author: "Naomi Novik", genres: ["Fantasy"], score: 0.79, summary: "A young woman is taken by a cold wizard to help hold back a corrupted, malevolent forest, discovering her own wild magic in the process.", goodreadsUrl: goodreads("Uprooted", "Naomi Novik") },
  { id: "hobbit", title: "The Hobbit", author: "J.R.R. Tolkien", genres: ["Fantasy", "Adventure"], score: 0.72, summary: "A comfort-loving hobbit is swept into a quest with thirteen dwarves to reclaim a treasure guarded by a dragon, growing into unexpected courage along the road.", goodreadsUrl: goodreads("The Hobbit", "J.R.R. Tolkien") },
  { id: "piranesi", title: "Piranesi", author: "Susanna Clarke", genres: ["Fantasy", "Mystery"], score: 0.68, summary: "A man lives alone in an infinite house of statues and tides, keeping careful journals, until evidence emerges that his reality is not what it seems.", goodreadsUrl: goodreads("Piranesi", "Susanna Clarke") },
  { id: "earthsea", title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", genres: ["Fantasy", "Coming of Age"], score: 0.61, summary: "A gifted but proud young wizard unleashes a shadow that hunts him across a world of islands, and must learn the true cost of names and power.", goodreadsUrl: goodreads("A Wizard of Earthsea", "Ursula K. Le Guin") },
  { id: "stardust", title: "Stardust", author: "Neil Gaiman", genres: ["Fantasy", "Romance"], score: 0.54, summary: "A young man crosses into a magical realm to retrieve a fallen star for the woman he loves, only to find the star is a living, irritable young woman with her own pursuers.", goodreadsUrl: goodreads("Stardust", "Neil Gaiman") },
];
