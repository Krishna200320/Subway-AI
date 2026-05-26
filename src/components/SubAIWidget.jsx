import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAIChat } from '../ai/useAIChat'
import { ACTIVE_PROMOS } from '../data/promotionsData'
import { ALL_ITEMS } from '../data/menuData'

const stores = [
  { id: 1, name: 'Subway Vaughan Mills',       address: '1 Bass Pro Mills Dr, Vaughan ON',     hours: 'Open until 10pm', distance: '0.8km', rating: 4.3 },
  { id: 2, name: 'Subway Jane & Major Mac',    address: '3075 Major Mackenzie Dr, Vaughan ON', hours: 'Open until 11pm', distance: '1.2km', rating: 4.1 },
  { id: 3, name: 'Subway Rutherford & Weston', address: '600 Rutherford Rd, Vaughan ON',       hours: 'Open until 9pm',  distance: '2.1km', rating: 4.5 },
]

function findItemsInText(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const seen  = new Set()
  return ALL_ITEMS.filter(item => {
    if (!item.image) return false
    const match = lower.includes(item.name.toLowerCase())
    if (match && !seen.has(item.name)) { seen.add(item.name); return true }
    return false
  })
}

function parseMsg(content) {
  const showSignIn  = content.includes('[SHOW_SIGNIN]')
  const storeMatch  = content.match(/\[SELECT_STORE:(\d+)\]/)
  const selectStore = storeMatch ? parseInt(storeMatch[1]) : null
  const clean       = content.replace('[SHOW_SIGNIN]', '').replace(/\[SELECT_STORE:\d+\]/g, '').trim()
  return { clean, showSignIn, selectStore }
}

function TypingDots() {
  return (
    <div className="flex items-end gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm w-fit">
      {[0, 150, 300].map(d => (
        <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  )
}

function WidgetMessage({ msg, onSignIn, onSelectStore }) {
  const isUser = msg.role === 'user'
  const { clean, showSignIn, selectStore } = parseMsg(msg.content)
  const items = isUser ? [] : findItemsInText(clean)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[10px] font-black mr-2 flex-shrink-0 mt-1">S</div>
      )}
      <div className="max-w-[85%] flex flex-col gap-2">
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser ? 'bg-[#534AB7] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}>
          {clean}
        </div>
        {items.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {items.map(item => (
              <img key={item.id} src={item.image} alt={item.name} loading="lazy" title={item.name}
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm" />
            ))}
          </div>
        )}
        {showSignIn && (
          <button onClick={onSignIn}
            className="self-start bg-[#009A44] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#007A36] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In to Order
          </button>
        )}
        {selectStore != null && (
          <button onClick={() => onSelectStore(selectStore)}
            className="self-start bg-[#009A44] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#007A36] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Select This Store & Order
          </button>
        )}
      </div>
    </div>
  )
}

export default function SubAIWidget() {
  const navigate                              = useNavigate()
  const location                              = useLocation()
  const { user, selectStore: ctxSelectStore } = useAuth()
  const { messages, isLoading, sendMessage, clearChat } = useAIChat({ isLoggedIn: !!user?.isLoggedIn })

  const [isOpen,     setIsOpen]     = useState(false)
  const [input,      setInput]      = useState('')
  const [dealsOpen,  setDealsOpen]  = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const dealsRef       = useRef(null)

  const pathname   = location.pathname
  const shouldShow = !user?.isLoggedIn

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80)
  }, [isOpen])

  useEffect(() => {
    if (!dealsOpen) return
    const handler = (e) => {
      if (dealsRef.current && !dealsRef.current.contains(e.target)) setDealsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dealsOpen])

  if (!shouldShow) return null

  function handleSend(override) {
    const msg = (override ?? input).trim()
    if (!msg || isLoading) return
    setInput('')
    const page = pathname.replace('/', '') || 'home'
    sendMessage(msg, page)
    setIsOpen(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1800)
  }

  function handleSelectStore(storeId) {
    const store = stores.find(s => s.id === storeId)
    if (store) { ctxSelectStore(store); navigate('/menu') }
  }

  const greeting = pathname === '/store-select'
    ? "Hi! I can help you pick the perfect Subway location. The Rutherford & Weston store has the highest rating (4.5★) — want me to select it for you?"
    : (pathname === '/signin' || pathname === '/register')
    ? "Hi! I can help you find what you're looking for — no account needed to browse the menu or check deals!"
    : "Hi! I'm SubAI — ask me anything about our menu, deals, or nutrition info!"

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-30 pointer-events-none" />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2.5 w-[min(580px,90vw)]">

        {/* ── Chat panel ── */}
        {isOpen && (
          <div
            className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            style={{ maxHeight: '420px', animation: 'subai-slide-up 0.22s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#534AB7]/8 to-purple-50/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#534AB7] flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">SubAI</p>
                  <p className="text-[10px] text-gray-400 leading-tight">Subway's AI assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={clearChat} className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Clear</button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {messages.length === 0 && (
                <div className="flex justify-start mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[10px] font-black mr-2 flex-shrink-0 mt-1">S</div>
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm max-w-[85%] leading-relaxed">
                    {greeting}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <WidgetMessage key={i} msg={msg} onSignIn={() => navigate('/signin')} onSelectStore={handleSelectStore} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[10px] font-black mr-2 flex-shrink-0 mt-1">S</div>
                  <TypingDots />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* ── Quick action pills ── */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* View Menu */}
          <button
            onClick={() => navigate('/menu')}
            className="bg-white border border-gray-200 rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 flex items-center gap-1.5 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-[#009A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Menu
          </button>

          {/* Current Deals */}
          <div className="relative" ref={dealsRef}>
            <button
              onClick={() => setDealsOpen(o => !o)}
              className="bg-white border border-gray-200 rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 flex items-center gap-1.5 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-[#FFCC00]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.79 2.96L15.27 7.98 21 8.84l-4.5 4.38 1.06 6.18L12 16.66l-5.56 2.74 1.06-6.18L3 8.84l5.73-.86z"/>
              </svg>
              Current Deals
              <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${dealsOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dealsOpen && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">Active Promotions</p>
                <div className="space-y-1.5">
                  {ACTIVE_PROMOS.map(promo => (
                    <div key={promo.code} className="flex items-start gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{promo.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{promo.description}</p>
                      </div>
                      <button
                        onClick={() => copyCode(promo.code)}
                        className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                          copiedCode === promo.code
                            ? 'bg-[#009A44] text-white scale-95'
                            : 'bg-[#FFCC00] text-[#7A5C00] hover:bg-[#f5c100] active:scale-95'
                        }`}
                      >
                        {copiedCode === promo.code ? '✓ Copied' : promo.code}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nutrition Info */}
          <button
            onClick={() => handleSend('Tell me about the healthiest and lowest calorie options at Subway')}
            className="bg-white border border-gray-200 rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 flex items-center gap-1.5 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Nutrition Info
          </button>
        </div>

        {/* ── Input bar ── */}
        <div className="w-full flex items-center gap-2.5 bg-white border-2 border-[#534AB7]/25 rounded-full px-4 py-2.5 shadow-lg focus-within:border-[#534AB7]/60 focus-within:shadow-[0_0_0_3px_rgba(83,74,183,0.1)] transition-all">
          {/* Sparkle icon */}
          <svg className="w-5 h-5 text-[#534AB7] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>

          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — menu, deals, nutrition…"
            disabled={isLoading}
            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-[#534AB7] text-white flex items-center justify-center disabled:opacity-35 hover:bg-[#453da0] active:scale-95 transition-all flex-shrink-0 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 pb-0.5">
          <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Powered by</span>
          {[
            { label: 'SubAssist', desc: 'Search & Guide' },
            { label: 'ToneSense', desc: 'Tone Engine'    },
            { label: 'BrainMenu', desc: 'Menu Knowledge' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center gap-1">
              <svg className="w-2.5 h-2.5 text-[#534AB7] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-[9px] text-gray-500 font-semibold">{label}</span>
              <span className="text-[9px] text-gray-400 hidden sm:inline">· {desc}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes subai-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
