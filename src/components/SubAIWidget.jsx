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

const QUICK_ACTIONS = [
  { label: 'Surprise me',   msg: 'Surprise me with a Subway recommendation!' },
  { label: 'Most popular',  msg: 'What are the most popular items at Subway right now?' },
  { label: 'Something new', msg: "What's new at Subway? Any new items or limited-time offers?" },
  { label: 'My usual',      msg: 'What would you recommend as a classic Subway order?' },
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
    <div className="flex items-end gap-1 px-4 py-3 bg-white rounded-2xl rounded-bl-sm w-fit shadow-sm border border-gray-100">
      {[0, 150, 300].map(d => (
        <span key={d} className="w-1.5 h-1.5 bg-[#009A44] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
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
        <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-sm">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 4.8 5.3.8-3.85 3.75.91 5.3L12 14.1l-4.76 2.55.91-5.3L4.3 7.6l5.3-.8z"/>
          </svg>
        </div>
      )}
      <div className="max-w-[82%] flex flex-col gap-2">
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-[#009A44] text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
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
            className="self-start bg-[#009A44] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#007A36] transition-colors flex items-center gap-1.5 shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In to Order
          </button>
        )}
        {selectStore != null && (
          <button onClick={() => onSelectStore(selectStore)}
            className="self-start bg-[#009A44] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#007A36] transition-colors flex items-center gap-1.5 shadow-sm">
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

  const [isOpen,      setIsOpen]      = useState(true)
  const [input,       setInput]       = useState('')
  const [isListening, setIsListening] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const recognitionRef = useRef(null)

  const pathname = location.pathname

  const greeting = pathname === '/store-select'
    ? "Hi! I can help you pick the perfect Subway location. The Rutherford & Weston store has the highest rating (4.5★) — want me to select it for you?"
    : (pathname === '/signin' || pathname === '/register')
    ? "Hi! I can help you find what you're looking for — no account needed to browse the menu or check deals!"
    : "Hi! I'm SubAI, your Subway assistant. Ask me about the menu, deals, nutrition info, or anything else!"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80)
  }, [isOpen])

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

  function handleSelectStore(storeId) {
    const store = stores.find(s => s.id === storeId)
    if (store) { ctxSelectStore(store); navigate('/menu') }
  }

  function handleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    if (isListening) { recognitionRef.current?.stop(); return }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang           = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart  = () => setIsListening(true)
    recognition.onend    = () => setIsListening(false)
    recognition.onerror  = () => setIsListening(false)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => (prev ? prev + ' ' : '') + transcript)
      inputRef.current?.focus()
    }
    recognition.start()
  }

  return (
    <>
      {/* ── Collapsed tab — shown when panel is closed ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#009A44] text-white py-5 px-2.5 rounded-l-2xl shadow-xl flex flex-col items-center gap-2 hover:bg-[#007A36] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            SubAI
          </span>
        </button>
      )}

      {/* ── Full panel ── */}
      {isOpen && (
        <div
          className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl"
          style={{ width: '360px', maxWidth: '90vw', animation: 'subai-slide-in 0.24s cubic-bezier(0.16,1,0.3,1)' }}
        >

          {/* ── Green header ── */}
          <div className="bg-[#009A44] px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              {/* Logo mark */}
              <div className="w-9 h-9 bg-[#FFCC00] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-[#009A44] font-black text-base leading-none">S</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-extrabold text-sm tracking-tight">Subway AI</span>
                  <span className="bg-white/25 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
                    SubAssist
                  </span>
                </div>
                <p className="text-white/60 text-[10px] leading-tight mt-0.5">Your personal Subway assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={clearChat}
                className="text-white/70 hover:text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-white/15 transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages area ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F6F8F6] min-h-0">
            {/* Greeting */}
            <div className="flex justify-start mb-4">
              <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-sm">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 4.8 5.3.8-3.85 3.75.91 5.3L12 14.1l-4.76 2.55.91-5.3L4.3 7.6l5.3-.8z"/>
                </svg>
              </div>
              <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm max-w-[82%] leading-relaxed shadow-sm border border-gray-100">
                {greeting}
              </div>
            </div>

            {messages.map((msg, i) => (
              <WidgetMessage key={i} msg={msg} onSignIn={() => navigate('/signin')} onSelectStore={handleSelectStore} />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-sm">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 4.8 5.3.8-3.85 3.75.91 5.3L12 14.1l-4.76 2.55.91-5.3L4.3 7.6l5.3-.8z"/>
                  </svg>
                </div>
                <TypingDots />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick action pills ── */}
          <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex gap-2 flex-wrap flex-shrink-0">
            {QUICK_ACTIONS.map(({ label, msg }) => (
              <button
                key={label}
                onClick={() => handleSend(msg)}
                disabled={isLoading}
                className="bg-[#F0F7F2] text-[#007A36] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#009A44]/20 hover:bg-[#009A44] hover:text-white hover:border-transparent transition-all active:scale-95 disabled:opacity-40"
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Input bar ── */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-2 py-1.5 focus-within:border-[#009A44]/50 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(0,154,68,0.08)] transition-all">
              {/* Express button */}
              <button
                onClick={() => navigate('/menu')}
                className="flex-shrink-0 bg-[#009A44] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl hover:bg-[#007A36] active:scale-95 transition-all shadow-sm"
              >
                Express
              </button>

              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                disabled={isLoading}
                className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50 min-w-0"
              />

              {/* Mic button */}
              <button
                onClick={handleVoice}
                title={isListening ? 'Stop listening' : 'Voice input'}
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                  isListening
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-[#009A44] hover:bg-[#009A44]/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                </svg>
              </button>

              {/* Send button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-[#009A44] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#007A36] active:scale-90 transition-all flex-shrink-0 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Powered by footer ── */}
          <div className="px-4 py-2.5 bg-white border-t border-gray-100 flex items-center justify-center gap-3 flex-shrink-0">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Powered by</span>
            {[
              { label: 'SubAssist', color: '#009A44' },
              { label: 'ToneSense', color: '#534AB7' },
              { label: 'BrainMenu', color: '#FFCC00' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1">
                <svg className="w-2 h-2 flex-shrink-0" viewBox="0 0 24 24" fill={color}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-[9px] font-semibold text-gray-500">{label}</span>
              </div>
            ))}
          </div>

        </div>
      )}

      <style>{`
        @keyframes subai-slide-in {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
