Supabase remote sync — setup and troubleshooting

1) Provide environment variables

- Set these environment variables in your hosting environment (Vercel, Netlify, etc.) or in a local `.env` for development:

  - `VITE_SUPABASE_URL` — your Supabase project URL (e.g. `https://xyzcompany.supabase.co`)
  - `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public API key
  - `VITE_SUPABASE_TABLE` — optional, defaults to `articles`

  After adding env vars locally, run:

  ```bash
  npm run dev
  ```

2) Create Storage bucket for images (recommended)

- Large articles with many images require Supabase Storage to avoid hitting database row size limits.

- In your Supabase dashboard:
  - Navigate to **Storage** (left sidebar)
  - Click **Create a new bucket**
  - Name it: `article-images`
  - Set visibility to **Public** (so images are served without auth)
  - Click **Create bucket**

- Once created, the app will automatically upload images to this bucket when publishing articles. Images are stored as URLs instead of base64, dramatically reducing payload size.

- **Fallback**: If Storage is not configured, the app automatically falls back to base64 embedding (but larger articles may still hit limits).

3) Recommended Supabase table & policies

- The repo includes `supabase-schema.sql` which defines the `articles` table.

- By default, Supabase enforces Row Level Security (RLS) if enabled. There are two common approaches:

  a) Temporary / quick (not recommended for production): allow public writes to `articles`:

  ```sql
  -- Allow anyone (public) to insert/update/delete
  ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "public_write" ON public.articles
    USING (true)
    WITH CHECK (true);
  ```

  b) Recommended: require authenticated users (create a simple auth flow) or use a server-side endpoint with a service-role key to perform writes. Example policy for authenticated users:

  ```sql
  ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "auth_insert_update" ON public.articles
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  ```

4) Testing remote sync locally

- Create a `.env` with the variables above (do NOT commit secrets):

  ```env
  VITE_SUPABASE_URL=https://xyz.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  VITE_SUPABASE_TABLE=articles
  ```

- Restart dev server and publish an article in the Admin UI. Watch the Admin status message: it will show success or an error message. Also check the browser console for network errors.

5) Troubleshooting

- If the Admin UI shows "Published locally but failed to sync to remote" or similar:
  - Confirm env vars are present in the running environment.
  - Check the browser console/network tab for responses from Supabase (401/403 indicate key or RLS issues).
  - If you see permission errors, adjust RLS policies or use a server endpoint with the service role key.

- If remote writes intermittently fail, the client now retries transient failures (exponential backoff). For persistent failures, inspect Supabase logs to see exact errors.

6) Security note

- Do not expose the Supabase service role key in client-side code. If you need unrestricted DB writes from your frontend, create a server-side API to handle upserts using the service key.

- Storage bucket permissions: The `article-images` bucket is set to **Public**, which means anyone can read the images (necessary for public access). To restrict uploads, add RLS policies to the storage bucket or implement authentication in the Admin panel.

If you want, I can:
- Help apply safe RLS policies in your Supabase project (I can provide SQL to run), or
- Run a remote test if you set the `VITE_SUPABASE_*` env vars in your deployed site or provide a temporary anon key (preferably add it yourself and tell me to re-test).
