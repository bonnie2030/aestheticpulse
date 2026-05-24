import React, { useEffect, useState } from 'react'
import SearchBox from './SearchBox'
import { readOpenStats } from '../utils/articleStats'

export default function ArticleDetail({id, articles}){
  const [topOpened, setTopOpened] = useState([])
  const a = articles.find(x=>String(x.id)===String(id))

  useEffect(()=>{
    setTopOpened(readOpenStats())
    function refresh(){ setTopOpened(readOpenStats()) }
    window.addEventListener('aestheticpulse:article-open-stats-changed', refresh)
    return ()=>window.removeEventListener('aestheticpulse:article-open-stats-changed', refresh)
  },[])

  if(!a) return (<div>Article not found. <a href="#home">Back</a></div>)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <article className="futuristic-card overflow-hidden bg-white border rounded-2xl shadow-sm">
          <div className="p-6 sm:p-8 lg:p-10">
            <button className="mb-4 text-sm font-semibold text-pink-600 hover:underline" onClick={()=>location.hash='#home'}>← Back to Home</button>
            <div className="text-sm text-gray-500">{a.category} • {new Date(a.date).toLocaleDateString()}</div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">{a.title}</h1>
            {a.introduction && <div className="text-lg text-gray-700 mt-4 prose max-w-none" dangerouslySetInnerHTML={{__html: a.introduction}} />}
          </div>

          {a.image && <img src={a.image} alt={a.title} className="w-full h-72 sm:h-80 object-cover" />}

          <div className="p-6 sm:p-8 lg:p-10 pt-8">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{__html: a.content}} />

            {a.subArticles && a.subArticles.length>0 && (
              <section className="mt-8 space-y-8">
                {a.subArticles.map((s,idx)=> (
                  <div key={idx} className="border-t pt-6">
                    <h3 className="text-xl font-semibold">{`Part ${idx+1}`}</h3>
                    {s.explanation && <div className="text-gray-700 mt-2 prose max-w-none" dangerouslySetInnerHTML={{__html: s.explanation}} />}
                    {s.images && s.images.length>0 && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {s.images.map((im,i)=>(
                          <img key={i} src={im} className="w-full h-40 object-cover rounded" alt={`sub-${idx}-${i}`}/>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
        </article>
      </div>

      <aside className="space-y-6">
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold mb-2">Search</h3>
          <SearchBox items={articles} onChange={()=>{}} />
          <p className="text-sm text-gray-500 mt-2">Search articles by title or excerpt.</p>
        </div>
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold">Recent</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {articles.slice(0,6).map(item=> <li key={item.id}><a className="text-pink-600 font-semibold" href={`#article-${item.id}`}>{item.title}</a></li>)}
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
