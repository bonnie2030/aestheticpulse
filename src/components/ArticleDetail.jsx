import React from 'react'

export default function ArticleDetail({id, articles}){
  const a = articles.find(x=>String(x.id)===String(id))
  if(!a) return (<div>Article not found. <a href="#home">Back</a></div>)
  return (
    <article className="bg-white border rounded p-8">
      <button className="mb-4" onClick={()=>location.hash='#home'}>← Back to Home</button>
      <div className="text-sm text-gray-500">{a.category} • {new Date(a.date).toLocaleDateString()}</div>
      <h1 className="text-3xl font-bold mt-2">{a.title}</h1>
      {a.image && <img src={a.image} alt={a.title} className="w-full h-80 object-cover rounded mt-6" />}
      <div className="prose max-w-none mt-6" dangerouslySetInnerHTML={{__html: a.content}} />
    </article>
  )
}
