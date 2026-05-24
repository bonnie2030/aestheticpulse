import React, { useEffect, useMemo, useState } from 'react'
import ArticleCard from './ArticleCard'
import SearchBox from './SearchBox'
import { readOpenStats } from '../utils/articleStats'

export default function Home({articles, activeCategory=''}){
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [topOpened, setTopOpened] = useState([])
  const PAGE_SIZE = 7
  const slugify = value => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const list = articles
  const filtered = useMemo(()=>{
    let result = list
    if(activeCategory){
      result = result.filter(a => slugify(a.category) === activeCategory)
    }
    if(!query) return result
    const s = query.toLowerCase()
    return result.filter(a=> (a.title||'').toLowerCase().includes(s) || (a.excerpt||'').toLowerCase().includes(s) || (a.category||'').toLowerCase().includes(s))
  },[list,query,activeCategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = useMemo(()=>{
    const start = (page-1)*PAGE_SIZE
    return filtered.slice(start, start+PAGE_SIZE)
  },[filtered,page])

  useEffect(()=>{
    setTopOpened(readOpenStats())
    function refresh(){ setTopOpened(readOpenStats()) }
    window.addEventListener('aestheticpulse:article-open-stats-changed', refresh)
    return ()=>window.removeEventListener('aestheticpulse:article-open-stats-changed', refresh)
  },[])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {activeCategory && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Showing {activeCategory}</span>
            <a href="#home" className="rounded-full border border-gray-200 px-3 py-1 hover:border-pink-300 hover:text-pink-600">Show all</a>
          </div>
        )}

        <section id="about" className="mb-8 overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-white via-rose-50 to-pink-50 shadow-sm">
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Welcome to AestheticPulse</h2>
              <p className="max-w-3xl text-base sm:text-lg leading-8 text-gray-700">
                At AestheticPulse, we believe that style is a holistic experience-it&apos;s not just about what you wear, but how you present yourself to the world. Whether it&apos;s the ink on your skin, the care you put into your skin, or the way you curate your everyday look, everything tells a story.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
                <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
                <p className="mt-3 text-gray-700 leading-7">
                  In a fast-paced world, we are here to help you slow down and curate your aesthetic with intention. AestheticPulse is your dedicated space for inspiration across the spectrum of personal style. We don&apos;t just focus on one lane; we explore the pulse of current trends in:
                </p>
                <ul className="mt-4 space-y-3">
                  {[
                    'Outfits & Style: From timeless classics to modern streetwear essentials.',
                    'Hairstyles: Tips and trends to help you find your signature look.',
                    'Tattoos & Body Art: Celebrating ink as a form of personal expression.',
                    'Nails & Beauty: The intricate details that tie your whole aesthetic together.',
                    'Facial Care Tips: Science-backed guidance to keep your glow consistent.',
                  ].map(item => (
                    <li key={item} className="flex gap-3 text-sm sm:text-base leading-7 text-gray-700">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-pink-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
                  <h3 className="text-xl font-bold text-gray-900">Why Follow AestheticPulse?</h3>
                  <p className="mt-3 text-gray-700 leading-7">
                    We are here for the curious, the trend-conscious, and those who believe that self-expression is an evolving art form. We provide actionable, curated insights so you can spend less time searching for the right look and more time living it.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
                  <h3 className="text-xl font-bold text-gray-900">Stay Connected</h3>
                  <p className="mt-3 text-gray-700 leading-7">
                    Your aesthetic is uniquely yours, and we are thrilled to be part of your journey in refining it. Join our community as we continue to track what&apos;s trending, what&apos;s timeless, and everything in between.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white/85 p-5 sm:p-6 shadow-sm">
              <p className="text-gray-700 leading-7">Stay Inspired,</p>
              <p className="mt-2 font-semibold text-gray-900">Webkingsolutions</p>
              <p className="text-sm text-gray-500">Founder, AestheticPulse</p>
            </div>
          </div>
        </section>

        <section id="contact" className="mb-8 overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
          <div className="p-6 sm:p-8 lg:p-10 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-600">Contact</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Stay connected with AestheticPulse</h2>
            <p className="max-w-3xl text-base sm:text-lg leading-8 text-gray-700">
              For collaborations, questions, or general contact, reach out at{' '}
              <a href="mailto:webkingsolutionsco@gmail.com" className="font-semibold text-pink-600 hover:underline">
                webkingsolutionsco@gmail.com
              </a>
              .
            </p>
          </div>
        </section>

        <div className="space-y-8">
          {visible.map(a=> <ArticleCard key={a.id} a={a} />)}
        </div>

        <div className="mt-6 grid grid-cols-3 items-center gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="w-full px-3 py-2 border rounded text-center disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
          <div className="px-2 py-2 text-center text-sm text-gray-600">{page}/{totalPages}</div>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="w-full px-3 py-2 border rounded text-center disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold mb-2">Search</h3>
          <SearchBox items={list} onChange={q=>{ setQuery(q); setPage(1) }} />
          <p className="text-sm text-gray-500 mt-2">Type to filter articles by title, excerpt or category.</p>
        </div>
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold">Recent</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {articles.slice(0,6).map(a=> <li key={a.id}><a className="text-pink-600 font-semibold" href={`#article-${a.id}`}>{a.title}</a></li>)}
          </ul>
        </div>
        <div className="bg-white border p-4 rounded">
          <h3 className="font-semibold">Top Opened</h3>
          <p className="text-sm text-gray-500 mt-1">Existing articles visitors opened most often lately.</p>
          <ul className="mt-3 space-y-3 text-sm">
            {topOpened.length ? topOpened.slice(0, 3).map(item => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <a href={`#article-${item.id}`} className="font-semibold text-gray-800 hover:text-pink-600">{item.title}</a>
                <span className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600">{item.count}x</span>
              </li>
            )) : (
              <li className="text-gray-500">No article opens yet.</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  )
}
