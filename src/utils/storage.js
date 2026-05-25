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
    console.warn('readLocalArticles failed', e)
    return null
  }
}

function writeLocalArticles(arr){
  try{
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr))
    return true
  }catch(e){
    console.warn('writeLocalArticles failed', e)
    return false
  }
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

/**
 * Retry helper with exponential backoff for transient failures
 */
async function retryWithBackoff(fn, maxRetries = 7, initialDelay = 3000){
  for(let attempt = 0; attempt < maxRetries; attempt++){
    try{
      return await fn()
    }catch(e){
      const isTimeout = (e.message || '').includes('timeout') || (e.code || '').includes('PGRST') || (e.message || '').includes('Timeout')
      const isLastAttempt = attempt === maxRetries - 1
      if(!isTimeout || isLastAttempt) throw e
      const delay = initialDelay * Math.pow(2, attempt)
      console.warn(`Timeout on attempt ${attempt + 1}/${maxRetries}, retrying in ${Math.round(delay/1000)}s...`)
      await new Promise(res => setTimeout(res, delay))
    }
  }
}

async function loadRemoteArticles(){
  const client = getSupabaseClient()
  if(!client) return []

  const { data, error } = await client
    .from(SUPABASE_TABLE)
    .select('*')
    .order('date', { ascending: false })

  if(error) throw error

  return Array.isArray(data) ? data.map(normalizeFromRemote) : []
}

async function saveRemoteArticles(arr){
  const client = getSupabaseClient()
  if(!client) throw new Error('Supabase credentials not configured')

  const payload = arr.map(normalizeForRemote)
  const ids = payload.map(item => item.id)

  // Fetch existing IDs for deletion
  const { data: existingRows, error: fetchError } = await client
    .from(SUPABASE_TABLE)
    .select('id')

  if(fetchError) throw fetchError

  const existingIds = Array.isArray(existingRows) ? existingRows.map(row => String(row.id)) : []
  const missingIds = existingIds.filter(id => !ids.includes(id))

  // Delete removed articles in parallel batches
  const deleteBatchSize = 5
  for(let i = 0; i < missingIds.length; i += deleteBatchSize){
    const batch = missingIds.slice(i, i + deleteBatchSize)
    await Promise.all(batch.map(missingId =>
      client.from(SUPABASE_TABLE).delete().eq('id', missingId)
    ))
  }

  // Save articles one at a time with longer delays for large payloads
  for(let i = 0; i < payload.length; i++){
    const article = payload[i]
    const payloadSize = JSON.stringify(article).length
    // Estimate delay: 1s base + 1s per 50KB
    const delayMs = Math.max(1000, Math.ceil(payloadSize / 50000) * 1000)
    
    await retryWithBackoff(async () => {
      const { error: upsertError } = await client
        .from(SUPABASE_TABLE)
        .upsert([article], { onConflict: 'id' })

      if(upsertError) throw upsertError
    }, 7, 3000) // 7 retries, 3 second initial backoff
    
    // Delay based on article size to avoid overwhelming the server
    if(i < payload.length - 1) await new Promise(res => setTimeout(res, delayMs))
  }

  return payload
}

export async function loadArticles(){
  const local = readLocalArticles()

  // Try to load from remote via serverless API endpoint
  try{
    const remote = await loadRemoteArticles()
    if(remote && remote.length){
      const normalizedRemote = dedupeArticles(remote)
      // Attempt to persist a local copy but do not fail if storage is unavailable
      try{ writeLocalArticles(normalizedRemote) }catch(e){ console.warn('failed persisting remote articles locally', e) }
      return normalizedRemote
    }

    writeLocalArticles([])
    return []
  }catch(e){
    console.warn('failed loading from remote, falling back to local', e)
    if(local && local.length) return dedupeArticles(local)
    writeLocalArticles([])
    return []
  }
}

export async function saveArticles(arr){
  const normalized = dedupeArticles(arr)
  const localSaved = writeLocalArticles(normalized)

  // Try to sync to remote via serverless API endpoint
  try{
    const synced = await saveRemoteArticles(normalized)
    if(synced && synced.length){
      const persisted = writeLocalArticles(dedupeArticles(synced))
      return { articles: dedupeArticles(synced), remoteSaved: true, localSaved: persisted }
    }
  }catch(e){
    // Keep the local copy even if the remote save fails.
    return { articles: normalized, remoteSaved: false, localSaved, error: e }
  }

  return { articles: normalized, remoteSaved: false, localSaved }
}
// Note: `seedArticles`, `makeInline`, and `escapeHtml` were removed to
// prevent demo content being bundled into production builds. Seeding
// should be performed as a server-side migration or explicit dev task.
