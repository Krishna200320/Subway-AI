import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Markdown from 'react-markdown'
import { useAuth } from '../context/AuthContext'
import { useAIChat } from '../ai/useAIChat'
import SubIngredientBuilder from './SubIngredientBuilder'

// ─── BotMessage — markdown renderer with smart card / pill detection ─────────

// Recursively extract plain text from a React element tree
function getChildText(el) {
  if (!el) return ''
  if (typeof el === 'string' || typeof el === 'number') return String(el)
  const c = el?.props?.children
  if (!c) return ''
  if (typeof c === 'string') return c
  if (Array.isArray(c)) return c.map(getChildText).join('')
  return getChildText(c)
}

const mdComponents = {
  p:      ({ children }) => (
    <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 8, color: 'inherit' }}>{children}</p>
  ),
  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  em:     ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  ul: ({ children }) => {
    const items = (Array.isArray(children) ? children : [children]).filter(Boolean)
    const allShort = items.length >= 2 && items.every(c => {
      const t = getChildText(c)
      return t.length > 0 && t.length < 50
    })
    if (allShort) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '4px 0 8px' }}>
          {items.map((c, i) => (
            <span key={i} style={{
              background: '#f0faf5', border: '1px solid #009A44', borderRadius: 999,
              padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#009A44',
            }}>{getChildText(c)}</span>
          ))}
        </div>
      )
    }
    return <ul style={{ listStyle: 'disc', paddingLeft: 18, marginBottom: 8, fontSize: 13, lineHeight: 1.7 }}>{children}</ul>
  },
  ol: ({ children }) => (
    <ol style={{ listStyle: 'decimal', paddingLeft: 18, marginBottom: 8, fontSize: 13, lineHeight: 1.7 }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
}

const NUTRITION_RE = /\b(\d+\s*(cal|kcal|calories|g protein|g fat|mg sodium)|(?:calories|protein|fat|carbs?|sodium)\s*:?\s*\d+)/i

function BotMessage({ content }) {
  // Strip code fences
  const text = content.replace(/```[\s\S]*?```/g, '').trim()
  const isNutrition = NUTRITION_RE.test(text)

  const inner = <Markdown components={mdComponents}>{text}</Markdown>

  if (isNutrition) {
    return (
      <div style={{
        maxWidth: '90%', fontSize: 13, lineHeight: 1.7,
        background: '#fff', borderRadius: 12,
        border: '1px solid #e8f5e9', borderLeft: '3px solid #009A44',
        padding: 12, boxShadow: '0 1px 4px rgba(0,154,68,0.06)',
      }}>
        {inner}
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '90%', fontSize: 13, lineHeight: 1.7, color: '#1F2937',
      background: '#F3F4F6', borderRadius: '16px 16px 16px 4px',
      padding: '10px 14px',
    }}>
      {inner}
    </div>
  )
}

// ─── MenuItemCards ────────────────────────────────────────────────────────────

const FOOD_IMAGES = {
  'veggie delite':      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
  'turkey breast':      'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=300',
  'rotisserie chicken': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300',
  'meatball marinara':  'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300',
  'steak and cheese':   'https://images.unsplash.com/photo-1558030006-450675393462?w=300',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'

const NUTRITION_MAP = {
  'veggie delite':      { protein: 8,  fat: 2,  isVegetarian: true,  hasCheese: false },
  'turkey breast':      { protein: 18, fat: 3,  isVegetarian: false, hasCheese: false },
  'rotisserie chicken': { protein: 24, fat: 5,  isVegetarian: false, hasCheese: false },
  'meatball marinara':  { protein: 21, fat: 18, isVegetarian: false, hasCheese: true  },
  'steak and cheese':   { protein: 26, fat: 12, isVegetarian: false, hasCheese: true  },
}
const DEFAULT_NUTRITION = { protein: 18, fat: 8, isVegetarian: false, hasCheese: false }

function resolveImage(name) {
  const key = Object.keys(FOOD_IMAGES).find(k => name.toLowerCase().includes(k))
  return key ? FOOD_IMAGES[key] : DEFAULT_IMG
}
function resolveNutrition(name) {
  const key = Object.keys(NUTRITION_MAP).find(k => name.toLowerCase().includes(k))
  return key ? NUTRITION_MAP[key] : DEFAULT_NUTRITION
}

const FILTER_OPTIONS = ['Low Calorie', 'High Protein', 'Vegetarian', 'No Cheese']

function MenuItemCards({ items }) {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState(null)

  const enriched = items.map(item => ({
    ...item,
    image:     resolveImage(item.name),
    nutrition: resolveNutrition(item.name),
  }))

  const visible = enriched.filter(item => {
    if (!activeFilter) return true
    const cal = parseInt(item.calories)
    if (activeFilter === 'Low Calorie')  return cal < 400
    if (activeFilter === 'High Protein') return item.nutrition.protein >= 20
    if (activeFilter === 'Vegetarian')   return item.nutrition.isVegetarian
    if (activeFilter === 'No Cheese')    return !item.nutrition.hasCheese
    return true
  })

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(prev => prev === f ? null : f)}
            style={{
              fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
              border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s',
              borderColor: activeFilter === f ? '#009A44' : '#E5E7EB',
              background:  activeFilter === f ? '#009A44' : '#F9FAFB',
              color:       activeFilter === f ? '#fff'    : '#6B7280',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Horizontal card row */}
      <div className="scrollbar-hide" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {visible.length === 0
          ? <p style={{ fontSize: 12, color: '#9CA3AF', padding: '6px 2px' }}>No items match this filter.</p>
          : visible.map((item, i) => (
          <div key={item.name} style={{
            minWidth: 160, width: 160, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
            border: '1px solid #E5E7EB', background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            {/* Image */}
            <div style={{ position: 'relative' }}>
              <img
                src={item.image} alt={item.name}
                onError={e => { e.target.src = DEFAULT_IMG }}
                style={{ width: 160, height: 100, objectFit: 'cover', display: 'block' }}
              />
              {i === 0 && (
                <div style={{
                  position: 'absolute', top: 6, left: 6, borderRadius: 999,
                  background: '#009A44', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 6px',
                }}>★ AI Top Pick</div>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: '8px 10px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3, lineHeight: 1.25 }}>{item.name}</p>
              <p style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 5, lineHeight: 1.4 }}>
                {item.calories}cal · {item.nutrition.protein}g protein · {item.nutrition.fat}g fat
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#009A44', marginBottom: 8 }}>{item.price}</p>
              <button
                onClick={() => navigate('/build')}
                style={{
                  width: '100%', background: '#009A44', color: '#fff', border: 'none',
                  fontSize: 11, fontWeight: 700, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
                }}
              >Choose This</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SandwichBuilder ──────────────────────────────────────────────────────────

const PROTEIN_COLOR_MAP = [
  { keywords: ['chicken', 'rotisserie'], color: '#C4884F' },
  { keywords: ['steak'],                 color: '#8B4513' },
  { keywords: ['tuna'],                  color: '#F4A460' },
  { keywords: ['veggie', 'vegetarian'],  color: '#4CAF50' },
]

const SAUCE_COLOR_MAP = [
  { keyword: 'chipotle',      color: '#A0522D' },
  { keyword: 'honey mustard', color: '#DAA520' },
  { keyword: 'ranch',         color: '#EDE8D8' },
  { keyword: 'buffalo',       color: '#BF3604' },
  { keyword: 'sauce',         color: '#D4884A' },
]

function SandwichBuilder({ messages }) {
  const [layers, setLayers] = useState({
    protein: null, cheese: false, lettuce: false, tomato: false, onion: false, sauce: null,
  })

  useEffect(() => {
    const text = messages.filter(m => m.role === 'assistant').map(m => m.content).join(' ').toLowerCase()
    const next = { protein: null, cheese: false, lettuce: false, tomato: false, onion: false, sauce: null }

    for (const { keywords, color } of PROTEIN_COLOR_MAP) {
      if (keywords.some(k => text.includes(k))) { next.protein = color; break }
    }
    next.cheese  = text.includes('cheese') || text.includes('american') || text.includes('provolone') || text.includes('pepperjack')
    next.lettuce = text.includes('lettuce')
    next.tomato  = text.includes('tomato')
    next.onion   = text.includes('onion')
    for (const { keyword, color } of SAUCE_COLOR_MAP) {
      if (text.includes(keyword)) { next.sauce = color; break }
    }

    setLayers(next)
  }, [messages])

  const steps = [
    { label: 'Bread',   done: true },
    { label: 'Protein', done: !!layers.protein },
    { label: 'Cheese',  done: layers.cheese },
    { label: 'Veggies', done: layers.lettuce || layers.tomato || layers.onion },
    { label: 'Sauce',   done: !!layers.sauce },
  ]

  return (
    <div style={{
      flexShrink: 0, borderBottom: '1px solid #F3F4F6', padding: '8px 16px 10px',
      background: 'linear-gradient(180deg,#FFFBF0 0%,#fff 100%)',
    }}>
      {/* Sandwich cross-section — rendered top-to-bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Top bread */}
        <div style={{
          width: 200, height: 24, borderRadius: '20px 20px 0 0',
          background: 'linear-gradient(180deg,#A07840 0%,#D4A574 100%)',
          borderTop: '3px solid #8B6530',
        }} />

        {/* Onion — topmost filling layer */}
        {layers.onion   && <div className="layer-slide-in" style={{ width: 185, height: 6,  marginTop: 2, background: '#9C27B0', borderRadius: 3, opacity: 0.85 }} />}
        {/* Tomato */}
        {layers.tomato  && <div className="layer-slide-in" style={{ width: 188, height: 8,  marginTop: 2, background: '#E53935', borderRadius: 2 }} />}
        {/* Lettuce */}
        {layers.lettuce && <div className="layer-slide-in" style={{ width: 195, height: 12, marginTop: 2, background: '#4CAF50', borderRadius: '6px 3px 2px 5px', borderBottom: '2px solid #2E7D32' }} />}
        {/* Cheese */}
        {layers.cheese  && <div className="layer-slide-in" style={{ width: 190, height: 8,  marginTop: 2, background: '#FFD700', borderRadius: 2, boxShadow: '0 1px 0 #FFA000' }} />}
        {/* Protein */}
        {layers.protein && <div className="layer-slide-in" style={{ width: 185, height: 16, marginTop: 2, background: layers.protein, borderRadius: 3, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)' }} />}
        {/* Sauce */}
        {layers.sauce   && <div className="layer-slide-in" style={{ width: 190, height: 8,  marginTop: 2, background: layers.sauce, borderRadius: 2, opacity: 0.9 }} />}

        {/* Bottom bread */}
        <div style={{
          width: 200, height: 20, marginTop: 2, borderRadius: '0 0 20px 20px',
          background: 'linear-gradient(180deg,#D4A574 0%,#A07840 100%)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        }} />
      </div>

      {/* Step progress circles */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 8 }}>
        {steps.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${step.done ? '#009A44' : '#E5E7EB'}`,
                background: step.done ? '#009A44' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.35s ease',
              }}>
                {step.done && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{
                fontSize: 8, fontWeight: 600, whiteSpace: 'nowrap', transition: 'color 0.35s',
                color: step.done ? '#009A44' : '#9CA3AF',
              }}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 14, height: 1.5, marginBottom: 14, transition: 'background 0.35s',
                background: step.done ? '#009A44' : '#E5E7EB',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function SubAIWidget() {
  const location = useLocation()
  const { user } = useAuth()
  const { messages, isLoading, sendMessage, clearChat } = useAIChat({ isLoggedIn: !!user?.isLoggedIn })

  const [isOpen, setIsOpen]           = useState(false)
  const [input, setInput]             = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSend(override) {
    const msg = (override ?? input).trim()
    if (!msg || isLoading) return
    setInput('')
    setIsOpen(true)
    const page = location.pathname.replace('/', '') || 'home'
    sendMessage(msg, page)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.lang = 'en-US'
    setIsListening(true)
    recognition.onresult = e => { setInput(e.results[0][0].transcript); setIsListening(false) }
    recognition.onerror  = () => setIsListening(false)
    recognition.onend    = () => setIsListening(false)
    recognition.start()
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-[min(560px,90vw)]">

      {/* Chat panel */}
      {isOpen && (
        <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: '560px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#009A44] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm">S</div>
              <div>
                <p className="font-bold text-white text-sm">Subway AI</p>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">★ SubAssist</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={clearChat} className="text-white/70 hover:text-white text-xs">Clear</button>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sandwich Builder — logged-in users only */}
          {user?.isLoggedIn && <SandwichBuilder messages={messages} />}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {messages.length === 0 && (
              <div className="flex gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-1">S</div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-gray-800 max-w-[85%]">
                  Hi! I'm SubAI — ask me anything about the menu, deals, or nutrition!
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                {msg.role !== 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center text-white text-[10px] font-black mr-2 flex-shrink-0 mt-1">S</div>
                )}

                {/* Food card row */}
                {msg.menuItems ? (
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    {msg.content && <BotMessage content={msg.content} />}
                    <MenuItemCards items={msg.menuItems} />
                  </div>

                /* Ingredient builder card */
                ) : msg.buildSub ? (
                  <div className="flex flex-col gap-2 max-w-[92%] min-w-0">
                    {msg.content && <BotMessage content={msg.content} />}
                    <SubIngredientBuilder subName={msg.buildSub} />
                  </div>

                /* User bubble */
                ) : msg.role === 'user' ? (
                  <div className="px-3.5 py-2.5 rounded-2xl text-sm max-w-[85%] bg-[#009A44] text-white rounded-br-sm">
                    {msg.content}
                  </div>

                /* Bot message with markdown + smart cards */
                ) : (
                  <BotMessage content={msg.content} />
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-1">S</div>
                <div className="flex items-end gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm">
                  {[0,150,300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="flex justify-center gap-3 py-2 border-t border-gray-100 flex-shrink-0">
            {['SubAssist','ToneSense','BrainMenu'].map(label => (
              <span key={label} className="text-[9px] text-gray-400 font-semibold">★ {label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom pill — always visible */}
      <div className="w-full flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-3 shadow-lg">
        <svg className="w-5 h-5 text-[#009A44] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Ask Anything!"
          disabled={isLoading}
          className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
        />
        <button
          onClick={handleVoice}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7V3a3 3 0 00-6 0v8a3 3 0 006 0z" />
          </svg>
        </button>
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="w-8 h-8 rounded-full bg-[#009A44] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#007A36] transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      <p className="text-[9px] text-gray-400">SubAI · Subway's AI assistant</p>
    </div>
  )
}
