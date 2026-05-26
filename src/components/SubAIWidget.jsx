import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAIChat } from '../ai/useAIChat'
import SubIngredientBuilder from './SubIngredientBuilder'

// ─── Ingredient detection helpers ────────────────────────────────────────────

const VEGGIE_KEYWORDS = {
  lettuce:  ['lettuce'],
  tomato:   ['tomato'],
  onion:    ['onion'],
  cucumber: ['cucumber'],
  peppers:  ['pepper'],
  spinach:  ['spinach'],
  olives:   ['olive'],
}

const SUB_PRESETS = {
  'bmt':        { protein: true, cheese: 'provolone',  veggies: ['lettuce','tomato','onion'],              sauce: 'chipotle' },
  'chicken':    { protein: true, cheese: 'pepperjack', veggies: ['lettuce','tomato','peppers'],             sauce: 'chipotle' },
  'tuna':       { protein: true, cheese: 'american',   veggies: ['lettuce','tomato','cucumber'],            sauce: 'ranch' },
  'veggie':     { protein: false,cheese: 'swiss',      veggies: ['lettuce','tomato','cucumber','peppers','spinach'], sauce: 'honey mustard' },
  'meatball':   { protein: true, cheese: 'provolone',  veggies: ['onion','peppers'],                       sauce: null },
  'steak':      { protein: true, cheese: 'american',   veggies: ['lettuce','tomato','onion','peppers'],     sauce: 'chipotle' },
  'turkey':     { protein: true, cheese: 'american',   veggies: ['lettuce','tomato'],                      sauce: 'ranch' },
  'rotisserie': { protein: true, cheese: 'swiss',      veggies: ['lettuce','tomato','cucumber'],            sauce: 'ranch' },
}

function detectSandwich(messages) {
  const assistant = messages.filter(m => m.role === 'assistant')
  if (!assistant.length) return { protein: null, cheese: null, veggies: [], sauce: null }

  const allText = assistant.map(m => m.content).join(' ').toLowerCase()
  const result  = { protein: null, cheese: null, veggies: [], sauce: null }

  // ITEM: pattern → preset
  const itemMatch = allText.match(/item:\s*([^\n,!.]+)/)
  if (itemMatch) {
    const name = itemMatch[1].trim()
    for (const [key, preset] of Object.entries(SUB_PRESETS)) {
      if (name.includes(key)) { Object.assign(result, preset); break }
    }
  }

  // BUILD_SUB pattern → preset
  const buildSubMsg = assistant.find(m => m.buildSub)
  if (buildSubMsg && !itemMatch) {
    const name = buildSubMsg.buildSub.toLowerCase()
    for (const [key, preset] of Object.entries(SUB_PRESETS)) {
      if (name.includes(key)) { Object.assign(result, preset); break }
    }
  }

  // Keyword scan (additive fill-in)
  if (!result.protein) {
    result.protein = ['chicken','steak','tuna','meatball','turkey','ham','salami','veggie patty','rotisserie'].some(k => allText.includes(k))
  }
  if (!result.cheese) {
    const found = ['provolone','pepperjack','swiss','cheddar','american'].find(k => allText.includes(k))
    result.cheese = found || (allText.includes('cheese') ? 'american' : null)
  }
  if (!result.veggies.length) {
    result.veggies = Object.entries(VEGGIE_KEYWORDS)
      .filter(([, kws]) => kws.some(k => allText.includes(k)))
      .map(([name]) => name)
  }
  if (!result.sauce) {
    result.sauce = ['ranch','chipotle','honey mustard','sweet onion','buffalo','mayo','mustard'].find(k => allText.includes(k)) || null
  }

  return result
}

// ─── Sandwich visualization ───────────────────────────────────────────────────

function SandwichViz({ sandwich }) {
  const { protein, cheese, veggies, sauce } = sandwich
  const hasLettuce  = veggies.includes('lettuce')
  const hasTomato   = veggies.includes('tomato')
  const hasOnion    = veggies.includes('onion')
  const hasOtherVeg = veggies.some(v => !['lettuce','tomato','onion'].includes(v))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>

      {/* Top bread */}
      <div style={{ width: '88%', height: 14, borderRadius: '10px 10px 3px 3px',
        background: 'linear-gradient(180deg,#F2D898 0%,#D4A15E 100%)',
        boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.09), 0 1px 0 #c8934e' }} />

      {/* Sauce drizzle */}
      {sauce && (
        <div style={{ width: '82%', height: 4, borderRadius: 2,
          background: 'repeating-linear-gradient(90deg,rgba(255,183,77,.85) 0px,rgba(255,183,77,.85) 8px,rgba(255,213,79,.45) 8px,rgba(255,213,79,.45) 14px)',
          transition: 'opacity .4s' }} />
      )}

      {/* Protein */}
      {protein && (
        <div style={{ width: '84%', height: 10, borderRadius: 3,
          background: 'linear-gradient(180deg,#B85C38 0%,#7A3B10 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.15)', transition: 'opacity .4s' }} />
      )}

      {/* Cheese */}
      {cheese && (
        <div style={{ width: '86%', height: 6, borderRadius: '2px 2px 6px 6px',
          background: 'linear-gradient(180deg,#FFD54F 0%,#FFA000 100%)',
          transition: 'opacity .4s' }} />
      )}

      {/* Lettuce – wavy top via border-radius asymmetry */}
      {hasLettuce && (
        <div style={{ width: '83%', height: 9, borderRadius: '6px 3px 1px 4px',
          background: 'linear-gradient(180deg,#81C784 0%,#388E3C 100%)',
          borderBottom: '2px solid #2E7D32', transition: 'opacity .4s' }} />
      )}

      {/* Tomato circles */}
      {hasTomato && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, transition: 'opacity .4s' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ width: 11, height: 8, flexShrink: 0,
              background: 'radial-gradient(circle at 35% 35%,#FFCDD2,#C62828)',
              borderRadius: '50%', border: '1px solid rgba(198,40,40,.3)' }} />
          ))}
        </div>
      )}

      {/* Onion */}
      {hasOnion && (
        <div style={{ width: '76%', height: 4, borderRadius: 2,
          background: 'rgba(186,104,200,.6)', transition: 'opacity .4s' }} />
      )}

      {/* Other veggies (cucumber / peppers / spinach / olives) */}
      {hasOtherVeg && (
        <div style={{ width: '80%', height: 5, borderRadius: 2,
          background: 'repeating-linear-gradient(90deg,#66BB6A 0px,#66BB6A 5px,#A5D6A7 5px,#A5D6A7 11px)',
          transition: 'opacity .4s' }} />
      )}

      {/* Bottom bread */}
      <div style={{ width: '92%', height: 14, borderRadius: '3px 3px 10px 10px',
        background: 'linear-gradient(180deg,#C49A50 0%,#8A5C1A 100%)',
        boxShadow: '0 3px 6px rgba(0,0,0,.18)' }} />
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ sandwich }) {
  const steps = [
    { label: 'Bread',   done: true },
    { label: 'Protein', done: !!sandwich.protein },
    { label: 'Cheese',  done: !!sandwich.cheese },
    { label: 'Veggies', done: sandwich.veggies.length > 0 },
    { label: 'Sauce',   done: !!sandwich.sauce },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 6 }}>
      {steps.map((step, i) => (
        <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{
            fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
            whiteSpace: 'nowrap', transition: 'all .4s ease',
            background: step.done ? '#009A44' : '#F3F4F6',
            color: step.done ? '#fff' : '#9CA3AF',
          }}>
            {step.done ? '✓ ' : ''}{step.label}
          </span>
          {i < steps.length - 1 && (
            <span style={{ fontSize: 8, color: step.done ? '#009A44' : '#D1D5DB', transition: 'color .4s' }}>›</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function SubAIWidget() {
  const location = useLocation()
  const { user } = useAuth()
  const { messages, isLoading, sendMessage, clearChat } = useAIChat({ isLoggedIn: !!user?.isLoggedIn })

  const [isOpen, setIsOpen]         = useState(false)
  const [input, setInput]           = useState('')
  const [isListening, setIsListening] = useState(false)
  const [sandwich, setSandwich]     = useState({ protein: null, cheese: null, veggies: [], sauce: null })
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    setSandwich(detectSandwich(messages))
  }, [messages])

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

  const hasSandwichContent = sandwich.protein || sandwich.cheese || sandwich.veggies.length || sandwich.sauce

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-[min(560px,90vw)]">

      {/* Chat panel */}
      {isOpen && (
        <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: '540px' }}>

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

          {/* ── Sandwich preview ─────────────────────────────────────────── */}
          <div className="flex-shrink-0 border-b border-gray-100 px-4 pt-2.5 pb-2.5"
            style={{ background: 'linear-gradient(180deg,#FFFBF0 0%,#fff 100%)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Your Sandwich</span>
              {hasSandwichContent && (
                <span className="text-[8px] text-[#009A44] font-semibold">Building…</span>
              )}
            </div>
            <SandwichViz sandwich={sandwich} />
            <StepIndicator sandwich={sandwich} />
          </div>

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
                {msg.buildSub ? (
                  <div className="flex flex-col gap-2 max-w-[92%] min-w-0">
                    {msg.content && (
                      <div className="px-3.5 py-2.5 rounded-2xl text-sm bg-gray-100 text-gray-800 rounded-bl-sm">
                        {msg.content}
                      </div>
                    )}
                    <SubIngredientBuilder subName={msg.buildSub} />
                  </div>
                ) : (
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-[#009A44] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-1">S</div>
                <div className="flex items-end gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm">
                  {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
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

      {/* Bottom pill – always visible */}
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
