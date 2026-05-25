import React, { useState, useRef, useEffect } from 'react'
import { uploadImage } from '../utils/imageStorage'

const emptyForm = { id:'', title:'', introduction:'', excerpt:'', content:'', coverImage:'', coverImageUrl:'', images:[], imageUrl:'', subArticles:[], category:'Outfits' }
const FONT_CHOICES = [
  { label: 'Inter (Sans)', value: 'Inter, Roboto, Arial, sans-serif' },
  { label: 'Merriweather (Serif)', value: 'Merriweather, Georgia, serif' },
  { label: 'Lora (Serif)', value: 'Lora, Georgia, serif' },
  { label: 'Libre Baskerville (Serif)', value: 'Libre Baskerville, Georgia, serif' },
  { label: 'Spectral (Serif)', value: 'Spectral, Georgia, serif' },
  { label: 'Roboto (Sans)', value: 'Roboto, Inter, Arial, sans-serif' },
  { label: 'Georgia (System Serif)', value: 'Georgia, serif' },
  { label: 'Times New Roman (System Serif)', value: 'Times New Roman, serif' },
  { label: 'Courier New (Monospace)', value: 'Courier New, monospace' },
]

export default function Admin({articles, onSave, onLogout}){
  const [form, setForm] = useState(emptyForm)
  const [syncStatus, setSyncStatus] = useState({ kind:'idle', text:'' })
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(0)
  const introRef = useRef()
  const contentRef = useRef()

  function edit(a){
    setForm({
      ...emptyForm,
      ...a,
      coverImage: a.image || '',
      coverImageUrl: '',
      images: Array.isArray(a.images) ? a.images : [],
      imageUrl: '',
      subArticles: a.subArticles || []
    })
    setTimeout(()=>contentRef.current?.focus(),50)
  }

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

  useEffect(()=>{
    if(introRef.current && introRef.current.innerHTML !== (form.introduction || '')){
      introRef.current.innerHTML = form.introduction || ''
    }
    if(contentRef.current && contentRef.current.innerHTML !== (form.content || '')){
      contentRef.current.innerHTML = form.content || ''
    }
  },[form.content, form.introduction])

  async function handleContentPaste(e){
    const items = e.clipboardData && e.clipboardData.items ? Array.from(e.clipboardData.items) : []
    const imageItem = items.find(it => it.kind === 'file' && it.type.startsWith('image/'))
    if(!imageItem) return

    const file = imageItem.getAsFile()
    if(!file) return

    e.preventDefault()
    contentRef.current?.focus()
    
    // Show uploading state
    setUploadingImages(prev => prev + 1)
    const originalSize = file.size
    document.execCommand('insertHTML', false, `<img src="" alt="uploading..." style="opacity:0.5;border:1px dashed #ccc;border-radius:4px;" />`)
    
    try {
      const imageUrl = await uploadImage(file)
      // Replace placeholder with actual URL and remove uploading style
      const html = contentRef.current.innerHTML.replace('src=""', `src="${imageUrl}"`).replace('style="opacity:0.5;border:1px dashed #ccc;border-radius:4px;"', '')
      contentRef.current.innerHTML = html
      setForm(prev=>({...prev, content: contentRef.current ? contentRef.current.innerHTML : prev.content}))
      
      // Show compression success message
      setSyncStatus({ kind:'success', text: `Image uploaded (compressed: ${Math.round(originalSize/1024)}KB → stored optimized)` })
      setTimeout(() => setSyncStatus({ kind:'idle', text: '' }), 3000)
    } catch(err) {
      console.error('Image upload failed:', err)
      setSyncStatus({ kind:'error', text: 'Image upload failed. Reverting...' })
      document.execCommand('undo')
    } finally {
      setUploadingImages(prev => Math.max(0, prev - 1))
    }
  }

  // Helper: wrap current selection with a span style (used for font-size changes)
  function applyStyleToSelection(styleString){
    const sel = window.getSelection()
    if(!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const selectedHtml = range.cloneContents()
    const wrapper = document.createElement('span')
    wrapper.setAttribute('style', styleString)
    wrapper.appendChild(selectedHtml)
    range.deleteContents()
    range.insertNode(wrapper)
    // move caret after the inserted node
    sel.removeAllRanges()
    const newRange = document.createRange()
    newRange.setStartAfter(wrapper)
    newRange.collapse(true)
    sel.addRange(newRange)
    // sync content state
    setForm(prev=>({...prev, content: contentRef.current ? contentRef.current.innerHTML : prev.content, introduction: introRef.current ? introRef.current.innerHTML : prev.introduction}))
  }

  function changeSelectionFontSize(deltaPx = 2){
    const sel = window.getSelection()
    if(!sel || sel.rangeCount === 0) return
    let node = sel.focusNode && (sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode)
    if(!node) return
    const cs = window.getComputedStyle(node)
    const current = parseFloat(cs.fontSize) || 16
    const newSize = Math.max(10, Math.round(current + deltaPx))
    applyStyleToSelection(`font-size:${newSize}px;line-height:1.4;`)
  }

  function handleEditorKeydown(e){
    if(!(e.ctrlKey || e.metaKey)) return
    const key = e.key.toLowerCase()
    if(key === 'b'){
      e.preventDefault()
      exec('bold')
    }else if(key === ']' || (e.shiftKey && key === '>')){
      e.preventDefault()
      changeSelectionFontSize(2)
    }else if(key === '[' || (e.shiftKey && key === '<')){
      e.preventDefault()
      changeSelectionFontSize(-2)
    }
  }

  async function handleSubmit(e){
    e.preventDefault()
    if(isSaving) return
    setIsSaving(true)
    
    const pendingImageUrl = (form.imageUrl || '').trim()
    const images = [...(form.images || [])]
    if(pendingImageUrl && !images.includes(pendingImageUrl)){
      images.push(pendingImageUrl)
    }
    const selected = form.coverImage || images[0] || ''
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
    
    // Estimate payload size and time
    const payloadSize = JSON.stringify(obj).length
    const estimatedDelay = Math.max(1000, Math.ceil(payloadSize / 50000) * 1000)
    const estimatedTimeSeconds = Math.ceil((estimatedDelay + (articles.length * 1000)) / 1000)
    
    // Warn only if article is extremely large (3MB+) - images should be auto-compressed
    if(payloadSize > 3 * 1024 * 1024){
      setSyncStatus({ kind:'error', text: `⚠️ Article is extremely large (${Math.round(payloadSize/1024/1024)}MB). Check that images were compressed. Try splitting into sub-articles.` })
      setIsSaving(false)
      return
    }
    
    setSyncStatus({ kind:'saving', text: `Publishing: estimating ${estimatedTimeSeconds}s with ${articles.length} total articles...` })
    
    const updated = [...articles]
    const i = updated.findIndex(x=>String(x.id)===String(obj.id))
    if(i>=0) updated[i] = obj; else updated.unshift(obj)
    try{
      setSyncStatus({ kind:'saving', text:`Publishing: saving article 1 of ${updated.length}... (est. ${estimatedTimeSeconds}s)` })
      const res = await onSave(updated)
      if(res && res.error){
        setSyncStatus({ kind:'error', text: `Publish failed: ${String(res.error.message || res.error)}` })
      }else if(res && res.remoteSaved === false){
        setSyncStatus({ kind:'error', text: 'Published locally but failed to sync to remote.' })
      }else{
        setSyncStatus({ kind:'success', text:'Published. Synced.' })
      }
    }catch(e){
      setSyncStatus({ kind:'error', text: `Publish failed: ${String(e.message || e)}` })
    }finally{
      setIsSaving(false)
    }
    setForm(emptyForm)
  }

  async function remove(id){
    if(!confirm('Delete?')) return
    if(isSaving) return
    setIsSaving(true)
    setSyncStatus({ kind:'saving', text:'Deleting article...' })
    const updated = articles.filter(a=>String(a.id)!==String(id))
    try{
      const res = await onSave(updated)
      if(res && res.error){
        setSyncStatus({ kind:'error', text: `Delete failed: ${String(res.error.message || res.error)}` })
      }else if(res && res.remoteSaved === false){
        setSyncStatus({ kind:'error', text: 'Deleted locally but failed to sync to remote.' })
      }else{
        setSyncStatus({ kind:'success', text:'Deleted. Synced.' })
      }
    }catch(e){
      setSyncStatus({ kind:'error', text: `Delete failed: ${String(e.message || e)}` })
    }finally{
      setIsSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm p-5 lg:p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold">Create / Edit Article</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Admin only</span>
            {onLogout && (
              <button onClick={onLogout} className="text-xs px-3 py-1 border rounded-full text-gray-700 hover:border-pink-300 hover:text-pink-600">
                Log out
              </button>
            )}
          </div>
        </div>
        {uploadingImages > 0 && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            ⬆️ Uploading {uploadingImages} image{uploadingImages > 1 ? 's' : ''}...
          </div>
        )}
        {syncStatus.text && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${syncStatus.kind === 'success' ? 'border-green-200 bg-green-50 text-green-700' : syncStatus.kind === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
            {syncStatus.text}
          </div>
        )}
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
              <p className="mt-2 text-xs text-gray-500">Use the pasted content area below for inline images. This cover image controls the article card.</p>
              <div className="mt-2 flex flex-col gap-2">
                <input className="border p-2 w-full text-sm rounded-md" placeholder="Cover image URL" value={form.coverImageUrl||''} onChange={e=>setForm({...form,coverImageUrl:e.target.value})} />
                <button type="button" onClick={()=>setForm(prev=>({...prev, coverImage:(prev.coverImageUrl||'').trim(), coverImageUrl:''}))} className="px-2 py-2 border text-sm rounded-md w-full">Use</button>
              </div>
              <div className="mt-2">
                {form.coverImage ? (
                  <img src={form.coverImage} alt="cover-preview" className="block w-full h-24 object-cover rounded border" />
                ) : (
                  <div className="flex h-24 items-center justify-center rounded border border-dashed text-center px-2 text-xs text-gray-500">Cover preview will appear here</div>
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
                <button type="button" onClick={()=>changeSelectionFontSize(-2)} className="px-2 py-1 border rounded-md bg-white text-sm">A-</button>
                <button type="button" onClick={()=>changeSelectionFontSize(2)} className="px-2 py-1 border rounded-md bg-white text-sm">A+</button>
                <button type="button" onClick={()=>execIntro('removeFormat')} className="px-3 py-1 border rounded-md bg-white text-sm">Clear</button>
              </div>
              <div
                ref={introRef}
                contentEditable
                suppressContentEditableWarning
                onKeyDown={handleEditorKeydown}
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
                onKeyDown={handleEditorKeydown}
                onInput={e=>setForm({...form, content: e.currentTarget.innerHTML})}
                onPaste={handleContentPaste}
                className="min-h-[220px] w-full border rounded-md bg-white p-3 outline-none prose max-w-none"
                style={{fontFamily: 'Inter, Arial, sans-serif'}}
              />
              <p className="text-xs text-gray-500">Highlight text first, then use the toolbar to style it.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button disabled={isSaving} className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed">{isSaving ? 'Publishing...' : 'Publish'}</button>
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
