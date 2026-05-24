create table if not exists public.articles (
  id text primary key,
  title text not null,
  introduction text not null default '',
  excerpt text not null default '',
  content text not null default '',
  image text not null default '',
  images jsonb not null default '[]'::jsonb,
  sub_articles jsonb not null default '[]'::jsonb,
  category text not null default 'Outfits',
  date timestamptz not null default now()
);
