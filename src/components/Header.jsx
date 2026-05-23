import React from 'react'

export default function Header(){
  return (
    <header className="bg-white border-b">
      <div className="w-full px-6 py-10 flex items-center gap-8">
        <div className="flex-shrink-0">
          <div className="font-serif text-4xl lg:text-5xl font-extrabold text-pink-600 tracking-tight">AP</div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-wide w-[80vw] max-w-none">AESTHETIC PULSE</h1>
            <a href="https://pinterest.com/example" target="_blank" rel="noreferrer" className="text-sm lg:text-base font-semibold text-pink-600">Follow on Pinterest</a>
          </div>
          <nav className="mt-4 lg:mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-pink-600">Outfits</a>
            <a href="#" className="hover:text-pink-600">Hairstyles</a>
            <a href="#" className="hover:text-pink-600">Tattoos</a>
            <a href="#" className="hover:text-pink-600">Nails</a>
            <a href="#" className="hover:text-pink-600">Facial Care Tips</a>
            <a href="#contact" className="hover:text-pink-600">Contact</a>
            <a href="#about" className="hover:text-pink-600">About</a>
          </nav>
        </div>
      </div>
    </header>
  )
}
