import React, { useState, useRef } from 'react'
import { toDataURL } from '../utils/helpers'

const emptyForm = { id:'', title:'', excerpt:'', content:'', images:[], featuredIndex:0, imageUrl:'', category:'Outfits' }

export default function Admin({articles, onSave}){
  const [form, setForm] = useState(emptyForm)
  const pasteRef = useRef()

  function edit(a){
    const imgs = a.images && a.images.length ? a.images : (a.image ? [a.image] : [])
    setForm({...emptyForm, ...a, images: imgs, featuredIndex: imgs.length? imgs.findIndex(x=>x===a.image) : 0})
    // focus paste area for convenience
    setTimeout(()=>pasteRef.current?.focus(),50)
  }

  async function handleFileInput(e){
    const files = Array.from(e.target.files || [])
    if(!files.length) return
    const data = await Promise.all(files.map(f=> toDataURL(f)))
    setForm(prev=>({...prev, images: [...prev.images, ...data]}))
  }

  async function addImageUrl(){
    const url = (form.imageUrl||'').trim()
    if(!url) return
    setForm(prev=>({...prev, images:[...prev.images, url], imageUrl:''}))
  }

  async function handlePaste(e){
    const items = e.clipboardData && e.clipboardData.items ? Array.from(e.clipboardData.items) : []
    for(const it of items){
      if(it.kind === 'file' && it.type.startsWith('image/')){
        const f = it.getAsFile()
        if(f){
          const data = await toDataURL(f)
          setForm(prev=>({...prev, images:[...prev.images, data]}))
        }
      }
    }
  }

  function removeImage(idx){ setForm(prev=>({...prev, images: prev.images.filter((_,i)=>i!==idx), featuredIndex: Math.max(0, Math.min(prev.featuredIndex, prev.images.length-2)) })) }

  async function handleSubmit(e){
    e.preventDefault()
    const selected = form.images && form.images.length ? form.images[form.featuredIndex||0] : ''
    const obj = { id: form.id || Date.now(), title: form.title, excerpt: form.excerpt, content: form.content, image: selected || '', images: form.images, category: form.category, date: new Date().toISOString() }
    const updated = [...articles]
    const i = updated.findIndex(x=>String(x.id)===String(obj.id))
    if(i>=0) updated[i] = obj; else updated.unshift(obj)
    onSave(updated)
    setForm(emptyForm)
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

          <div>
            <label className="block text-sm font-semibold">Images (upload, paste, or URL)</label>
            <div className="flex gap-2 items-center mb-2">
              <input type="file" accept="image/*" multiple onChange={handleFileInput} />
              <input className="border p-2 flex-1" placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} />
              <button type="button" onClick={addImageUrl} className="px-3 py-1 border">Add</button>
            </div>
            <div ref={pasteRef} tabIndex={0} onPaste={handlePaste} className="border border-dashed p-3 text-sm text-gray-500 rounded">Paste an image here (Ctrl+V) or use file upload</div>

            {form.images && form.images.length>0 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {form.images.map((img,idx)=> (
                  <div key={idx} className="relative border rounded overflow-hidden">
                    <img src={img} alt={`img-${idx}`} className="w-full h-28 object-cover" />
                    <div className="p-1 flex items-center justify-between bg-white/60">
                      <label className="text-sm"><input type="radio" name="featured" checked={form.featuredIndex===idx} onChange={()=>setForm(prev=>({...prev, featuredIndex:idx}))} /> <span className="ml-1">Use</span></label>
                      <button type="button" onClick={()=>removeImage(idx)} className="text-xs text-red-600 px-2">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3"><button className="px-4 py-2 bg-black text-white">Save</button><button type="button" onClick={()=>setForm(emptyForm)} className="px-4 py-2 border">Reset</button></div>
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
