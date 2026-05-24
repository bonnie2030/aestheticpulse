export const ADMIN_USERNAME = 'bonfacemamboleoondieki@gmail.com'
export const ADMIN_PASSWORD = 'Bonnie2030!!'
const AUTH_KEY = 'aestheticpulse_auth'

export function verifyAdmin(username, password){
  return username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() && password === ADMIN_PASSWORD
}

export function clearSession(){ localStorage.removeItem(AUTH_KEY) }
export function setSession(){ localStorage.setItem(AUTH_KEY,'1') }
export function isSession(){ return localStorage.getItem(AUTH_KEY) === '1' }
