import React, { useEffect, useMemo, useState, useRef } from 'react'

export default function SearchBox({items, onChange}){
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const ref = useRef()

  useEffect(()=>{ // click outside
    function onDoc(e){ if(!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return ()=>document.removeEventListener('click', onDoc)
  },[])

  useEffect(()=>{ // debounce query propagate
    const t = setTimeout(()=> onChange(q), 220)
    return ()=>clearTimeout(t)
  },[q,onChange])

  const results = useMemo(()=>{
    if(!q) return []
    const s = q.toLowerCase()
    return items.filter(it=> (it.title||'').toLowerCase().includes(s) || (it.excerpt||'').toLowerCase().includes(s)).slice(0,6)
  },[items,q])

  function onKey(e){
    if(!results.length) return
    if(e.key==='ArrowDown'){ e.preventDefault(); setActive(a=>Math.min(a+1, results.length-1)); setOpen(true) }
    if(e.key==='ArrowUp'){ e.preventDefault(); setActive(a=>Math.max(a-1, 0)); setOpen(true) }
    if(e.key==='Enter'){ if(active>=0 && results[active]) location.hash = `#article-${results[active].id}` }
  }

  function highlight(text){
    if(!q) return text
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')})`,'ig')
    return text.replace(regex, '<mark class="bg-yellow-200 text-black">$1</mark>')
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 bg-white border rounded px-3 py-2">
        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <input value={q} onChange={e=>{ setQ(e.target.value); setOpen(true); setActive(-1)}} onKeyDown={onKey} placeholder="Search articles by title or excerpt" className="flex-1 outline-none" />
        {q && <button onClick={()=>{ setQ(''); onChange(''); setOpen(false)}} className="text-sm text-gray-500">Clear</button>}
      </div>

      {open && results.length>0 && (
        <div className="absolute z-20 mt-2 w-full bg-white border rounded shadow-lg">
          {results.map((r,idx)=> (
            <a key={r.id} href={`#article-${r.id}`} className={`block px-3 py-2 hover:bg-gray-50 ${active===idx? 'bg-gray-50':''}`} onMouseEnter={()=>setActive(idx)}>
              <div className="text-sm font-semibold" dangerouslySetInnerHTML={{__html: highlight(r.title)}} />
              <div className="text-xs text-gray-500 mt-1" dangerouslySetInnerHTML={{__html: highlight(r.excerpt||'')}} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
