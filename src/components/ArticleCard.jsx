import React from 'react'

function stripHtml(html){
  return String(html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export default function ArticleCard({a}){
  return (
    <div className="relative">
      <article className="futuristic-card relative grid grid-cols-1 md:grid-cols-3 items-stretch overflow-hidden">
        <div className="col-span-1 relative h-64 sm:h-72 md:h-full">
          <a href={`#article-${a.id}`} aria-label={`Open ${a.title}`} className="block h-full">
            <img src={a.image} alt={a.title} className="w-full h-full object-cover block" />
          </a>
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/70 text-gray-700 text-xs rounded backdrop-blur-sm">{a.category}</div>
        </div>
        <div className="col-span-2 p-4 md:p-6 flex flex-col justify-center">
          <div className="text-sm text-gray-500">{new Date(a.date).toLocaleDateString()}</div>
          <h3 className="text-xl md:text-2xl font-extrabold mt-2 text-gray-900 leading-tight">
            <a href={`#article-${a.id}`} className="no-underline text-inherit" aria-label={`Open ${a.title}`}>{a.title}</a>
          </h3>
          <p className="text-gray-600 mt-3 line-clamp-3">{stripHtml(a.introduction && a.introduction.trim() ? a.introduction : a.excerpt)}</p>
          <div className="mt-6">
            <a className="neon-btn inline-flex items-center gap-3 px-4 py-2 rounded-md font-semibold" href={`#article-${a.id}`}>
              <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
              Read More
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
