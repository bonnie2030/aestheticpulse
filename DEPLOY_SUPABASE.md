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

- **Important: Configure RLS on the bucket** (to prevent unauthorized uploads):
  - Click on the bucket → **Policies**
  - Click **New Policy** → **For authenticated users only**
  - Policy name: `allow_authenticated_upload`
  - Select template: **Enable insert access for authenticated users**
  - Click **Review** then **Save policy**

- Once created, the app will automatically upload images to this bucket when publishing articles. Images are stored as URLs instead of base64, dramatically reducing payload size.

- **Verify it's working:**
  - In the Admin editor, paste an image and watch for the "⬆️ Uploading..." indicator
  - Check browser console (F12 → Console) for any "Storage upload failed" warnings
  - If you see warnings, the app falls back to base64 (images embedded in article, making it large again)

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

4a) How the app handles large articles (Publish optimization)

- **Problem**: Publishing articles with many images or large content can timeout on Supabase (statement timeout error).
- **Solution implemented**:
  - Images are uploaded to Storage **as you paste them** (not during publish), showing an "⬆️ Uploading..." indicator
  - Articles are saved **one at a time** (not batch), with 500ms delays between each
  - Each save attempt **retries up to 5 times** with exponential backoff (2s, 4s, 8s, 16s, 32s)
  - Admin UI shows progress: "Publishing: saving article 1 of 5..."

- **Result**: Publishing should now be reliable even for articles with 10+ images, as:
  1. Images are already stored (just URLs in database)
  2. Server isn't overwhelmed by batch operations
  3. Transient timeouts are automatically retried

5) Troubleshooting

- If the Admin UI shows "Published locally but failed to sync to remote" or similar:
  - Confirm env vars are present in the running environment.
  - Check the browser console/network tab for responses from Supabase (401/403 indicate key or RLS issues).
  - If you see permission errors, adjust RLS policies or use a server endpoint with the service role key.

- **If you see "canceling statement due to statement timeout" errors**:
  - This means Supabase is timing out, even after retries. Common causes:
    1. **Storage bucket not configured**: Images are falling back to base64, making articles huge. Ensure `article-images` bucket exists and is public.
    2. **Check console**: Open browser console (F12) and paste an image. If you see "Storage upload failed, falling back to base64", that's the issue.
    3. **Verify bucket permissions**: In Supabase dashboard → Storage → `article-images` → Policies. Make sure uploads are allowed.
    4. **Existing articles with base64 images**: If old articles have embedded base64 images, delete them before re-publishing to reduce payload size.
    5. **Contact Supabase support**: If timeouts persist even with Storage working, request a statement timeout increase for your project.

- If remote writes intermittently fail, the client retries transient failures (exponential backoff). For persistent failures, inspect Supabase logs to see exact errors.

6) Security note

- Do not expose the Supabase service role key in client-side code. If you need unrestricted DB writes from your frontend, create a server-side API to handle upserts using the service key.

- Storage bucket permissions: The `article-images` bucket is set to **Public**, which means anyone can read the images (necessary for public access). To restrict uploads, add RLS policies to the storage bucket or implement authentication in the Admin panel.

If you want, I can:
- Help apply safe RLS policies in your Supabase project (I can provide SQL to run), or
- Run a remote test if you set the `VITE_SUPABASE_*` env vars in your deployed site or provide a temporary anon key (preferably add it yourself and tell me to re-test).
