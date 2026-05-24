import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import ArticleDetail from './components/ArticleDetail'
import Admin from './components/Admin'
import Login from './components/Login'
import Footer from './components/Footer'
import { isSession, clearSession } from './utils/auth'
import { recordArticleOpen } from './utils/articleStats'
import { loadArticles, saveArticles } from './utils/storage'

export default function App(){
  const [articles, setArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [route, setRoute] = useState({view:'home'})
  const [isAuth, setIsAuth] = useState(isSession())

  function parseRoute(){
    const h = location.hash.replace('#','')
    if(!h || h==='home') return {view:'home', category:''}
    if(h==='admin') return {view:'admin'}
    if(h.startsWith('article-')) return {view:'article', id: h.replace('article-','')}
    if(h.startsWith('category-')) return {view:'home', category: h.replace('category-','')}
    if(h==='about') return {view:'about'}
    if(h==='contact') return {view:'contact'}
    return {view:'home'}
  }

  useEffect(()=>{
    let active = true
    ;(async ()=>{
      const loaded = await loadArticles()
      loaded.sort((a,b)=>new Date(b.date)-new Date(a.date))
      if(active){
        setArticles(loaded)
        setLoadingArticles(false)
      }
    })()
    return ()=>{ active = false }
  },[])

  useEffect(()=>{
    function onHash(){
      setRoute(parseRoute())
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHash)
    onHash()
    return ()=>window.removeEventListener('hashchange', onHash)
  },[])

  useEffect(()=>{
    if(route.view !== 'article') return
    const opened = articles.find(a=>String(a.id)===String(route.id))
    if(opened) recordArticleOpen(opened)
  },[route, articles])

  async function handleSave(newArticles){
    const sorted = [...newArticles].sort((a,b)=>new Date(b.date)-new Date(a.date))
    setArticles(sorted)
    try{
      const res = await saveArticles(sorted)
      return res
    }catch(e){
      return { articles: sorted, remoteSaved: false, error: e }
    }
  }

  function logout(){ clearSession(); setIsAuth(false); location.hash='#home' }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loadingArticles ? (
          <div className="bg-white border rounded-2xl p-8 text-gray-600">Loading articles...</div>
        ) : (
          <>
            {route.view === 'home' && <Home articles={articles} activeCategory={route.category || ''} />}
            {route.view === 'about' && <About />}
            {route.view === 'contact' && <Contact />}
            {route.view === 'article' && <ArticleDetail id={route.id} articles={articles} />}
            {route.view === 'admin' && (!isAuth ? <Login onSuccess={()=>setIsAuth(true)} /> : <Admin articles={articles} onSave={handleSave} onLogout={logout} />)}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
