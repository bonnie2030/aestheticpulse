import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
const STORAGE_BUCKET = 'article-images'

// Image compression settings (optimized for web, not print)
const MAX_WIDTH = 1500  // Reduced from 2000 (still 3K+ on most displays)
const MAX_HEIGHT = 1500
const JPEG_QUALITY = 0.75  // Reduced from 0.85 (75% still visually indistinguishable from 100% on web)
const SECONDARY_QUALITY = 0.60  // If still too large, drop to 60%
const MAX_FILE_SIZE = 500 * 1024 // 500KB target per image

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
 * Compress image using canvas API
 * Resizes if needed and applies JPEG compression
 * Applies secondary compression if file is still over target size
 */
async function compressImage(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions if image is larger than max
        if(width > MAX_WIDTH || height > MAX_HEIGHT){
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // First pass compression
        canvas.toBlob(async (blob) => {
          if(!blob) {
            reject(new Error('Failed to compress image'))
            return
          }
          
          // Check if still over target, apply secondary compression
          if(blob.size > MAX_FILE_SIZE){
            canvas.toBlob((blob2) => {
              if(!blob2) reject(new Error('Failed to compress image (second pass)'))
              resolve(new File([blob2], file.name, { type: 'image/jpeg' }))
            }, 'image/jpeg', SECONDARY_QUALITY)
          } else {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          }
        }, 'image/jpeg', JPEG_QUALITY)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
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
 * Compresses before upload, returns compression stats
 * Falls back to base64 if storage is unavailable
 */
export async function uploadImage(file){
  const client = getSupabaseClient()
  const originalSize = file.size
  
  // Compress image
  let fileToUpload = file
  let compressedSize = originalSize
  try {
    fileToUpload = await compressImage(file)
    compressedSize = fileToUpload.size
    console.log(`Image compressed: ${Math.round(originalSize/1024)}KB → ${Math.round(compressedSize/1024)}KB (${Math.round((1 - compressedSize/originalSize) * 100)}% saved)`)
  } catch(compressErr) {
    console.warn('Image compression failed, using original:', compressErr)
  }
  
  // If no remote backend, fall back to base64
  if(!client){
    return toDataURL(fileToUpload)
  }

  try {
    // Generate a unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const filename = `${timestamp}-${random}-${fileToUpload.name}`
    
    // Upload to storage
    const { data, error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(filename, fileToUpload, {
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
    return toDataURL(fileToUpload)
  }
}

/**
 * Upload multiple images and return array of URLs
 */
export async function uploadImages(files){
  return Promise.all(files.map(file => uploadImage(file)))
}
