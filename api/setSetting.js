import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const SETTINGS_TABLE = 'settings'
const ADMIN_SECRET = process.env.ADMIN_SECRET || ''

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if(!ADMIN_SECRET) return res.status(500).json({ error: 'Server admin secret not configured' })
  const header = req.headers['x-admin-secret'] || req.headers['x-admin-key'] || ''
  if(header !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' })

  const { key, value } = req.body || {}
  if(!key || typeof value === 'undefined') return res.status(400).json({ error: 'key and value required' })
  if(!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Supabase credentials not configured on server' })

  try{
    const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const payload = { key: String(key), value: String(value) }
    const { error } = await client.from(SETTINGS_TABLE).upsert([payload], { onConflict: 'key' })
    if(error) throw error
    return res.status(200).json({ ok: true })
  }catch(e){
    console.error('setSetting error', e)
    return res.status(500).json({ error: e.message || 'failed' })
  }
}
