import React, { useEffect, useState } from 'react'
import { verifyAdmin, setSession } from '../utils/auth'

export default function Login({onSuccess}){
  const [username, setUsername] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  useEffect(()=>{ setUsername('bonfacemamboleoondieki@gmail.com') },[])

  function doLogin(e){
    e.preventDefault()
    setErr('')
    if(!username.trim()) return setErr('Enter username or email')
    if(!pw) return setErr('Enter password')
    const ok = verifyAdmin(username, pw)
    if(ok){
      setSession()
      onSuccess()
    } else {
      setErr('Wrong username or password')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border p-6 rounded">
      <form onSubmit={doLogin} className="space-y-3">
        <h3 className="text-lg font-semibold">Admin Login</h3>
        <input type="email" placeholder="Username or email" className="w-full border p-2" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full border p-2" value={pw} onChange={e=>setPw(e.target.value)} />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex gap-2"><button className="px-4 py-2 bg-black text-white">Login</button><a href="#home" className="px-4 py-2 border">Back</a></div>
      </form>
    </div>
  )
}
