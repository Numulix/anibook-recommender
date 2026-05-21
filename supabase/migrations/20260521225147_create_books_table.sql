-- Curated book catalog with embeddings for similarity search.
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  open_library_id text unique not null,
  title text not null,
  author text not null,
  synopsis text not null,
  genres text[] not null default '{}',
  cover_url text,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now()
);

-- Cosine-distance index for the recommendation query (#007).
create index if not exists books_embedding_idx
  on public.books
  using hnsw (embedding extensions.vector_cosine_ops);
