import React, { useState, useRef, useEffect } from 'react'
import { toDataURL } from '../utils/helpers'

const emptyForm = { id:'', title:'', introduction:'', excerpt:'', content:'', images:[], featuredIndex:0, imageUrl:'', subArticles:[], category:'Outfits' }

export default function Admin({articles, onSave}){
  const [form, setForm] = useState(emptyForm)
  const pasteRef = useRef()
  const [subForm, setSubForm] = React.useState({ explanation:'', images:[], imageUrl:'' })
  const subPasteRef = useRef()

  function edit(a){
    const imgs = a.images && a.images.length ? a.images : (a.image ? [a.image] : [])
    setForm({...emptyForm, ...a, images: imgs, featuredIndex: imgs.length? imgs.findIndex(x=>x===a.image) : 0, subArticles: a.subArticles || []})
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

  // Cover image helpers (sets featured at index 0)
  async function handleCoverFile(e){
    const f = (e.target.files && e.target.files[0])
    if(!f) return
    const data = await toDataURL(f)
    setForm(prev=>({...prev, images:[data, ...prev.images], featuredIndex:0}))
  }

  function addCoverUrl(url){
    const u = (url||'').trim()
    if(!u) return
    setForm(prev=>({...prev, images:[u, ...prev.images], featuredIndex:0, imageUrl:''}))
  }

  // Sub-article helpers
  async function subHandleFileInput(e){
    const files = Array.from(e.target.files || [])
    if(!files.length) return
    const data = await Promise.all(files.map(f=> toDataURL(f)))
    setSubForm(prev=>({...prev, images: [...prev.images, ...data].slice(0,4)}))
  }

  async function subAddImageUrl(){
    const url = (subForm.imageUrl||'').trim()
    if(!url) return
    setSubForm(prev=>({...prev, images:[...prev.images, url].slice(0,4), imageUrl:''}))
  }

  async function subHandlePaste(e){
    const items = e.clipboardData && e.clipboardData.items ? Array.from(e.clipboardData.items) : []
    for(const it of items){
      if(it.kind === 'file' && it.type.startsWith('image/')){
        const f = it.getAsFile()
        if(f){
          const data = await toDataURL(f)
          setSubForm(prev=>({...prev, images:[...prev.images, data].slice(0,4)}))
        }
      }
    }
  }

  function subRemoveImage(idx){ setSubForm(prev=>({...prev, images: prev.images.filter((_,i)=>i!==idx)})) }

  function addSubArticle(){
    if(!subForm.explanation && !subForm.images.length) return
    setForm(prev=>({...prev, subArticles: [...prev.subArticles, {...subForm}]}))
    setSubForm({ explanation:'', images:[], imageUrl:'' })
    setTimeout(()=>subPasteRef.current?.focus(),50)
  }

  function removeSubArticle(idx){ setForm(prev=>({...prev, subArticles: prev.subArticles.filter((_,i)=>i!==idx)})) }

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

  // Global paste handler: if image data is pasted anywhere, add to the focused image area
  useEffect(()=>{
    async function onDocPaste(e){
      const items = e.clipboardData && e.clipboardData.items ? Array.from(e.clipboardData.items) : []
      const imgs = []
      for(const it of items){
        if(it.kind === 'file' && it.type.startsWith('image/')){
          const f = it.getAsFile()
          if(f){
            const data = await toDataURL(f)
            imgs.push(data)
          }
        }
      }
      if(!imgs.length) return
      // If sub paste area is focused, add to subForm (limit 4)
      const active = document.activeElement
      if(subPasteRef.current && subPasteRef.current.contains(active)){
        setSubForm(prev=>({...prev, images:[...prev.images, ...imgs].slice(0,4)}))
        e.preventDefault()
        return
      }
      // If main paste area is focused, add to main images
      if(pasteRef.current && pasteRef.current.contains(active)){
        setForm(prev=>({...prev, images:[...prev.images, ...imgs]}))
        e.preventDefault()
        return
      }
      // Default: add to main images
      setForm(prev=>({...prev, images:[...prev.images, ...imgs]}))
      e.preventDefault()
    }
    document.addEventListener('paste', onDocPaste)
    return ()=>document.removeEventListener('paste', onDocPaste)
  },[])

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
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold">Title</label>
              <input className="w-full border p-2" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
            </div>
            <div className="w-44">
              <label className="block text-sm font-semibold">Cover Image (card front)</label>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={handleCoverFile} className="text-sm" />
              </div>
              <div className="flex gap-2 mt-2">
                <input className="border p-2 flex-1 text-sm" placeholder="Cover image URL" value={form.imageUrl||''} onChange={e=>setForm({...form,imageUrl:e.target.value})} />
                <button type="button" onClick={()=>addCoverUrl(form.imageUrl)} className="px-2 py-1 border text-sm">Use</button>
              </div>
              <div className="mt-2">
                {form.images && form.images[form.featuredIndex] && (
                  <img src={form.images[form.featuredIndex]} alt="cover-preview" className="w-full h-24 object-cover rounded border" />
                )}
              </div>
            </div>
          </div>
          <div className="mt-2"><label className="block text-sm font-semibold">Introduction (statement below title)</label><input className="w-full border p-2" value={form.introduction} onChange={e=>setForm({...form,introduction:e.target.value})} /></div>
          <div><label className="block text-sm font-semibold">Category</label><select className="w-full border p-2" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Outfits</option><option>Hairstyles</option><option>Tattoos</option><option>Nails</option><option>Facial Care Tips</option></select></div>
          {(!(form.introduction||'').trim()) && (
            <div><label className="block text-sm font-semibold">Excerpt</label><textarea className="w-full border p-2" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} /></div>
          )}
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

          {/* Sub-articles section */}
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Sub-Articles</h3>
            <p className="text-sm text-gray-500 mb-3">Each sub-article has a short explanation and up to 4 images. Add one, then proceed to the next.</p>

            <div className="mb-3">
              <label className="block text-sm font-semibold">Sub-article explanation</label>
              <textarea rows={3} className="w-full border p-2" value={subForm.explanation} onChange={e=>setSubForm(prev=>({...prev, explanation:e.target.value}))} />
            </div>

            <div>
              <div className="flex gap-2 items-center mb-2">
                <input type="file" accept="image/*" multiple onChange={subHandleFileInput} />
                <input className="border p-2 flex-1" placeholder="Image URL for sub-article" value={subForm.imageUrl} onChange={e=>setSubForm(prev=>({...prev,imageUrl:e.target.value}))} />
                <button type="button" onClick={subAddImageUrl} className="px-3 py-1 border">Add</button>
              </div>
              <div ref={subPasteRef} tabIndex={0} onPaste={subHandlePaste} className="border border-dashed p-3 text-sm text-gray-500 rounded mb-3">Paste images here (Ctrl+V) or upload (max 4)</div>

              {subForm.images && subForm.images.length>0 && (
                <div className="mb-2 grid grid-cols-4 gap-2">
                  {subForm.images.map((img,idx)=> (
                    <div key={idx} className="relative border rounded overflow-hidden">
                      <img src={img} alt={`sub-img-${idx}`} className="w-full h-24 object-cover" />
                      <button type="button" onClick={()=>subRemoveImage(idx)} className="absolute top-1 right-1 bg-white/80 text-red-600 px-2 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={addSubArticle} className="px-4 py-2 bg-black text-white">Add Sub-article</button>
                <div className="text-sm text-gray-600 self-center">{form.subArticles.length} sub-articles added</div>
              </div>
            </div>

            {form.subArticles && form.subArticles.length>0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Sub-articles Preview</h4>
                <div className="space-y-3">
                  {form.subArticles.map((s,idx)=> (
                    <div key={idx} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">Sub {idx+1}</div>
                          <div className="text-sm text-gray-700 mt-1">{s.explanation}</div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={()=>removeSubArticle(idx)} className="px-2 py-1 border">Remove</button>
                        </div>
                      </div>
                      {s.images && s.images.length>0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {s.images.map((im,ii)=> <img key={ii} src={im} className="w-full h-20 object-cover rounded"/>) }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
