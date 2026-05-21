// PROTOTYPE brand icons — APPROXIMATIONS. Swap for official MAL / AniList assets
// before shipping (check each brand's usage guidelines).

export function MalIcon({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded font-extrabold text-white"
      style={{ width: size, height: size, background: "#2e51a2", fontSize: size * 0.42 }}
      aria-label="MyAnimeList"
      title="MyAnimeList"
    >
      MAL
    </span>
  );
}

export function AniListIcon({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded font-extrabold text-white"
      style={{ width: size, height: size, background: "#02a9ff", fontSize: size * 0.5 }}
      aria-label="AniList"
      title="AniList"
    >
      AL
    </span>
  );
}
