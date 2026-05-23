export function loadArticles(){
  try{const raw=localStorage.getItem('aestheticpulse_articles_v2'); return raw?JSON.parse(raw):null}catch(e){return null}
}
export function saveArticles(arr){localStorage.setItem('aestheticpulse_articles_v2', JSON.stringify(arr))}
export function seedArticles(){
  const now=Date.now()
  return [
    {
      id: now-600000,
      title: "How to Style Cowboy Boots: A Modern Woman's Guide",
      excerpt: 'Learn how to make cowboy boots feel elevated, modern, and wearable with midi skirts, denim, and tailored layers.',
      content: `<h2>1. Cowboy Boots with a Midi Skirt</h2>
<p>One of the easiest ways to modernize cowboy boots is to pair them with a softly structured midi skirt. The contrast between the rugged boot and the feminine silhouette feels polished without trying too hard.</p>
<ul><li>Choose a skirt with movement, like satin or pleated fabric.</li><li>Keep the color palette neutral or earthy for a refined finish.</li><li>Add a fitted knit or tucked-in blouse to balance proportions.</li></ul>
<p><strong>Style tip:</strong> Let the boots peek out just enough to create shape at the hem.</p>

<h2>2. Denim Done Right</h2>
<p>Straight-leg denim and cropped flares work beautifully with cowboy boots.</p>`,
      image: makeInline('cowboy','Cowboy Boots','#b65a3c','#f7e4d8'),
      category: 'Outfits',
      date: new Date(now-600000).toISOString()
    },
    {
      id: now-500000,
      title: 'Soft Curls Aesthetic Hairstyles That Look Romantic, Glossy, and Effortlessly Elegant',
      excerpt: 'Soft curls aesthetic hairstyles continue staying popular because they combine romantic movement, airy softness, and glamorous texture.',
      content: `<h2>Soft Curls Basics</h2><p>Soft curls work on many hair lengths and can be styled with minimal heat.</p>`,
      image: makeInline('curls','Curls','#d47a5d','#f6ddd3'),
      category: 'Hairstyles',
      date: new Date(now-500000).toISOString()
    }
  ]
}

function makeInline(title, subtitle, accent='#b65a3c', bg='#fff2ea'){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='${bg}'/><text x='60' y='120' font-family='Georgia,serif' font-size='36' fill='#7d5f51'>AESTHETICPULSE</text><text x='60' y='320' font-family='Georgia,serif' font-size='72' fill='#1f1a17'>${escapeHtml(title)}</text></svg>`
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg)
}
function escapeHtml(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
