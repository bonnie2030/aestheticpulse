import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const SUPABASE_TABLE = process.env.VITE_SUPABASE_TABLE || 'articles'

/**
 * Retry helper with exponential backoff for transient failures
 */
async function retryWithBackoff(fn, maxRetries = 5, initialDelay = 2000){
  for(let attempt = 0; attempt < maxRetries; attempt++){
    try{
      return await fn()
    }catch(e){
      const isTimeout = (e.message || '').includes('timeout') || (e.code || '').includes('PGRST')
      const isLastAttempt = attempt === maxRetries - 1
      if(!isTimeout || isLastAttempt) throw e
      const delay = initialDelay * Math.pow(2, attempt)
      console.warn(`Timeout on attempt ${attempt + 1}/${maxRetries}, retrying in ${delay}ms...`)
      await new Promise(res => setTimeout(res, delay))
    }
  }
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Require both credentials to be set
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured on server' })
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { articles } = req.body

    if (!Array.isArray(articles)) {
      return res.status(400).json({ error: 'articles must be an array' })
    }

    // Normalize payload
    const payload = articles.map(a => ({
      id: String(a.id),
      title: a.title || '',
      introduction: a.introduction || '',
      excerpt: a.excerpt || '',
      content: a.content || '',
      image: a.image || '',
      images: Array.isArray(a.images) ? a.images : [],
      sub_articles: Array.isArray(a.subArticles) ? a.subArticles : [],
      category: a.category || 'Outfits',
      date: a.date || new Date().toISOString(),
    }))

    const ids = payload.map(item => item.id)

    // Fetch existing IDs to identify what to delete
    const { data: existingRows, error: fetchError } = await client
      .from(SUPABASE_TABLE)
      .select('id')

    if (fetchError) throw fetchError

    // Delete rows no longer in the articles list (deletions)
    const existingIds = Array.isArray(existingRows) ? existingRows.map(row => String(row.id)) : []
    const missingIds = existingIds.filter(id => !ids.includes(id))

    for (const missingId of missingIds) {
      const { error: deleteError } = await client
        .from(SUPABASE_TABLE)
        .delete()
        .eq('id', missingId)

      if (deleteError) throw deleteError
    }

    // Save articles one at a time with delays to avoid statement timeouts
    for (let i = 0; i < payload.length; i++) {
      const article = payload[i]
      await retryWithBackoff(async () => {
        const { error: upsertError } = await client
          .from(SUPABASE_TABLE)
          .upsert([article], { onConflict: 'id' })

        if (upsertError) throw upsertError
      })
      // Small delay between articles to avoid overwhelming the server
      if (i < payload.length - 1) await new Promise(res => setTimeout(res, 500))
    }

    return res.status(200).json({ success: true, count: payload.length })
  } catch (error) {
    console.error('saveArticles error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to save articles',
      details: error.code || error.status,
    })
  }
}
