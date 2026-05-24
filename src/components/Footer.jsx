import React from 'react'

export default function Footer(){
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div>
            <a href="#home" className="inline-flex items-center gap-3 no-underline">
              <div className="font-serif text-3xl font-extrabold text-pink-600 tracking-tight">AP</div>
              <div>
                <div className="text-lg font-bold tracking-wide text-gray-900">AESTHETIC PULSE</div>
                <div className="text-sm text-gray-500">Style notes, curated for the modern aesthetic.</div>
              </div>
            </a>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <a href="#home" className="hover:text-pink-600">Home</a>
              <a href="#about" className="hover:text-pink-600">About</a>
              <a href="#contact" className="hover:text-pink-600">Contact</a>
              <a href="#" className="hover:text-pink-600">Outfits</a>
              <a href="#" className="hover:text-pink-600">Hairstyles</a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">Follow</h3>
            <a href="https://pin.it/2G044qZNh" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:opacity-90">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.04 2C6.55 2 2 6.48 2 12.03c0 4.12 2.65 7.65 6.35 9.03-.09-.77-.17-1.96.03-2.8.18-.75 1.16-4.84 1.16-4.84s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.85 0 1.32.64 1.32 1.41 0 .86-.55 2.14-.83 3.33-.24 1.01.51 1.83 1.43 1.83 1.72 0 3.05-1.83 3.05-4.46 0-2.32-1.67-3.95-4.06-3.95-2.78 0-4.43 2.08-4.43 4.23 0 .94.36 1.98.81 2.54.09.11.1.2.08.31-.09.34-.28 1.09-.31 1.24-.05.2-.16.25-.37.15-1.35-.61-2.21-2.52-2.21-4.06 0-3.29 2.5-6.31 6.9-6.31 3.62 0 6.44 2.51 6.44 5.88 0 3.61-2.28 6.55-5.42 6.55-1.06 0-2.06-.55-2.4-1.2l-.65 2.41c-.23.86-.86 1.95-1.28 2.61.98.3 2.02.46 3.11.46 5.49 0 9.98-4.48 9.98-10.97C21.98 6.48 17.52 2 12.04 2z" />
              </svg>
              Pinterest
            </a>
            <p className="text-sm text-gray-500 mt-3 max-w-xs">Save your favorites, share styles, and come back for the next update.</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-sm text-gray-500">
          <a
            href="#admin"
            aria-label="Open admin dashboard"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 font-semibold text-gray-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50"
          >
            Admin Login
          </a>
          <div className="text-center md:flex-1 md:text-center text-xs md:text-sm text-gray-500">
            © {new Date().getFullYear()} Aesthetic Pulse. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#home" className="hover:text-pink-600">Top</a>
            <a href="#contact" className="hover:text-pink-600">Help</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
