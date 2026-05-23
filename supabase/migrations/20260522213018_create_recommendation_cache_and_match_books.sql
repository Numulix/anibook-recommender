-- Per-anime recommendation cache (#007). Keyed by anilist id; the embedding +
-- vector query run once per anime and the scored result list is reused.
create table if not exists public.recommendation_cache (
  anime_id integer primary key,        -- anilist id
  payload jsonb not null,              -- ScoredBook[] (selected recommendations)
  cached_at timestamptz not null default now()
);

-- Cosine-similarity search over the book catalog. Returns the closest books to
-- a query embedding with similarity = 1 - cosine_distance (0..1), ordered best
-- first. Callers fetch a wider candidate set than they display so the
-- threshold/fallback rule (selectRecommendations) has loose matches to fall
-- back to. Uses the books_embedding_idx HNSW index created with the table.
create or replace function public.match_books(
  query_embedding extensions.vector(1536),
  match_count int default 30
)
returns table (
  open_library_id text,
  title text,
  author text,
  synopsis text,
  genres text[],
  cover_url text,
  similarity real
)
language sql
stable
as $$
  select
    b.open_library_id,
    b.title,
    b.author,
    b.synopsis,
    b.genres,
    b.cover_url,
    (1 - (b.embedding <=> query_embedding))::real as similarity
  from public.books b
  order by b.embedding <=> query_embedding asc
  limit match_count;
$$;
