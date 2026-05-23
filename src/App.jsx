import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Home from './components/Home'
import ArticleDetail from './components/ArticleDetail'
import Admin from './components/Admin'
import Login from './components/Login'
import Footer from './components/Footer'
import { isSession, clearSession } from './utils/auth'
import { recordArticleOpen } from './utils/articleStats'
import { loadArticles, saveArticles, seedArticles } from './utils/storage'

export default function App(){
  const [articles, setArticles] = useState([])
  const [route, setRoute] = useState({view:'home'})
  const [isAuth, setIsAuth] = useState(isSession())

  useEffect(()=>{
    // load or seed
    let loaded = loadArticles()
    if(!loaded || !loaded.length){
      loaded = seedArticles()
      saveArticles(loaded)
    }
    // sort newest first
    loaded.sort((a,b)=>new Date(b.date)-new Date(a.date))
    setArticles(loaded)
  },[])

  useEffect(()=>{
    function onHash(){
      const h = location.hash.replace('#','')
      if(!h || h==='home') return setRoute({view:'home'})
      if(h==='admin') return setRoute({view:'admin'})
      if(h.startsWith('article-')) return setRoute({view:'article', id: h.replace('article-','')})
      return setRoute({view:'home'})
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

  function handleSave(newArticles){
    saveArticles(newArticles)
    // keep newest first
    newArticles.sort((a,b)=>new Date(b.date)-new Date(a.date))
    setArticles(newArticles)
    // go home
    location.hash='#home'
  }

  function logout(){ clearSession(); setIsAuth(false); location.hash='#home' }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header isAuth={isAuth} onLogout={logout} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {route.view === 'home' && <Home articles={articles} />}
        {route.view === 'article' && <ArticleDetail id={route.id} articles={articles} />}
        {route.view === 'admin' && (!isAuth ? <Login onSuccess={()=>setIsAuth(true)} /> : <Admin articles={articles} onSave={handleSave} />)}
      </main>
      <Footer />
    </div>
  )
}
