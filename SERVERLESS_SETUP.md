# Serverless API Setup for Universal Article Posts

This guide explains how to deploy the serverless endpoints that make articles universal across all browsers.

## What Changed

Instead of requiring Supabase credentials in the frontend, the app now calls two serverless endpoints:
- `/api/loadArticles` — reads articles from Supabase (GET)
- `/api/saveArticles` — writes/deletes articles from Supabase (POST)

Both endpoints use the **Supabase service role key** (server-side only, never exposed to client).

## Deployment Steps

### 1. Add Supabase Environment Variables to Your Host

Set these in your deployment environment (Vercel, Netlify, etc.):

- `VITE_SUPABASE_URL` — Your Supabase project URL (e.g., `https://xyz.supabase.co`)
- `VITE_SUPABASE_TABLE` — Table name, defaults to `articles` (optional)
- `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase **service role key** (secret, server-side only)

**Where to find these:**
- In your Supabase dashboard: Settings → API → Project URL + Anon Key
- Service Role Key: Settings → API → Service Role Secret (⚠️ Keep this secret! Never commit or expose in client code)

### 2. Example: Vercel Deployment

1. Go to your Vercel project settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_TABLE` = `articles`
   - `SUPABASE_SERVICE_ROLE_KEY` = `sbp_xxxxxxxxxxxx` (your secret key from Supabase)
3. Redeploy the project

### 3. Example: Netlify Deployment

1. Go to Netlify site settings → Environment
2. Add:
   - Key: `VITE_SUPABASE_URL`, Value: `https://your-project.supabase.co`
   - Key: `VITE_SUPABASE_TABLE`, Value: `articles`
   - Key: `SUPABASE_SERVICE_ROLE_KEY`, Value: `sbp_xxxxxxxxxxxx`
3. Trigger a new deploy

## Verify Setup

Once deployed:

1. **Test in Admin:** Publish a new article
2. **Check Admin status:** You should see "Published. Synced." (not "failed to sync")
3. **Test universal access:** Share the article link with another user/incognito session
4. **Expected:** Article should appear for all users (read via `/api/loadArticles`)

If you see "Published locally but failed to sync to remote":
- Verify env vars are set correctly
- Check Supabase logs for errors
- Confirm service role key is valid

## Troubleshooting

- **404 on /api/saveArticles or /api/loadArticles**: Ensure the `api/` folder exists at your project root with both `.js` files
- **500 error "Supabase credentials not configured"**: Service role key is missing or blank in environment
- **"Permission denied" from Supabase**: Service role key is invalid or expired; regenerate it in Supabase dashboard
- **Articles don't appear for other users**: Ensure the `/api/loadArticles` endpoint is being called (check Network tab in DevTools)

## Local Development

To test the serverless endpoints locally with a real Supabase project:

1. Create a `.env.local` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_TABLE=articles
   SUPABASE_SERVICE_ROLE_KEY=sbp_xxxxxxxxxxxx
   ```

2. Install Vercel CLI (if using Vercel):
   ```bash
   npm i -g vercel
   ```

3. Run locally with env vars:
   ```bash
   vercel dev
   ```
   (This will start dev server + serverless functions with env vars)

   Or for simple testing without full serverless emulation:
   ```bash
   npm run dev
   ```
   (Local dev server will work, but `/api/*` endpoints won't be available locally unless using Vercel CLI)

## Security Notes

- **Never commit** `SUPABASE_SERVICE_ROLE_KEY` to version control
- Service role key has full database access; it's meant for trusted server-side operations only
- Keep this key in your deployment platform's secrets management (Vercel/Netlify environment variables)
- If the key is ever leaked, regenerate it immediately in your Supabase dashboard

## File Structure

```
api/
  ├── loadArticles.js    (GET /api/loadArticles)
  └── saveArticles.js    (POST /api/saveArticles)

src/
  └── utils/
      └── storage.js     (updated to call /api/*)
```

## Next Steps

Once confirmed working:
1. All articles posted in Admin will be saved to Supabase (universal)
2. All users will fetch from Supabase and see the same articles
3. No client-side Supabase keys are exposed
4. You can safely delete article content manually from your Supabase dashboard if needed
