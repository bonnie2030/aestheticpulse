import React from 'react'

export default function Contact(){
  return (
    <section className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
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
  )
}