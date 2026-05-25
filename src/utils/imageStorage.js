import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
const STORAGE_BUCKET = 'article-images'

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

/**
 * Convert file to base64 data URL for local/fallback use
 */
export function toDataURL(file){
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

/**
 * Upload image file to Supabase Storage
 * Falls back to base64 if storage is unavailable
 */
export async function uploadImage(file){
  const client = getSupabaseClient()
  
  // If no remote backend, fall back to base64
  if(!client){
    return toDataURL(file)
  }

  try {
    // Generate a unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const filename = `${timestamp}-${random}-${file.name}`
    
    // Upload to storage
    const { data, error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(filename, file, {
        cacheControl: '31536000',
        upsert: false
      })

    if(error) throw error

    // Get public URL
    const { data: urlData } = client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename)

    return urlData.publicUrl
  } catch(e){
    console.warn('Storage upload failed, falling back to base64:', e)
    // Fall back to base64 if storage fails
    return toDataURL(file)
  }
}

/**
 * Upload multiple images and return array of URLs
 */
export async function uploadImages(files){
  return Promise.all(files.map(file => uploadImage(file)))
}
