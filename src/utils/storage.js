import { createClient } from '@supabase/supabase-js'

const LOCAL_STORAGE_KEY = 'aestheticpulse_articles_v2'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
const SUPABASE_TABLE = import.meta.env.VITE_SUPABASE_TABLE || 'articles'

let supabaseClient = null

function hasRemoteBackend(){
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}

function getSupabaseClient(){
  if(!hasRemoteBackend()) return null
  if(!supabaseClient){
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseClient
}

function readLocalArticles(){
  try{
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  }catch(e){
    return null
  }
}

function writeLocalArticles(arr){
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr))
}

function dedupeArticles(arr){
  const byTitle = new Map()
  for(const article of Array.isArray(arr) ? arr : []){
    const key = String(article.title || '').trim().toLowerCase()
    if(!key) continue
    const existing = byTitle.get(key)
    if(!existing){
      byTitle.set(key, article)
      continue
    }
    const existingDate = new Date(existing.date || 0).getTime()
    const currentDate = new Date(article.date || 0).getTime()
    if(currentDate >= existingDate){
      byTitle.set(key, article)
    }
  }
  return Array.from(byTitle.values())
}

function normalizeFromRemote(row){
  return {
    id: row.id,
    title: row.title || '',
    introduction: row.introduction || '',
    excerpt: row.excerpt || '',
    content: row.content || '',
    image: row.image || '',
    images: Array.isArray(row.images) ? row.images : [],
    subArticles: Array.isArray(row.sub_articles) ? row.sub_articles : [],
    category: row.category || 'Outfits',
    date: row.date || new Date().toISOString(),
  }
}

function normalizeForRemote(article){
  return {
    id: String(article.id),
    title: article.title || '',
    introduction: article.introduction || '',
    excerpt: article.excerpt || '',
    content: article.content || '',
    image: article.image || '',
    images: Array.isArray(article.images) ? article.images : [],
    sub_articles: Array.isArray(article.subArticles) ? article.subArticles : [],
    category: article.category || 'Outfits',
    date: article.date || new Date().toISOString(),
  }
}

async function loadRemoteArticles(){
  const client = getSupabaseClient()
  if(!client) return null
  const { data, error } = await client
    .from(SUPABASE_TABLE)
    .select('*')
    .order('date', { ascending: false })

  if(error) throw error
  return Array.isArray(data) ? data.map(normalizeFromRemote) : []
}

async function saveRemoteArticles(arr){
  const client = getSupabaseClient()
  if(!client) return false
  const payload = arr.map(normalizeForRemote)
  const ids = payload.map(item => item.id)
  // Helper to retry transient network/remote errors
  async function retryAsync(fn, attempts = 3, delay = 700){
    let lastErr
    for(let i=0;i<attempts;i++){
      try{
        return await fn()
      }catch(e){
        lastErr = e
        // simple backoff
        await new Promise(r => setTimeout(r, delay * (i+1)))
      }
    }
    throw lastErr
  }

  const { data: existingRows } = await retryAsync(()=>client.from(SUPABASE_TABLE).select('id'))

  const existingIds = Array.isArray(existingRows) ? existingRows.map(row => String(row.id)) : []
  const missingIds = existingIds.filter(id => !ids.includes(id))

  for(const missingId of missingIds){
    await retryAsync(()=>client.from(SUPABASE_TABLE).delete().eq('id', missingId))
  }

  await retryAsync(()=>client.from(SUPABASE_TABLE).upsert(payload, { onConflict: 'id' }))
  return payload.map(normalizeFromRemote)
}

export async function loadArticles(){
  const local = readLocalArticles()

  if(hasRemoteBackend()){
    try{
      const remote = await loadRemoteArticles()
      if(remote && remote.length){
        const normalizedRemote = dedupeArticles(remote)
        writeLocalArticles(normalizedRemote)
        return normalizedRemote
      }

      writeLocalArticles([])
      return []
    }catch(e){
      writeLocalArticles([])
      return []
    }
  }

  if(local && local.length) return dedupeArticles(local)
  // Do not auto-seed demo articles in the client bundle.
  // Returning an empty list prevents accidental re-population
  // of the shared remote table from client-side seed data.
  writeLocalArticles([])
  return []
}

export async function saveArticles(arr){
  const normalized = dedupeArticles(arr)
  writeLocalArticles(normalized)

  if(hasRemoteBackend()){
    try{
      const synced = await saveRemoteArticles(normalized)
      if(synced && synced.length){
        writeLocalArticles(dedupeArticles(synced))
        return { articles: dedupeArticles(synced), remoteSaved: true }
      }
    }catch(e){
      // Keep the local copy even if the shared backend save fails.
      return { articles: normalized, remoteSaved: false, error: e }
    }
  }

  return { articles: normalized, remoteSaved: false }
}
// Note: `seedArticles`, `makeInline`, and `escapeHtml` were removed to
// prevent demo content being bundled into production builds. Seeding
// should be performed as a server-side migration or explicit dev task.
