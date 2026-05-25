export function initAnalytics(measurementId){
  if(!measurementId) return
  if(typeof window === 'undefined') return
  if(window.__analytics_initialized_for === measurementId) return
  const existing = document.querySelector(`script[data-gtag-id="${measurementId}"]`)
  if(!existing){
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    s.setAttribute('data-gtag-id', measurementId)
    document.head.appendChild(s)
  }
  window.dataLayer = window.dataLayer || []
  function gtag(){window.dataLayer.push(arguments)}
  window.gtag = window.gtag || gtag
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: false })
  window.__analytics_initialized_for = measurementId
}

export function trackPageview(path){
  try{ if(typeof window.gtag === 'function') window.gtag('event','page_view',{page_path: path}) }catch(e){}
}

export function trackEvent(name, params={}){ try{ if(typeof window.gtag === 'function') window.gtag('event', name, params) }catch(e){} }
