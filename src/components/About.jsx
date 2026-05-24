import React from 'react'

export default function About(){
  return (
    <section className="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-white via-rose-50 to-pink-50 shadow-sm">
      <div className="p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-pink-600">Inspiring creative work</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Welcome to AestheticPulse</h2>
          <p className="max-w-3xl text-base sm:text-lg leading-8 text-gray-700">
            At AestheticPulse, we believe that style is a holistic experience-it&apos;s not just about what you wear, but how you present yourself to the world. Whether it&apos;s the ink on your skin, the care you put into your skin, or the way you curate your everyday look, everything tells a story.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
            <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
            <p className="mt-3 text-gray-700 leading-7">
              In a fast-paced world, we are here to help you slow down and curate your aesthetic with intention. AestheticPulse is your dedicated space for inspiration across the spectrum of personal style. We don&apos;t just focus on one lane; we explore the pulse of current trends in:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                'Outfits & Style: From timeless classics to modern streetwear essentials.',
                'Hairstyles: Tips and trends to help you find your signature look.',
                'Tattoos & Body Art: Celebrating ink as a form of personal expression.',
                'Nails & Beauty: The intricate details that tie your whole aesthetic together.',
                'Facial Care Tips: Science-backed guidance to keep your glow consistent.',
              ].map(item => (
                <li key={item} className="flex gap-3 text-sm sm:text-base leading-7 text-gray-700">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-pink-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
              <h3 className="text-xl font-bold text-gray-900">Why Follow AestheticPulse?</h3>
              <p className="mt-3 text-gray-700 leading-7">
                We are here for the curious, the trend-conscious, and those who believe that self-expression is an evolving art form. We provide actionable, curated insights so you can spend less time searching for the right look and more time living it.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
              <h3 className="text-xl font-bold text-gray-900">Stay Connected</h3>
              <p className="mt-3 text-gray-700 leading-7">
                Your aesthetic is uniquely yours, and we are thrilled to be part of your journey in refining it. Join our community as we continue to track what&apos;s trending, what&apos;s timeless, and everything in between.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white/85 p-5 sm:p-6 shadow-sm">
          <p className="text-gray-700 leading-7">Stay Inspired,</p>
          <p className="mt-2 font-semibold text-gray-900">Webkingsolutions</p>
          <p className="text-sm text-gray-500">Founder, AestheticPulse</p>
        </div>
      </div>
    </section>
  )
}