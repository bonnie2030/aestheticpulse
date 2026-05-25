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

- **Important: Configure RLS on the bucket** (CRITICAL - storage requires BOTH conditions):
  
  **Part 1: Create RLS policies** (SQL Editor):
  - Go to **Storage** → **Policies** → **SQL Editor**
  - Run these two SQL commands:
  
  ```sql
  -- Allow authenticated users to upload files
  CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');
  
  -- Allow authenticated users to download files  
  CREATE POLICY "Allow authenticated downloads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'article-images');
  ```
  
  Verify: **Storage → Policies** should show "2" under `article-images` bucket.
  
  **Part 2: Set bucket to PUBLIC** (REQUIRED for authenticated uploads):
  - Go to **Storage → Buckets**
  - Click on `article-images` bucket
  - Click **Edit bucket**
  - Enable **"Public bucket"** toggle (allows authenticated users to upload)
  - Click **Save**
  
  Verify: Breadcrumb should show "article-images **Public**"
  
  Without BOTH settings, all uploads fail with "row violates row-level security policy".

- **Image compression** (automatic):
  - Images are automatically compressed before upload to reduce file size without visible quality loss
  - **Resizing**: Images larger than 1500×1500px are scaled down (sufficient for web, exceeds typical screen resolution)
  - **Quality**: Primary JPEG compression at 75% (imperceptible on web), secondary pass at 60% if still over 500KB per image
  - **Result**: Midjourney images (often 5-10MB) typically compress to 200-400KB
  - **Transparency**: If first pass > 500KB, automatically drops to 60% quality for second pass (still high visual fidelity)
  - You'll see confirmation: `"Image uploaded (compressed: 8500KB → 350KB (96% saved))"`
  - Check browser console (F12) for detailed compression stats

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
  - Articles are saved **one at a time** (not batch), with dynamic delays based on article size
  - Each save gets a **30-second timeout** on the database query
  - Each save attempt **retries up to 7 times** with exponential backoff: 3s, 6s, 12s, 24s, 48s, 96s, 192s
  - Delays between articles scale with payload: 1s base + 1s per 50KB
  - Admin UI shows: "Publishing: saving article 1 of 5... (est. 25s)"
  - **Blocks articles over 500KB** with a warning to split into sub-articles

- **Result**: Publishing is now reliable even for articles with 10+ images:
  1. Images are already stored (just URLs in database)
  2. Server handles one article at a time (no resource spikes)
  3. Transient timeouts are automatically retried with long delays
  4. You see progress and estimated time

5) Troubleshooting

- If the Admin UI shows "Published locally but failed to sync to remote" or similar:
  - Confirm env vars are present in the running environment.
  - Check the browser console/network tab for responses from Supabase (401/403 indicate key or RLS issues).
  - If you see permission errors, adjust RLS policies or use a server endpoint with the service role key.

- **Image compression issues**:
  - Open browser console (F12 → Console) to see upload and compression stats
  - Look for one of these messages:
    - `✓ Image compressed: 8500KB → 350KB` = working correctly
    - `❌ CRITICAL: Supabase not configured` = env vars missing (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)
    - `❌ Storage upload failed: 404 Not Found` = bucket doesn't exist (create `article-images` bucket)
    - `❌ Storage upload failed: 401 Unauthorized` = bucket is not PUBLIC (change visibility settings)
  - If pasting an image shows an error message in red, it means Storage is not working—fix it before trying again
  - Do NOT proceed if images fail to upload (article will be huge if base64 fallback is used)
  - When publishing, if you see "ERROR: Images are embedded as base64", it means images didn't upload to Storage

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
