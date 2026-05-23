import React from 'react'

export default function ArticleDetail({id, articles}){
  const a = articles.find(x=>String(x.id)===String(id))
  if(!a) return (<div>Article not found. <a href="#home">Back</a></div>)
  return (
    <article className="bg-white border rounded p-8">
      <button className="mb-4" onClick={()=>location.hash='#home'}>← Back to Home</button>
      <div className="text-sm text-gray-500">{a.category} • {new Date(a.date).toLocaleDateString()}</div>
      <h1 className="text-3xl font-bold mt-2">{a.title}</h1>
      {a.introduction && <p className="text-lg text-gray-700 mt-4">{a.introduction}</p>}
      {a.image && <img src={a.image} alt={a.title} className="w-full h-80 object-cover rounded mt-6" />}

      <div className="prose max-w-none mt-6" dangerouslySetInnerHTML={{__html: a.content}} />

      {a.subArticles && a.subArticles.length>0 && (
        <section className="mt-8 space-y-8">
          {a.subArticles.map((s,idx)=> (
            <div key={idx} className="border-t pt-6">
              <h3 className="text-xl font-semibold">{`Part ${idx+1}`}</h3>
              {s.explanation && <p className="text-gray-700 mt-2">{s.explanation}</p>}
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
    </article>
  )
}
