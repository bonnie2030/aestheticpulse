# AESTHETICPULSE (Vite + React + Tailwind)

Local dev:

1. cd into the project

```bash
cd C:\Users\bonnie\AestheticPulse
npm install
npm run dev
```

2. Open the local dev url (printed by Vite).

Notes:
- Articles sync through Supabase when these env vars are set in both your local `.env` file and Vercel project settings:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_TABLE=articles

# Also supported as aliases in this app:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

- If the Supabase env vars are missing, the app falls back to `localStorage` under `aestheticpulse_articles_v2`, so articles will not sync across devices.
- Admin dashboard is available at `/#admin`.
- Image uploads are converted to Base64 and stored in localStorage.

## Supabase table

Create an `articles` table with this shape:

```sql
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
```
