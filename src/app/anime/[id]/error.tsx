"use client";

// Error boundary for the anime detail route. Catches failures from the data
// layer (e.g. AniList/MAL unreachable with no cache) and offers a retry.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-20 text-center">
      <h1 className="text-xl font-bold">Couldn’t load this anime</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Something went wrong fetching the details. Please try again shortly.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
      >
        Try again
      </button>
    </main>
  );
}
