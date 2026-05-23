// Minimal client-side admin auth using Web Crypto API
function toBase64(bytes){ return btoa(String.fromCharCode(...new Uint8Array(bytes))) }
function fromBase64(str){ const s = atob(str); const arr = new Uint8Array(s.length); for(let i=0;i<s.length;i++) arr[i]=s.charCodeAt(i); return arr }

async function derive(password, salt){
  const enc = new TextEncoder()
  const pwKey = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt: salt, iterations: 150000, hash: 'SHA-256'}, pwKey, 256)
  return new Uint8Array(bits)
}

export async function hasAdmin(){ return !!localStorage.getItem('aestheticpulse_admin') }

export async function createAdmin(password){
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(password, salt)
  const payload = { salt: toBase64(salt), hash: toBase64(hash) }
  localStorage.setItem('aestheticpulse_admin', JSON.stringify(payload))
  return true
}

export async function verifyAdmin(password){
  const raw = localStorage.getItem('aestheticpulse_admin')
  if(!raw) return false
  try{
    const obj = JSON.parse(raw)
    const salt = fromBase64(obj.salt)
    const expected = obj.hash
    const hash = await derive(password, salt)
    return toBase64(hash) === expected
  }catch(e){return false}
}

export function clearSession(){ sessionStorage.removeItem('aestheticpulse_auth') }
export function setSession(){ sessionStorage.setItem('aestheticpulse_auth','1') }
export function isSession(){ return sessionStorage.getItem('aestheticpulse_auth') === '1' }
