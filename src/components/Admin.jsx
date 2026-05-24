import React, { useState, useRef, useEffect } from 'react'
import { toDataURL } from '../utils/helpers'

const emptyForm = { id:'', title:'', introduction:'', excerpt:'', content:'', images:[], featuredIndex:0, imageUrl:'', subArticles:[], category:'Outfits' }
const FONT_CHOICES = [
  { label: 'Inter', value: 'Inter, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: 'Times New Roman, serif' },
  { label: 'Courier', value: 'Courier New, monospace' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
]

export default function Admin({articles, onSave}){
  const [form, setForm] = useState(emptyForm)
  const pasteRef = useRef()
  const introRef = useRef()
  const contentRef = useRef()
  const [subForm, setSubForm] = React.useState({ explanation:'', images:[], imageUrl:'' })
  const subExpRef = useRef()
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

  function exec(cmd, value = null){
    if(contentRef.current){ contentRef.current.focus() }
    document.execCommand(cmd, false, value)
    setForm(prev=>({...prev, content: contentRef.current ? contentRef.current.innerHTML : prev.content}))
  }

  function execIntro(cmd, value = null){
    if(introRef.current){ introRef.current.focus() }
    document.execCommand(cmd, false, value)
    setForm(prev=>({...prev, introduction: introRef.current ? introRef.current.innerHTML : prev.introduction}))
  }

  function execSub(cmd, value = null){
    if(subExpRef.current){ subExpRef.current.focus() }
    document.execCommand(cmd, false, value)
    setSubForm(prev=>({...prev, explanation: subExpRef.current ? subExpRef.current.innerHTML : prev.explanation}))
  }

  useEffect(()=>{
    if(introRef.current && introRef.current.innerHTML !== (form.introduction || '')){
      introRef.current.innerHTML = form.introduction || ''
    }
    if(contentRef.current && contentRef.current.innerHTML !== (form.content || '')){
      contentRef.current.innerHTML = form.content || ''
    }
  },[form.content, form.introduction])

  useEffect(()=>{
    if(subExpRef.current && subExpRef.current.innerHTML !== (subForm.explanation || '')){
      subExpRef.current.innerHTML = subForm.explanation || ''
    }
  },[subForm.explanation])

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
    const pendingImageUrl = (form.imageUrl || '').trim()
    const images = [...(form.images || [])]
    if(pendingImageUrl && !images.includes(pendingImageUrl)){
      images.push(pendingImageUrl)
    }
    const selected = images.length ? images[Math.max(0, Math.min(form.featuredIndex || 0, images.length - 1))] : ''
    const saveExcerpt = (form.introduction||'').trim() ? '' : (form.excerpt||'')
    const obj = {
      id: form.id || Date.now(),
      title: form.title,
      introduction: form.introduction || '',
      excerpt: saveExcerpt,
      content: form.content,
      image: selected || '',
      images,
      subArticles: form.subArticles || [],
      category: form.category,
      date: new Date().toISOString()
    }
    const updated = [...articles]
    const i = updated.findIndex(x=>String(x.id)===String(obj.id))
    if(i>=0) updated[i] = obj; else updated.unshift(obj)
    onSave(updated)
    setForm(emptyForm)
  }

  function remove(id){ if(!confirm('Delete?')) return; const updated = articles.filter(a=>String(a.id)!==String(id)); onSave(updated) }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm p-5 lg:p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold">Create / Edit Article</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Admin only</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" value={form.id} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold">Category</label>
              <select className="w-full border p-2 rounded-md" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Outfits</option><option>Hairstyles</option><option>Tattoos</option><option>Nails</option><option>Facial Care Tips</option></select>
            </div>
            <div className="text-sm text-gray-500 flex items-end">Pick the category first, then write the title.</div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold">Title</label>
              <input className="w-full border p-2 rounded-md" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-sm font-semibold">Cover Image (card front)</label>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={handleCoverFile} className="text-sm" />
              </div>
              <div className="flex gap-2 mt-2">
                <input className="border p-2 flex-1 text-sm rounded-md" placeholder="Cover image URL" value={form.imageUrl||''} onChange={e=>setForm({...form,imageUrl:e.target.value})} />
                <button type="button" onClick={()=>addCoverUrl(form.imageUrl)} className="px-2 py-1 border text-sm rounded-md">Use</button>
              </div>
              <div className="mt-2">
                {form.images && form.images[form.featuredIndex] && (
                  <img src={form.images[form.featuredIndex]} alt="cover-preview" className="w-full h-24 object-cover rounded border" />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
              <label className="block text-sm font-semibold">Introduction (statement below title)</label>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={()=>execIntro('bold')} className="px-3 py-1 border rounded-md bg-white font-semibold">B</button>
                <button type="button" onClick={()=>execIntro('underline')} className="px-3 py-1 border rounded-md bg-white underline">U</button>
                <button type="button" onClick={()=>execIntro('italic')} className="px-3 py-1 border rounded-md bg-white italic">I</button>
                <select defaultValue="" onChange={e=>{ if(e.target.value) execIntro('formatBlock', e.target.value); e.target.value=''; }} className="px-3 py-2 border rounded-md bg-white text-sm">
                  <option value="" disabled>Heading</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="p">Paragraph</option>
                </select>
                <select defaultValue="" onChange={e=>{ if(e.target.value) execIntro('fontName', e.target.value); e.target.value=''; }} className="px-3 py-2 border rounded-md bg-white text-sm">
                  <option value="" disabled>Font</option>
                  {FONT_CHOICES.map(font => <option key={font.label} value={font.value}>{font.label}</option>)}
                </select>
                <button type="button" onClick={()=>execIntro('removeFormat')} className="px-3 py-1 border rounded-md bg-white text-sm">Clear</button>
              </div>
              <div
                ref={introRef}
                contentEditable
                suppressContentEditableWarning
                onInput={e=>setForm({...form, introduction: e.currentTarget.innerHTML})}
                className="min-h-[96px] w-full border rounded-md bg-white p-3 outline-none prose max-w-none"
                style={{fontFamily: 'Inter, Arial, sans-serif'}}
              />
              <p className="text-xs text-gray-500">This line appears under the title on the card and article page.</p>
            </div>
            <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={()=>exec('bold')} className="px-3 py-1 border rounded-md bg-white font-semibold">B</button>
                <button type="button" onClick={()=>exec('underline')} className="px-3 py-1 border rounded-md bg-white underline">U</button>
                <button type="button" onClick={()=>exec('italic')} className="px-3 py-1 border rounded-md bg-white italic">I</button>

                <select defaultValue="" onChange={e=>{ if(e.target.value) exec('formatBlock', e.target.value); e.target.value=''; }} className="px-3 py-2 border rounded-md bg-white text-sm">
                  <option value="" disabled>Heading</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="p">Paragraph</option>
                </select>

                <select defaultValue="" onChange={e=>{ if(e.target.value) exec('fontName', e.target.value); e.target.value=''; }} className="px-3 py-2 border rounded-md bg-white text-sm">
                  <option value="" disabled>Font</option>
                  {FONT_CHOICES.map(font => <option key={font.label} value={font.value}>{font.label}</option>)}
                </select>

                <button type="button" onClick={()=>exec('removeFormat')} className="px-3 py-1 border rounded-md bg-white text-sm">Clear</button>
              </div>

              <label className="block text-sm font-semibold">Content</label>
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={e=>setForm({...form, content: e.currentTarget.innerHTML})}
                className="min-h-[220px] w-full border rounded-md bg-white p-3 outline-none prose max-w-none"
                style={{fontFamily: 'Inter, Arial, sans-serif'}}
              />
              <p className="text-xs text-gray-500">Highlight text first, then use the toolbar to style it.</p>
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
            <label className="block text-sm font-semibold">Images (upload, paste, or URL)</label>
            <div className="flex gap-2 items-center mb-2">
              <input type="file" accept="image/*" multiple onChange={handleFileInput} />
              <input className="border p-2 flex-1 rounded-md" placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} />
              <button type="button" onClick={addImageUrl} className="px-3 py-1 border rounded-md">Add</button>
            </div>
            <div ref={pasteRef} tabIndex={0} onPaste={handlePaste} className="border border-dashed p-3 text-sm text-gray-500 rounded-lg bg-white">Paste an image here (Ctrl+V) or use file upload</div>

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
          <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
            <div>
              <h3 className="font-semibold">Sub-Articles</h3>
              <p className="text-sm text-gray-500 mt-1">Each sub-article has a short explanation and up to 4 images. Add one, then proceed to the next.</p>
            </div>

            <div className="mb-3 rounded-xl border bg-white p-4 space-y-3">
              <label className="block text-sm font-semibold">Sub-article explanation</label>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={()=>execSub('bold')} className="px-3 py-1 border rounded-md bg-gray-50 font-semibold">B</button>
                <button type="button" onClick={()=>execSub('underline')} className="px-3 py-1 border rounded-md bg-gray-50 underline">U</button>
                <button type="button" onClick={()=>execSub('italic')} className="px-3 py-1 border rounded-md bg-gray-50 italic">I</button>
                <select defaultValue="" onChange={e=>{ if(e.target.value) execSub('formatBlock', e.target.value); e.target.value=''; }} className="px-3 py-2 border rounded-md bg-white text-sm">
                  <option value="" disabled>Heading</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="p">Paragraph</option>
                </select>
                <select defaultValue="" onChange={e=>{ if(e.target.value) execSub('fontName', e.target.value); e.target.value=''; }} className="px-3 py-2 border rounded-md bg-white text-sm">
                  <option value="" disabled>Font</option>
                  {FONT_CHOICES.map(font => <option key={font.label} value={font.value}>{font.label}</option>)}
                </select>
                <button type="button" onClick={()=>execSub('removeFormat')} className="px-3 py-1 border rounded-md bg-gray-50 text-sm">Clear</button>
              </div>
              <div
                ref={subExpRef}
                contentEditable
                suppressContentEditableWarning
                onInput={e=>setSubForm(prev=>({...prev, explanation: e.currentTarget.innerHTML}))}
                className="min-h-[90px] w-full border rounded-md bg-white p-3 outline-none prose max-w-none"
                style={{fontFamily: 'Inter, Arial, sans-serif'}}
              />
            </div>

            <div>
              <div className="flex gap-2 items-center mb-2">
                <input type="file" accept="image/*" multiple onChange={subHandleFileInput} />
                <input className="border p-2 flex-1 rounded-md" placeholder="Image URL for sub-article" value={subForm.imageUrl} onChange={e=>setSubForm(prev=>({...prev,imageUrl:e.target.value}))} />
                <button type="button" onClick={subAddImageUrl} className="px-3 py-1 border rounded-md">Add</button>
              </div>
              <div ref={subPasteRef} tabIndex={0} onPaste={subHandlePaste} className="border border-dashed p-3 text-sm text-gray-500 rounded-lg mb-3 bg-white">Paste images here (Ctrl+V) or upload (max 4)</div>

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

              <div className="flex gap-2 items-center">
                <button type="button" onClick={addSubArticle} className="px-4 py-2 bg-black text-white rounded-md">Add Sub-article</button>
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

          <div className="flex gap-3 pt-2">
            <button className="px-4 py-2 bg-black text-white rounded-md">Save</button>
            <button type="button" onClick={()=>setForm(emptyForm)} className="px-4 py-2 border rounded-md">Reset</button>
          </div>
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
