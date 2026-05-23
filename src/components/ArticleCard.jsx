import React from 'react'

export default function ArticleCard({a}){
  return (
    <div className="relative perspective-800">
      <article className="futuristic-card relative grid grid-cols-3 items-stretch overflow-hidden">
        <div className="col-span-1 relative">
          <img src={a.image} alt={a.title} className="w-full h-full object-cover block" />
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 text-white text-xs rounded backdrop-blur-sm">{a.category}</div>
        </div>
        <div className="col-span-2 p-6 flex flex-col justify-center">
          <div className="text-sm text-gray-300">{new Date(a.date).toLocaleDateString()}</div>
          <h3 className="text-2xl font-extrabold mt-2 text-white leading-tight">{a.title}</h3>
          <p className="text-gray-300 mt-3 line-clamp-3">{a.excerpt}</p>
          <div className="mt-6">
            <a className="neon-btn inline-flex items-center gap-3 px-4 py-2 rounded-md font-semibold" href={`#article-${a.id}`}>
              <span className="w-3 h-3 bg-pink-400 rounded-full shadow-[0_0_8px_rgba(255,122,162,0.6)]"></span>
              Read More
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
