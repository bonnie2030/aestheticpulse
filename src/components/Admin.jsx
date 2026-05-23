import React, { useState } from 'react'
import { toDataURL } from '../utils/helpers'

export default function Admin({articles, onSave}){
  const [form, setForm] = useState({id:'', title:'', excerpt:'', content:'', image:'', category:'Outfits'})

  function edit(a){ setForm(a) }

  async function handleSubmit(e){
    e.preventDefault()
    let img = form.image
    if(typeof img === 'object' && img instanceof File){ img = await toDataURL(img) }
    const obj = { id: form.id || Date.now(), title: form.title, excerpt: form.excerpt, content: form.content, image: img || '', category: form.category, date: new Date().toISOString() }
    const updated = [...articles]
    const i = updated.findIndex(x=>String(x.id)===String(obj.id))
    if(i>=0) updated[i] = obj; else updated.unshift(obj)
    onSave(updated)
    setForm({id:'', title:'', excerpt:'', content:'', image:'', category:'Outfits'})
  }

  function remove(id){ if(!confirm('Delete?')) return; const updated = articles.filter(a=>String(a.id)!==String(id)); onSave(updated) }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white border p-6 rounded">
        <h2 className="text-xl font-bold mb-4">Create / Edit Article</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" value={form.id} />
          <div><label className="block text-sm font-semibold">Title</label><input className="w-full border p-2" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>
          <div><label className="block text-sm font-semibold">Category</label><select className="w-full border p-2" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Outfits</option><option>Hairstyles</option><option>Tattoos</option><option>Nails</option><option>Facial Care Tips</option></select></div>
          <div><label className="block text-sm font-semibold">Excerpt</label><textarea className="w-full border p-2" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} /></div>
          <div><label className="block text-sm font-semibold">Content (HTML allowed)</label><textarea rows={8} className="w-full border p-2" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} required/></div>
          <div><label className="block text-sm font-semibold">Image</label><input type="file" accept="image/*" onChange={e=>setForm({...form,image:e.target.files[0]})} /></div>
          <div className="flex gap-3"><button className="px-4 py-2 bg-black text-white">Save</button><button type="button" onClick={()=>setForm({id:'', title:'', excerpt:'', content:'', image:'', category:'Outfits'})} className="px-4 py-2 border">Reset</button></div>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold">Existing Articles</h3>
          <div className="mt-3 space-y-2">
            {articles.map(a=> (
              <div key={a.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm text-gray-500">{a.category} • {new Date(a.date).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>edit(a)} className="px-2 py-1 border">Edit</button>
                  <button onClick={()=>remove(a.id)} className="px-2 py-1 bg-red-50 text-red-600 border">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
