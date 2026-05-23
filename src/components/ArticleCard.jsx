import React from 'react'

export default function ArticleCard({a}){
  return (
    <div className="relative">
      <div className="absolute -inset-3 bg-black opacity-80 transform translate-x-2 translate-y-2 rounded"></div>
      <article className="relative bg-white border rounded overflow-hidden grid grid-cols-3">
        <img src={a.image} alt={a.title} className="col-span-1 w-full h-56 object-cover" />
        <div className="col-span-2 p-6 flex flex-col justify-center">
          <div className="text-sm text-gray-500">{a.category} • {new Date(a.date).toLocaleDateString()}</div>
          <h3 className="text-xl font-bold mt-2">{a.title}</h3>
          <p className="text-gray-600 mt-3 line-clamp-3">{a.excerpt}</p>
          <div className="mt-4"><a className="inline-block bg-white border-2 border-black px-4 py-2 font-bold uppercase shadow-sm" href={`#article-${a.id}`}>Read More</a></div>
        </div>
      </article>
    </div>
  )
}
