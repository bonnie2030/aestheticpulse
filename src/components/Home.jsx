import React, { useEffect, useMemo, useState } from 'react'
import ArticleCard from './ArticleCard'
import SearchBox from './SearchBox'
import { readOpenStats } from '../utils/articleStats'

export default function Home({articles}){
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [topOpened, setTopOpened] = useState([])
  const PAGE_SIZE = 7

  const list = articles
  const filtered = useMemo(()=>{
    if(!query) return list
    const s = query.toLowerCase()
    return list.filter(a=> (a.title||'').toLowerCase().includes(s) || (a.excerpt||'').toLowerCase().includes(s) || (a.category||'').toLowerCase().includes(s))
  },[list,query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = useMemo(()=>{
    const start = (page-1)*PAGE_SIZE
    return filtered.slice(start, start+PAGE_SIZE)
  },[filtered,page])

  useEffect(()=>{
    setTopOpened(readOpenStats())
    function refresh(){ setTopOpened(readOpenStats()) }
    window.addEventListener('aestheticpulse:article-open-stats-changed', refresh)
    return ()=>window.removeEventListener('aestheticpulse:article-open-stats-changed', refresh)
  },[])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="space-y-8">
          {visible.map(a=> <ArticleCard key={a.id} a={a} />)}
        </div>

        <div className="mt-6 grid grid-cols-3 items-center gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="w-full px-3 py-2 border rounded text-center disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
          <div className="px-2 py-2 text-center text-sm text-gray-600">{page}/{totalPages}</div>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="w-full px-3 py-2 border rounded text-center disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold mb-2">Search</h3>
          <SearchBox items={list} onChange={q=>{ setQuery(q); setPage(1) }} />
          <p className="text-sm text-gray-500 mt-2">Type to filter articles by title, excerpt or category.</p>
        </div>
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold">Recent</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {articles.slice(0,6).map(a=> <li key={a.id}><a className="text-pink-600 font-semibold" href={`#article-${a.id}`}>{a.title}</a></li>)}
          </ul>
        </div>
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold">Top Opened</h3>
          <p className="text-sm text-gray-500 mt-1">Existing articles visitors opened most often lately.</p>
          <ul className="mt-3 space-y-3 text-sm">
            {topOpened.length ? topOpened.slice(0, 3).map(item => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <a href={`#article-${item.id}`} className="font-semibold text-gray-800 hover:text-pink-600">{item.title}</a>
                <span className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600">{item.count}x</span>
              </li>
            )) : (
              <li className="text-gray-500">No article opens yet.</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  )
}
