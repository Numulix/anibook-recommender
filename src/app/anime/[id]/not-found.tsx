import Link from "next/link";

// Shown when getAnime returns null (unknown id) or the id is malformed.
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-20 text-center">
      <h1 className="text-xl font-bold">Anime not found</h1>
      <p className="mt-2 text-sm text-zinc-400">
        We couldn’t find that anime. It may not exist or isn’t available right now.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
      >
        Back to trending
      </Link>
    </main>
  );
}
