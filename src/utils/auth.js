export const ADMIN_USERNAME = 'bonfacemamboleoondieki@gmail.com'
export const ADMIN_PASSWORD = 'Bonnie2030!!'

export function verifyAdmin(username, password){
  return username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() && password === ADMIN_PASSWORD
}

export function clearSession(){ sessionStorage.removeItem('aestheticpulse_auth') }
export function setSession(){ sessionStorage.setItem('aestheticpulse_auth','1') }
export function isSession(){ return sessionStorage.getItem('aestheticpulse_auth') === '1' }
