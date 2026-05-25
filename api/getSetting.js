import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const SETTINGS_TABLE = 'settings'

export default async function handler(req, res){
  if(req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { key } = req.query || {}
  if(!key) return res.status(400).json({ error: 'key is required' })
  if(!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Supabase credentials not configured on server' })

  try{
    const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data, error } = await client.from(SETTINGS_TABLE).select('value').eq('key', key).limit(1).maybeSingle()
    if(error) throw error
    const value = data && data.value ? data.value : null
    return res.status(200).json({ key, value })
  }catch(e){
    console.error('getSetting error', e)
    return res.status(500).json({ error: e.message || 'failed' })
  }
}
