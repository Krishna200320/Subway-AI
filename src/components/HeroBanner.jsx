import { useState, useEffect, useCallback } from 'react'

const slides = [
  {
    id: 1,
    headline: 'Buy 1 Footlong,',
    subheadline: 'Get 1 50% Off',
    body: 'Mix and match your favourites. Limited time offer.',
    code: 'LONGWEEKEND',
    cta: 'Order Now',
    accent: '#FFCC00',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
  },
  {
    id: 2,
    headline: 'NEW All Dressed Sauce',
    subheadline: 'Only in Canada',
    body: 'A bold Canadian classic — now on any Subway sandwich.',
    code: null,
    cta: 'Try It Now',
    accent: '#FFCC00',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
  },
  {
    id: 3,
    headline: 'Meal of the Day',
    subheadline: '7 Subs. 7 Days.',
    body: 'A different featured sub every day of the week.',
    code: null,
    cta: 'See Today\'s Deal',
    accent: '#FFCC00',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, paused])

  const slide = slides[current]

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <img
        key={slide.id}
        src={slide.image}
        alt=""
        aria-hidden="true"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center gap-6 relative z-10">
        <div className="animate-fade-in">
          <p className="text-[#FFCC00] font-semibold text-sm uppercase tracking-widest mb-2">Limited Time Offer</p>
          <h1 className="text-white font-black text-4xl sm:text-6xl leading-tight">
            {slide.headline}
            <br />
            <span style={{ color: slide.accent }}>{slide.subheadline}</span>
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-lg mx-auto">{slide.body}</p>

          {slide.code && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 border border-white/30 rounded-full px-4 py-2">
              <span className="text-white/70 text-sm">Code:</span>
              <span className="text-[#FFCC00] font-bold text-sm tracking-wider">{slide.code}</span>
            </div>
          )}
        </div>

        <button className="mt-2 bg-white text-[#009A44] font-bold px-8 py-3 rounded-full text-lg hover:bg-[#FFCC00] hover:text-[#007A36] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
          {slide.cta}
        </button>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-20"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-20"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'bg-[#FFCC00] w-6 h-3' : 'bg-white/50 w-3 h-3 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
