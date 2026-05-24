import { useState, useRef, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CustomizationModal from '../components/CustomizationModal'
import { CATEGORIES, MENU_BY_CATEGORY, SAUCE_INFO } from '../data/menuData'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useGhostNav } from '../context/GhostNavContext'

/* ── SubAI Technology badge ── */
function FluxBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      MenuMind
    </span>
  )
}

/* ── Deal badge ── */
function DealBadge() {
  return (
    <span className="inline-block bg-[#FFCC00] text-[#7A5C00] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
      DEAL
    </span>
  )
}

/* ── Menu item card ── */
function MenuItemCard({ item, onCustomize }) {
  const [hoverTimer, setHoverTimer] = useState(null)
  const [showNudge,  setShowNudge]  = useState(false)
  const [imgLoaded,  setImgLoaded]  = useState(false)
  const [imgError,   setImgError]   = useState(false)
  const hasDeal = item.deals?.length > 0

  const nudgeText = {
    'Footlongs':    'Add a drink + chips for just $4.50 more 🍟',
    '6-inch Subs':  'Pair with a cookie for $1.29 more 🍪',
    'Bowls':        'Use code 20OFFBOWL for 20% off! 💰',
    'Sides':        'Great with any footlong — bundle & save!',
    'Drinks':       'Add a cookie for only $1.29 more 🍪',
    'Cookies':      '3 cookies for $3.00 — add 2 more!',
  }

  function handleMouseEnter() {
    const t = setTimeout(() => setShowNudge(true), 3000)
    setHoverTimer(t)
  }
  function handleMouseLeave() {
    clearTimeout(hoverTimer)
    setShowNudge(false)
  }

  return (
    <div
      data-item-id={item.id}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Item image */}
      <div className="relative h-[180px] bg-gray-100 overflow-hidden">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#E8F5ED]">
            <span className="text-3xl font-black text-[#009A44]">{item.name.charAt(0)}</span>
          </div>
        ) : (
          <img
            src={item.image}
            alt={`${item.name} - ${item.description}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {hasDeal && <DealBadge />}
            <span className="bg-[#E8F5ED] text-[#007A36] text-xs font-semibold px-2 py-0.5 rounded-full">
              {item.calories} cal
            </span>
          </div>
        </div>
        <p className="text-gray-500 text-xs flex-1 mb-3 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-black text-gray-900 text-base">${item.price.toFixed(2)}</span>
          <button
            onClick={() => onCustomize(item)}
            className="bg-[#009A44] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#007A36] transition-colors"
          >
            Customize & Add
          </button>
        </div>
      </div>

      {/* Flux hover nudge */}
      {showNudge && nudgeText[item.category] && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl whitespace-nowrap z-10 flex items-center gap-2">
          <FluxBadge />
          {nudgeText[item.category]}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  )
}

/* ── Category section ── */
function CategorySection({ catId, label, emoji, items, sauceInfo, onCustomize, sectionRef }) {
  const isEmpty = catId !== 'sauces' && items.length === 0
  return (
    <section ref={sectionRef} className="scroll-mt-32">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-xl font-black text-gray-900">{label}</h2>
      </div>

      {catId === 'sauces' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sauceInfo.map(s => (
            <div key={s.name} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.description}</p>
              {s.heat > 0 && <p className="text-red-500 text-xs mt-1">{'🌶️'.repeat(s.heat)} Spicy</p>}
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <p className="text-gray-400 text-sm">Coming soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <MenuItemCard key={item.id} item={item} onCustomize={onCustomize} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function MenuPage() {
  const { selectedStore }    = useAuth()
  const { items: cartItems, getTotals } = useCart()
  const { itemCount }        = getTotals()
  const { activeHighlights, applyPendingHighlights, popCategoryScroll } = useGhostNav()

  const [activeCategory,  setActiveCategory]  = useState('footlongs')
  const [selectedItem,    setSelectedItem]     = useState(null)
  const [footlongNudge,   setFootlongNudge]    = useState(false)
  const [idleNudge,       setIdleNudge]        = useState(false)
  const [dismissedNudges, setDismissedNudges]  = useState(new Set())

  const sectionRefs    = useRef({})
  const tabBarRef      = useRef(null)
  const prevCartCount  = useRef(itemCount)

  /* Show footlong promo nudge when first footlong added */
  useEffect(() => {
    const hasFootlong = cartItems.some(i => i.category === 'Footlongs')
    if (hasFootlong && itemCount > prevCartCount.current && !dismissedNudges.has('footlong')) {
      setFootlongNudge(true)
    }
    prevCartCount.current = itemCount
  }, [itemCount, cartItems, dismissedNudges])

  /* 60-second idle nudge */
  useEffect(() => {
    if (itemCount > 0) return
    const t = setTimeout(() => {
      if (!dismissedNudges.has('idle')) setIdleNudge(true)
    }, 60000)
    return () => clearTimeout(t)
  }, [itemCount, dismissedNudges])

  /* IntersectionObserver for active category tab */
  useEffect(() => {
    const observers = []
    CATEGORIES.forEach(({ id }) => {
      const el = sectionRefs.current[id]
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCategory(id) },
        { rootMargin: '-80px 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  /* Ghost nav — apply pending highlights on mount */
  useEffect(() => {
    applyPendingHighlights()
    const pendingCat = popCategoryScroll()
    if (pendingCat) {
      setTimeout(() => scrollToCategory(pendingCat), 300)
    }
  }, [])

  /* Ghost nav — watch activeHighlights and apply CSS + scroll */
  useEffect(() => {
    if (!activeHighlights.length) return
    activeHighlights.forEach((id, i) => {
      setTimeout(() => {
        const el = document.querySelector(`[data-item-id="${id}"]`)
        if (!el) return
        if (i === 0) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ghost-highlight')
        setTimeout(() => el.classList.remove('ghost-highlight'), 4500)
      }, i * 350)
    })
  }, [activeHighlights])

  const scrollToCategory = useCallback((catId) => {
    setActiveCategory(catId)
    const el = sectionRefs.current[catId]
    if (!el) return
    const offset = 64 + 52 + 16 // navbar + tabbar + gap
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  function dismiss(key) {
    setDismissedNudges(prev => new Set([...prev, key]))
    if (key === 'footlong') setFootlongNudge(false)
    if (key === 'idle')     setIdleNudge(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Sticky category tab bar */}
      <div ref={tabBarRef} className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {CATEGORIES.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => scrollToCategory(id)}
                className={`flex-none flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === id
                    ? 'bg-[#009A44] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Store header */}
        {selectedStore && (
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
            <svg className="w-4 h-4 text-[#009A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Ordering from <span className="font-semibold text-gray-800">{selectedStore.name}</span> · {selectedStore.hours}</span>
          </div>
        )}

        {/* Flux — footlong promo nudge */}
        {footlongNudge && !dismissedNudges.has('footlong') && (
          <div className="mb-6 bg-[#FFCC00] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FluxBadge />
              <p className="text-gray-900 font-semibold text-sm">
                🎉 Add a second footlong for <strong>50% off</strong> — use code <span className="font-black tracking-wide">LONGWEEKEND</span> at checkout!
              </p>
            </div>
            <button onClick={() => dismiss('footlong')} className="text-gray-600 hover:text-gray-900 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Flux — idle nudge */}
        {idleNudge && !dismissedNudges.has('idle') && (
          <div className="mb-6 bg-[#E8F5ED] border border-[#009A44]/30 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FluxBadge />
              <p className="text-gray-800 text-sm">
                🤔 Not sure what to order? <strong>Try the AI assistant</strong> — it'll help you choose in seconds!
              </p>
            </div>
            <button onClick={() => dismiss('idle')} className="text-gray-500 hover:text-gray-700 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Menu sections */}
        <div className="space-y-14">
          {CATEGORIES.map(({ id, label, emoji }) => (
            <CategorySection
              key={id}
              catId={id}
              label={label}
              emoji={emoji}
              items={MENU_BY_CATEGORY[id] || []}
              sauceInfo={SAUCE_INFO}
              onCustomize={setSelectedItem}
              sectionRef={el => (sectionRefs.current[id] = el)}
            />
          ))}
        </div>
      </main>

      <Footer />

      {/* Customization modal */}
      {selectedItem && (
        <CustomizationModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
