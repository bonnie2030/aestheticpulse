import React, { useMemo, useState } from 'react'
import ArticleCard from './ArticleCard'

export default function Home({articles}){
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 7

  const featured = articles[0]
  const list = articles.slice(1)
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const visible = useMemo(()=>{
    const start = (page-1)*PAGE_SIZE
    return list.slice(start, start+PAGE_SIZE)
  },[list,page])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {featured && (
          <div className="relative mb-8">
            <div className="absolute -inset-3 bg-black opacity-80 transform translate-x-2 translate-y-2 rounded"></div>
            <div className="relative bg-white border rounded overflow-hidden grid grid-cols-2">
              <img src={featured.image} alt={featured.title} className="w-full h-96 object-cover" />
              <div className="p-8 flex flex-col justify-center">
                <div className="text-sm text-gray-500 mb-4">{featured.category} • {new Date(featured.date).toLocaleDateString()}</div>
                <h2 className="text-3xl font-bold leading-tight">{featured.title}</h2>
                <p className="text-gray-600 mt-4 line-clamp-4">{featured.excerpt}</p>
                <a className="mt-6 inline-block bg-white border-2 border-black px-4 py-2 font-bold uppercase shadow-md" href={`#article-${featured.id}`}>Read More</a>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {visible.map(a=> <ArticleCard key={a.id} a={a} />)}
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 border">Previous</button>
          <div className="px-3 py-2">{page}/{totalPages}</div>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-2 border">Next</button>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold">Search</h3>
          <p className="text-sm text-gray-500">Search by title or excerpt in the admin.</p>
        </div>
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold">Recent</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {articles.slice(0,6).map(a=> <li key={a.id}><a className="text-pink-600 font-semibold" href={`#article-${a.id}`}>{a.title}</a></li>)}
          </ul>
        </div>
        <div className="bg-white border p-4 rounded">
          <a href="#admin" className="font-semibold">Admin Dashboard</a>
        </div>
      </aside>
    </div>
  )
}
