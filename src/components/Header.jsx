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
            <a href="https://pinterest.com/example" target="_blank" rel="noreferrer" className="inline-flex items-center text-sm lg:text-base font-semibold text-pink-600">
              <svg className="w-5 h-5 fill-current text-pink-600" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.04 2C6.55 2 2 6.48 2 12.03c0 4.12 2.65 7.65 6.35 9.03-.09-.77-.17-1.96.03-2.8.18-.75 1.16-4.84 1.16-4.84s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.85 0 1.32.64 1.32 1.41 0 .86-.55 2.14-.83 3.33-.24 1.01.51 1.83 1.43 1.83 1.72 0 3.05-1.83 3.05-4.46 0-2.32-1.67-3.95-4.06-3.95-2.78 0-4.43 2.08-4.43 4.23 0 .94.36 1.98.81 2.54.09.11.1.2.08.31-.09.34-.28 1.09-.31 1.24-.05.2-.16.25-.37.15-1.35-.61-2.21-2.52-2.21-4.06 0-3.29 2.5-6.31 6.9-6.31 3.62 0 6.44 2.51 6.44 5.88 0 3.61-2.28 6.55-5.42 6.55-1.06 0-2.06-.55-2.4-1.2l-.65 2.41c-.23.86-.86 1.95-1.28 2.61.98.3 2.02.46 3.11.46 5.49 0 9.98-4.48 9.98-10.97C21.98 6.48 17.52 2 12.04 2z" />
              </svg>
              <span className="ml-2">Follow on Pinterest</span>
            </a>
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
