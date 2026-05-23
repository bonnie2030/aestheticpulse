const OPEN_STATS_KEY = 'aestheticpulse_article_open_stats_v1'

export function readOpenStats(){
  try{
    const raw = localStorage.getItem(OPEN_STATS_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  }catch(e){
    return []
  }
}

export function recordArticleOpen(article){
  if(!article || !article.id) return
  try{
    const now = Date.now()
    const list = readOpenStats()
    const idx = list.findIndex(item => String(item.id) === String(article.id))
    const next = idx >= 0
      ? list.map((item, index) => index === idx ? { ...item, count: (item.count || 0) + 1, lastOpened: now } : item)
      : [{ id: article.id, title: article.title || 'Untitled', count: 1, lastOpened: now }, ...list]

    next.sort((a, b) => (b.count - a.count) || (b.lastOpened - a.lastOpened))
    localStorage.setItem(OPEN_STATS_KEY, JSON.stringify(next.slice(0, 20)))
    window.dispatchEvent(new Event('aestheticpulse:article-open-stats-changed'))
  }catch(e){}
}
