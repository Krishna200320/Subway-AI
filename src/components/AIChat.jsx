import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAIChat } from '../ai/useAIChat'
import { useAuth } from '../context/AuthContext'
import { useBuilder } from '../context/BuilderContext'
import { useDemo } from '../context/DemoContext'
import { useGhostNav } from '../context/GhostNavContext'
import { getTheme } from '../ai/personalityThemes'
import { parseGhostActions } from '../ai/ghostNavigator'
import { detectFrustration } from '../ai/motivaMX'
import VoiceExpressOverlay from './VoiceExpressOverlay'
import MessageRenderer from './ai/MessageRenderer'


const EXPRESS_TRIGGERS = [
  'i want to order', 'order me a', "i'll have", 'give me a', 'add to my cart',
  'i want to eat', 'hey i want', 'can i get', "i'd like",
]

function hasExpressTrigger(text) {
  return EXPRESS_TRIGGERS.some(t => text.toLowerCase().includes(t))
}

/* ── Deal ticker ── */
function DealTicker({ text }) {
  const doubled = `${text}  ·  ${text}`
  return (
    <div className="overflow-hidden bg-amber-100 text-amber-800 text-[10px] font-semibold py-1 flex-shrink-0">
      <div style={{ animation: 'ticker 25s linear infinite', display: 'inline-flex', whiteSpace: 'nowrap' }}>
        {doubled}
      </div>
    </div>
  )
}

/* ── Theme flash ── */
function ThemeFlash({ color }) {
  return (
    <div className="absolute inset-0 rounded-2xl pointer-events-none z-10"
      style={{ backgroundColor: color, animation: 'themeFlash 0.6s ease forwards', opacity: 0 }} />
  )
}

/* ── Quick reply chips ── */
function QuickReplies({ replies, onSelect, accentColor }) {
  if (!replies?.length) return null
  return (
    <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
      {replies.map(r => (
        <button key={r} onClick={() => onSelect(r)}
          className="text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all hover:scale-[1.03]"
          style={{ borderColor: accentColor, color: accentColor }}>
          {r}
        </button>
      ))}
    </div>
  )
}

/* ── Product badge ── */
function ProductBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      {label}
    </span>
  )
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm w-fit">
      {[0, 150, 300].map(d => (
        <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  )
}

/* ── Message bubble ── */
function Message({ msg, theme, onReply }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black mr-2 flex-shrink-0 mt-1"
          style={{ backgroundColor: theme.accentColor }}>S</div>
      )}
      <div className="max-w-[85%]">
        <div className={`px-4 py-2.5 rounded-2xl ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
          style={isUser
            ? { backgroundColor: theme.accentColor, color: '#ffffff', transition: 'background-color 0.4s ease' }
            : { ...theme.bubbleStyle, transition: 'all 0.4s ease' }}>
          <MessageRenderer content={msg.content} onReply={onReply} isUser={isUser} />
        </div>
      </div>
    </div>
  )
}

/* ── Escalation card ── */
function EscalationCard({ phase, onTalkToStaff }) {
  if (phase === 'offer') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mx-1 mb-3"
        style={{ animation: 'nudgeFadeIn 0.4s ease both' }}>
        <p className="text-blue-900 text-sm font-semibold mb-1">
          I can see this isn't quite working
        </p>
        <p className="text-blue-700 text-xs mb-3">
          Would you like to speak with someone at the store?
        </p>
        <button onClick={onTalkToStaff}
          className="w-full bg-[#009A44] text-white font-bold py-2 rounded-full text-sm hover:bg-[#007A36] transition-colors">
          Talk to Staff
        </button>
      </div>
    )
  }
  if (phase === 'connecting') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mx-1 mb-3"
        style={{ animation: 'nudgeFadeIn 0.4s ease both' }}>
        <p className="text-blue-900 text-sm font-semibold mb-2">
          Connecting you to Vaughan Mills — est. wait 2 mins
        </p>
        <div className="flex items-center gap-1.5">
          {[0, 200, 400].map(d => (
            <span key={d} className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    )
  }
  if (phase === 'connected') {
    return (
      <div className="bg-blue-100 border border-blue-300 rounded-2xl p-4 mx-1 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-blue-900 text-sm font-bold">Connected to Vaughan Mills staff</p>
        </div>
        <p className="text-blue-700 text-xs">A team member will respond shortly.</p>
      </div>
    )
  }
  return null
}

/* ── Mic button ── */
function MicButton({ onTranscript, onExpressStart, disabled, voiceMode, accentColor }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  function toggle() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Voice input needs Chrome or Edge.'); return }
    if (listening) { recRef.current?.stop(); return }

    const rec = new SR()
    rec.continuous      = false
    rec.interimResults  = true
    rec.lang            = 'en-CA'
    recRef.current      = rec

    rec.onresult = (e) => {
      const t       = Array.from(e.results).map(r => r[0].transcript).join('')
      const isFinal = e.results[e.results.length - 1].isFinal
      if (voiceMode === 'express' && isFinal && hasExpressTrigger(t)) {
        rec.stop()
        onExpressStart?.(t)
        return
      }
      onTranscript(t, isFinal)
    }
    rec.onend   = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.start()
    setListening(true)
  }

  return (
    <div className="relative group">
      <button type="button" onClick={toggle} disabled={disabled}
        title={`Voice Input (${voiceMode === 'express' ? 'Express' : 'Chat'} mode)`}
        className={`p-2 rounded-full transition-all disabled:opacity-40 ${listening ? 'animate-pulse' : ''}`}
        style={listening ? { backgroundColor: '#ef4444', color: '#fff' } : { color: '#9ca3af' }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex pointer-events-none">
        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {listening ? 'Listening — tap to stop' : `Voice Input (${voiceMode === 'express' ? '⚡ Express' : '💬 Chat'})`}
        </div>
      </div>
    </div>
  )
}

/* ── Voice mode toggle ── */
function VoiceModeToggle({ mode, onToggle }) {
  return (
    <button onClick={onToggle} title="Switch voice input mode"
      className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 flex items-center gap-1 text-[10px] font-semibold">
      <span>{mode === 'express' ? '⚡' : '💬'}</span>
      <span className="hidden sm:inline">{mode === 'express' ? 'Express' : 'Chat'}</span>
    </button>
  )
}

/* ── Powered by footer ── */
function PoweredByFooter() {
  return (
    <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-center gap-3 bg-gray-50 flex-shrink-0">
      <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Powered by</span>
      {[
        { label: 'SubAssist', desc: 'Search & Guide' },
        { label: 'ToneSense', desc: 'Tone Engine'    },
        { label: 'BrainMenu', desc: 'Menu Knowledge' },
      ].map(({ label, desc }) => (
        <div key={label} className="flex items-center gap-1">
          <svg className="w-2.5 h-2.5 text-[#009A44] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-[9px] text-gray-500 font-semibold">{label}</span>
          <span className="text-[9px] text-gray-400 hidden sm:inline">· {desc}</span>
        </div>
      ))}
    </div>
  )
}

function getPageGreeting(pathname, userName) {
  const name = userName ? `, ${userName}` : ''
  if (pathname === '/build')
    return `Hey${name}! 🥖 I'm watching your build. Tell me what to change or ask for a combo suggestion!`
  if (pathname.startsWith('/menu'))
    return `Hey${name}! 👋 I'm Sub — your Subway AI. Tell me what you're craving and I'll pre-fill the builder for you!`
  if (pathname.startsWith('/cart'))
    return `Hey${name}! 🛒 I can see your cart. Ready to checkout, or want to add anything?`
  return `Hi${name}! I'm Sub 🥖 — ask me anything about the menu, deals, or nutrition!`
}

export default function AIChat() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { prefillBuilder, getCurrentBuild, aiPrefilled, reviewNudgeCache } = useBuilder()
  const { demoMode, showBadge } = useDemo()
  const { queueHighlights, queueCategoryScroll, applyPendingHighlights, ghostNavActive } = useGhostNav()

  const isOnBuilder = location.pathname === '/build'

  const { messages, isLoading, personality, goToCartReady, sendMessage, clearChat } = useAIChat({
    onPrefillBuilder: (selections) => {
      prefillBuilder(selections)
      if (demoMode) showBadge('SubAssist')
    },
    getCurrentBuild: isOnBuilder ? getCurrentBuild : null,
  })

  const [isOpen,           setIsOpen]           = useState(false)
  const [input,            setInput]            = useState('')
  const [showTip,          setShowTip]          = useState(() => !localStorage.getItem('subway_ai_visited'))
  const [voiceMode,        setVoiceMode]        = useState('express')
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false)
  const [themeFlash,       setThemeFlash]       = useState(false)
  const [frustratedCount,  setFrustratedCount]  = useState(0)
  const [escalationPhase,  setEscalationPhase]  = useState(null) // null | 'offer' | 'connecting' | 'connected'

  const messagesEndRef  = useRef(null)
  const inputRef        = useRef(null)
  const prevPersonality = useRef(personality)

  const theme   = getTheme(personality)
  const greeting = theme.greeting || getPageGreeting(location.pathname, user?.name)

  // Staff support mode overrides header styling
  const isStaffMode  = escalationPhase !== null
  const headerBg     = isStaffMode ? '#2563EB' : theme.headerBg
  const headerTitle  = isStaffMode ? 'Staff Support' : 'Subway AI'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, escalationPhase])

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('subway_ai_visited', '1')
      setShowTip(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  /* StyleSense theme flash */
  useEffect(() => {
    if (personality && personality !== prevPersonality.current) {
      setThemeFlash(true)
      setTimeout(() => setThemeFlash(false), 600)
      prevPersonality.current = personality
      if (demoMode) showBadge('ToneSense')
    }
  }, [personality, demoMode, showBadge])

  /* Ghost navigation — fires after each AI response */
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant' || isLoading) return

    const actions = parseGhostActions(lastMsg.content)
    if (!actions.length) return

    const onMenu = location.pathname === '/menu'

    for (const action of actions) {
      if (action.type === 'highlightItems') {
        queueHighlights(action.itemIds)
        if (onMenu) applyPendingHighlights()
        else navigate('/menu')
        if (demoMode) showBadge('BrainMenu')
        break
      }
      if (action.type === 'scrollToCategory') {
        queueCategoryScroll(action.catId)
        if (!onMenu) navigate('/menu')
        if (demoMode) showBadge('BrainMenu')
        break
      }
      if (action.type === 'showPromos') {
        if (location.pathname !== '/') navigate('/')
        if (demoMode) showBadge('BrainMenu')
        break
      }
      if (action.type === 'navigateTo') {
        navigate(`/${action.page}`)
        break
      }
    }
  }, [messages, isLoading])

  function handleSend(text) {
    const t = (text || input).trim()
    if (!t || isLoading) return
    setInput('')

    // Frustration tracking for emotion-aware escalation
    if (detectFrustration(t)) {
      setFrustratedCount(prev => {
        const next = prev + 1
        if (next >= 3 && !escalationPhase) setEscalationPhase('offer')
        return next
      })
    } else {
      setFrustratedCount(0)
    }

    const page = location.pathname.replace('/', '') || 'home'
    sendMessage(t, page)
    if (demoMode) showBadge('SubAssist')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleTranscript(text, isFinal) {
    setInput(text)
    if (isFinal) {
      setInput('')
      sendMessage(text, location.pathname.replace('/', '') || 'home')
    }
  }

  function handleExpressStart() {
    setShowVoiceOverlay(true)
  }

  function handleTalkToStaff() {
    setEscalationPhase('connecting')
    setTimeout(() => setEscalationPhase('connected'), 2500)
  }

  function handleVoiceFallback(transcript) {
    setInput(transcript || '')
    setIsOpen(true)
  }

  const showSuggestionBadge = isOnBuilder && reviewNudgeCache?.current

  const panelStyle = isOnBuilder
    ? { bottom: 0, right: 0, top: 0, width: 'min(360px,100vw)', height: '100vh', borderRadius: '1rem 0 0 1rem' }
    : { bottom: '6rem', right: '1.5rem', width: 'min(380px,calc(100vw-3rem))', height: '540px', borderRadius: '1rem' }

  return (
    <>
      {/* Dim overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-300"
          style={{ backgroundColor: ghostNavActive ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)' }} />
      )}

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {showTip && !isOpen && (
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <span>✨ Try AI ordering</span>
            <button onClick={() => setShowTip(false)} className="text-gray-400 hover:text-white ml-1">×</button>
          </div>
        )}
        <div className="relative">
          {showSuggestionBadge && !isOpen && (
            <span className="absolute -top-1 -left-1 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10"
              style={{ backgroundColor: theme.accentColor }}>1 tip</span>
          )}
          <button onClick={() => setIsOpen(o => !o)} aria-label="Open AI assistant"
            className="relative w-14 h-14 rounded-full text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            style={{ backgroundColor: isStaffMode ? '#2563EB' : theme.accentColor, transition: 'background-color 0.4s ease' }}>
            {!isOpen && (
              <span className="absolute inset-0 rounded-full animate-ping pointer-events-none"
                style={{ backgroundColor: isStaffMode ? '#2563EB' : theme.accentColor, opacity: aiPrefilled ? 0.5 : 0.3 }} />
            )}
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed z-40 shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ ...panelStyle, backgroundColor: theme.panelBg, transition: 'background-color 0.4s ease' }}>

          {themeFlash && <ThemeFlash color={theme.accentColor} />}
          {theme.showTicker && theme.tickerText && <DealTicker text={theme.tickerText} />}

          {/* Header */}
          <div className="px-4 py-3 flex flex-col gap-1.5 flex-shrink-0"
            style={{ backgroundColor: headerBg, transition: 'background-color 0.4s ease' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-sm"
                  style={{ color: headerBg }}>
                  {isStaffMode ? '👤' : 'S'}
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{headerTitle}</p>
                  <div className="flex items-center gap-1">
                    {isStaffMode ? (
                      <ProductBadge label="Staff Support" />
                    ) : (
                      <>
                        <ProductBadge label="SubAssist" />
                        {isOnBuilder && <ProductBadge label="Builder" />}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isStaffMode && (
                  <button onClick={clearChat} className="text-white/60 hover:text-white text-xs">Clear</button>
                )}
                {isStaffMode && (
                  <button onClick={() => { setEscalationPhase(null); setFrustratedCount(0) }}
                    className="text-white/60 hover:text-white text-xs">End</button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ToneSense personality pill */}
            {personality && !isStaffMode && (
              <div className="flex items-center gap-1.5">
                <ProductBadge label="ToneSense" />
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ ...theme.pillStyle, animation: 'pillBounce 0.4s ease' }}>
                  {theme.pillLabel}
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <Message msg={{ role: 'assistant', content: greeting }} theme={theme} onReply={handleSend} />
            {messages.map((msg, i) => <Message key={i} msg={msg} theme={theme} onReply={handleSend} />)}

            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black mr-2 flex-shrink-0 mt-1"
                  style={{ backgroundColor: theme.accentColor }}>S</div>
                <TypingIndicator />
              </div>
            )}

            {/* Emotion-aware escalation card */}
            {escalationPhase && (
              <EscalationCard phase={escalationPhase} onTalkToStaff={handleTalkToStaff} />
            )}

            {goToCartReady && !isStaffMode && (
              <div className="mt-2 flex justify-center">
                <button onClick={() => navigate('/cart')}
                  className="text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors"
                  style={{ backgroundColor: theme.accentColor }}>
                  🛒 Go to Checkout
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies — hidden in staff mode */}
          {!isStaffMode && (
            <QuickReplies
              replies={theme.quickReplies}
              onSelect={handleSend}
              accentColor={theme.accentColor}
            />
          )}

          {/* Input area */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            {isStaffMode && escalationPhase === 'connected' ? (
              <p className="text-center text-xs text-blue-600 font-semibold py-2">
                Staff member connected — continue chatting below
              </p>
            ) : null}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 focus-within:ring-2 transition-all"
              style={{ '--tw-ring-color': headerBg }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isOnBuilder
                    ? 'Change something or ask for a suggestion…'
                    : isStaffMode
                    ? 'Message staff…'
                    : 'Ask anything — menu, deals, nutrition…'
                }
                disabled={isLoading}
                className="flex-1 text-sm py-2 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
              />
              {!isStaffMode && (
                <>
                  <VoiceModeToggle mode={voiceMode} onToggle={() => setVoiceMode(m => m === 'express' ? 'conversation' : 'express')} />
                  <MicButton
                    onTranscript={handleTranscript}
                    onExpressStart={handleExpressStart}
                    disabled={isLoading}
                    voiceMode={voiceMode}
                    accentColor={theme.accentColor}
                  />
                </>
              )}
              <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-full text-white flex items-center justify-center disabled:opacity-40 transition-colors flex-shrink-0"
                style={{ backgroundColor: headerBg }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Powered by footer */}
          {!isStaffMode && <PoweredByFooter />}
        </div>
      )}

      {/* Voice Express Overlay */}
      {showVoiceOverlay && (
        <VoiceExpressOverlay
          onClose={() => setShowVoiceOverlay(false)}
          onFallbackToChat={(transcript) => {
            setShowVoiceOverlay(false)
            handleVoiceFallback(transcript)
          }}
        />
      )}
    </>
  )
}
