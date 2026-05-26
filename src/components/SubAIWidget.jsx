import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAIChat } from '../ai/useAIChat'
import { ALL_ITEMS } from '../data/menuData'

const stores = [
  { id: 1, name: 'Subway Vaughan Mills',       address: '1 Bass Pro Mills Dr, Vaughan ON',     hours: 'Open until 10pm', distance: '0.8km', rating: 4.3 },
  { id: 2, name: 'Subway Jane & Major Mac',    address: '3075 Major Mackenzie Dr, Vaughan ON', hours: 'Open until 11pm', distance: '1.2km', rating: 4.1 },
  { id: 3, name: 'Subway Rutherford & Weston', address: '600 Rutherford Rd, Vaughan ON',       hours: 'Open until 9pm',  distance: '2.1km', rating: 4.5 },
]

const SUGGESTIONS = [
  { label: "What's on the menu?", msg: "What's on the Subway menu? Give me an overview." },
  { label: 'Any deals today?',    msg: 'What deals or promotions does Subway have right now?' },
  { label: 'Healthiest options?', msg: 'What are the healthiest, lowest calorie options at Subway?' },
]

function findItemsInText(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const seen = new Set()
  return ALL_ITEMS.filter(item => {
    if (!item.image) return false
    const hit = lower.includes(item.name.toLowerCase())
    if (hit && !seen.has(item.name)) { seen.add(item.name); return true }
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
        <span key={d} className="w-1.5 h-1.5 bg-[#009A44] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  )
}

function Message({ msg, onSignIn, onSelectStore }) {
  const isUser = msg.role === 'user'
  const { clean, showSignIn, selectStore } = parseMsg(msg.content)
  const items = isUser ? [] : findItemsInText(clean)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      )}
      <div className="max-w-[84%] flex flex-col gap-2">
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser ? 'bg-[#009A44] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
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
          <button onClick={onSignIn} className="self-start bg-[#009A44] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#007A36] transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In to Order
          </button>
        )}
        {selectStore != null && (
          <button onClick={() => onSelectStore(selectStore)} className="self-start bg-[#009A44] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#007A36] transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  const [isOpen,      setIsOpen]      = useState(false)
  const [input,       setInput]       = useState('')
  const [isFocused,   setIsFocused]   = useState(false)
  const [isListening, setIsListening] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const recognitionRef = useRef(null)
  const blurTimer      = useRef(null)

  const pathname        = location.pathname
  const showSuggestions = isFocused && !input.trim() && !isOpen

  const greeting = pathname === '/store-select'
    ? "Hi! I can help you pick the perfect Subway location. The Rutherford & Weston store has the highest rating (4.5★) — want me to select it for you?"
    : (pathname === '/signin' || pathname === '/register')
    ? "Hi! I can help you find what you're looking for — no account needed to browse the menu or check deals!"
    : "Hi! I'm SubAI, your Subway assistant. Ask me about the menu, deals, nutrition, and more!"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 60)
  }, [isOpen])

  function onFocus() {
    clearTimeout(blurTimer.current)
    setIsFocused(true)
  }

  function onBlur() {
    blurTimer.current = setTimeout(() => setIsFocused(false), 180)
  }

  function handleSend(override) {
    const msg = (override ?? input).trim()
    if (!msg || isLoading) return
    setInput('')
    setIsFocused(false)
    setIsOpen(true)
    sendMessage(msg, pathname.replace('/', '') || 'home')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleSelectStore(storeId) {
    const store = stores.find(s => s.id === storeId)
    if (store) { ctxSelectStore(store); navigate('/menu') }
  }

  function handleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    if (isListening) { recognitionRef.current?.stop(); return }
    const r = new SR()
    recognitionRef.current  = r
    r.lang                  = 'en-US'
    r.interimResults        = false
    r.maxAlternatives       = 1
    r.onstart  = () => setIsListening(true)
    r.onend    = () => setIsListening(false)
    r.onerror  = () => setIsListening(false)
    r.onresult = (e) => {
      setInput(prev => (prev ? prev + ' ' : '') + e.results[0][0].transcript)
      inputRef.current?.focus()
    }
    r.start()
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 w-[min(520px,92vw)]">

      {/* ── Chat panel ── */}
      {isOpen && (
        <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: '420px', animation: 'subai-up 0.25s cubic-bezier(0.16,1,0.3,1)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#009A44] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-sm">SubAI</span>
              <span className="text-[10px] text-gray-400">· Subway's AI assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Clear</button>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            <div className="flex justify-start mb-3">
              <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm max-w-[84%] leading-relaxed">
                {greeting}
              </div>
            </div>

            {messages.map((msg, i) => (
              <Message key={i} msg={msg} onSignIn={() => navigate('/signin')} onSelectStore={handleSelectStore} />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <TypingDots />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ── Suggestion chips ── */}
      {showSuggestions && (
        <div className="flex gap-2 flex-wrap justify-center" style={{ animation: 'subai-up 0.18s ease' }}>
          {SUGGESTIONS.map(({ label, msg }) => (
            <button key={label}
              onMouseDown={e => { e.preventDefault(); clearTimeout(blurTimer.current); handleSend(msg) }}
              className="bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:border-[#009A44]/50 hover:text-[#007A36] hover:bg-[#F0F9F4] transition-all whitespace-nowrap">
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Pill bar ── */}
      <div className={`w-full flex items-center gap-2 bg-white rounded-full px-3 py-2 transition-all duration-200 ${
        isFocused || isOpen
          ? 'shadow-[0_4px_24px_rgba(0,154,68,0.15)] border-2 border-[#009A44]/35'
          : 'shadow-[0_4px_18px_rgba(0,0,0,0.10)] border border-gray-200'
      }`}>

        {/* Sparkle */}
        <div className="w-8 h-8 rounded-full bg-[#009A44]/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#009A44]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={() => { if (messages.length > 0) setIsOpen(true) }}
          placeholder="Ask Anything!"
          disabled={isLoading}
          className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50 min-w-0"
        />

        {/* Mic */}
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={handleVoice}
          title={isListening ? 'Stop' : 'Voice input'}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
            isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-[#009A44] hover:bg-[#009A44]/10'
          }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
          </svg>
        </button>

        {/* Send */}
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="w-8 h-8 rounded-full bg-[#009A44] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#007A36] active:scale-90 transition-all flex-shrink-0 shadow-sm">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes subai-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
