import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const SUPABASE_TABLE = process.env.VITE_SUPABASE_TABLE || 'articles'

function normalizeFromRemote(row) {
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

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Require server credentials to be set
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured on server' })
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data, error } = await client
      .from(SUPABASE_TABLE)
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    const articles = Array.isArray(data) ? data.map(normalizeFromRemote) : []
    return res.status(200).json({ articles })
  } catch (error) {
    console.error('loadArticles error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to load articles',
      details: error.code || error.status,
    })
  }
}
