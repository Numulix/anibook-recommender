// Streamed while the server component awaits the anime data layer.
export default function Loading() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
      <aside className="animate-pulse">
        <div className="aspect-[2/3] w-full rounded-xl bg-white/5" />
        <div className="mt-4 h-7 w-3/4 rounded bg-white/5" />
        <div className="mt-2 h-4 w-1/2 rounded bg-white/5" />
        <div className="mt-3 flex gap-3">
          <div className="h-12 w-24 rounded-lg bg-white/5" />
          <div className="h-12 w-24 rounded-lg bg-white/5" />
        </div>
      </aside>
      <section className="animate-pulse">
        <div className="mb-4 h-6 w-40 rounded bg-white/5" />
        <div className="h-40 w-full rounded-lg bg-white/5" />
      </section>
    </main>
  );
}
