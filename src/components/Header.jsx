import React from 'react'

export default function Header(){
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-6">
        <div className="w-20 h-20 bg-white border rounded flex items-center justify-center font-serif text-2xl font-bold">AP</div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-extrabold tracking-wider">AESTHETICPULSE</h1>
            <a href="https://pinterest.com/example" target="_blank" rel="noreferrer" className="text-sm font-semibold text-pink-600">Follow on Pinterest</a>
          </div>
          <nav className="mt-3 flex gap-4 text-sm text-gray-600">
            <a href="#">Outfits</a>
            <a href="#">Hairstyles</a>
            <a href="#">Tattoos</a>
            <a href="#">Nails</a>
            <a href="#">Facial Care Tips</a>
            <a href="#contact">Contact</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </div>
    </header>
  )
}
