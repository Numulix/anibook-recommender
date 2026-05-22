-- Cached, merged anime metadata from AniList (anchor) + MAL (rating).
-- Keyed by anilist_id; mal_id is stored for reference and may be null.
create table if not exists public.anime_cache (
  id uuid primary key default gen_random_uuid(),
  anilist_id integer unique not null,
  mal_id integer,
  title text not null,
  synopsis text not null default '',
  genres text[] not null default '{}',
  cover_url text,
  mal_rating real,          -- MAL "mean", out of 10 (null if MAL lookup missed)
  anilist_rating integer,   -- AniList averageScore, out of 100
  studios text[] not null default '{}',
  year integer,
  episode_count integer,    -- stored per issue #003 AC; not surfaced in v1 UI
  status text,              -- stored per issue #003 AC; not surfaced in v1 UI
  cached_at timestamptz not null default now()
);
