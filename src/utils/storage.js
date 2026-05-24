import { createClient } from '@supabase/supabase-js'

const LOCAL_STORAGE_KEY = 'aestheticpulse_articles_v2'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
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
  const { error } = await client
    .from(SUPABASE_TABLE)
    .upsert(payload, { onConflict: 'id' })

  if(error) throw error
  return true
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

      if(local && local.length){
        const normalizedLocal = dedupeArticles(local)
        await saveRemoteArticles(normalizedLocal)
        return normalizedLocal
      }

      const seeded = seedArticles()
      const normalizedSeeded = dedupeArticles(seeded)
      await saveRemoteArticles(normalizedSeeded)
      writeLocalArticles(normalizedSeeded)
      return normalizedSeeded
    }catch(e){
      // Fall back to the local cache if the shared backend is unavailable.
    }
  }

  if(local && local.length) return dedupeArticles(local)

  const seeded = seedArticles()
  const normalizedSeeded = dedupeArticles(seeded)
  writeLocalArticles(normalizedSeeded)
  return normalizedSeeded
}

export async function saveArticles(arr){
  const normalized = dedupeArticles(arr)
  writeLocalArticles(normalized)

  if(hasRemoteBackend()){
    try{
      await saveRemoteArticles(normalized)
    }catch(e){
      // Keep the local copy even if the shared backend save fails.
    }
  }
}
export function seedArticles(){
  const now = Date.now()
  return [
    {
      id: 'seed-cowboy-boots',
      title: "How to Style Cowboy Boots: A Modern Woman's Guide",
      excerpt: 'Learn how to make cowboy boots feel elevated, modern, and wearable with midi skirts, denim, and tailored layers.',
      content: `<h2>1. Cowboy Boots with a Midi Skirt</h2>
<p>One of the easiest ways to modernize cowboy boots is to pair them with a softly structured midi skirt. The contrast between the rugged boot and the feminine silhouette feels polished without trying too hard.</p>
<ul><li>Choose a skirt with movement, like satin or pleated fabric.</li><li>Keep the color palette neutral or earthy for a refined finish.</li><li>Add a fitted knit or tucked-in blouse to balance proportions.</li></ul>
<p><strong>Style tip:</strong> Let the boots peek out just enough to create shape at the hem.</p>

<h2>2. Denim Done Right</h2>
<p>Straight-leg denim and cropped flares work beautifully with cowboy boots.</p>`,
      image: makeInline('cowboy','Cowboy Boots','#b65a3c','#f7e4d8'),
      category: 'Outfits',
  date: new Date(now-600000).toISOString()
    },
    {
  id: 'seed-soft-curls',
      title: 'Soft Curls Aesthetic Hairstyles That Look Romantic, Glossy, and Effortlessly Elegant',
      excerpt: 'Soft curls aesthetic hairstyles continue staying popular because they combine romantic movement, airy softness, and glamorous texture.',
      content: `<h2>Soft Curls Basics</h2><p>Soft curls work on many hair lengths and can be styled with minimal heat.</p>`,
      image: makeInline('curls','Curls','#d47a5d','#f6ddd3'),
      category: 'Hairstyles',
      date: new Date(now-500000).toISOString()
    }
  ]
}

function makeInline(title, subtitle, accent='#b65a3c', bg='#fff2ea'){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='${bg}'/><text x='60' y='120' font-family='Georgia,serif' font-size='36' fill='#7d5f51'>AESTHETICPULSE</text><text x='60' y='320' font-family='Georgia,serif' font-size='72' fill='#1f1a17'>${escapeHtml(title)}</text></svg>`
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg)
}
function escapeHtml(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
