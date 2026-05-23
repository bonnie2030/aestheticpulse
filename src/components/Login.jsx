import React, { useEffect, useState } from 'react'
import { hasAdmin, verifyAdmin, createAdmin, setSession } from '../utils/auth'

export default function Login({onSuccess}){
  const [exists, setExists] = useState(null)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')

  useEffect(()=>{ (async()=> setExists(await hasAdmin()))() },[])

  async function doLogin(e){ e.preventDefault(); setErr(''); if(!pw) return setErr('Enter password'); const ok = await verifyAdmin(pw); if(ok){ setSession(); onSuccess(); } else setErr('Wrong password') }

  async function doSetup(e){ e.preventDefault(); setErr(''); if(!pw || !pw2) return setErr('Enter and confirm password'); if(pw!==pw2) return setErr('Passwords do not match'); await createAdmin(pw); setSession(); onSuccess() }

  if(exists===null) return <div>Loading...</div>

  return (
    <div className="max-w-md mx-auto bg-white border p-6 rounded">
      {exists ? (
        <form onSubmit={doLogin} className="space-y-3">
          <h3 className="text-lg font-semibold">Admin Login</h3>
          <input type="password" placeholder="Password" className="w-full border p-2" value={pw} onChange={e=>setPw(e.target.value)} />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex gap-2"><button className="px-4 py-2 bg-black text-white">Login</button><a href="#home" className="px-4 py-2 border">Back</a></div>
        </form>
      ) : (
        <form onSubmit={doSetup} className="space-y-3">
          <h3 className="text-lg font-semibold">Create Admin Password</h3>
          <input type="password" placeholder="Password" className="w-full border p-2" value={pw} onChange={e=>setPw(e.target.value)} />
          <input type="password" placeholder="Confirm password" className="w-full border p-2" value={pw2} onChange={e=>setPw2(e.target.value)} />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex gap-2"><button className="px-4 py-2 bg-black text-white">Create</button><a href="#home" className="px-4 py-2 border">Cancel</a></div>
        </form>
      )}
    </div>
  )
}
