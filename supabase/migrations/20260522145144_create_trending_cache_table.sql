-- Single-row cache for the merged trending payload (one global list).
-- Keyed by a fixed string so the row is upserted in place every refresh.
create table if not exists public.trending_cache (
  key text primary key,
  payload jsonb not null,
  cached_at timestamptz not null default now()
);
