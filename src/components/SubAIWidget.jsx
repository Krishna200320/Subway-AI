import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAIChat } from '../ai/useAIChat'

export default function SubAIWidget() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, selectStore: ctxSelectStore } = useAuth()
  const { messages, isLoading, sendMessage, clearChat } = useAIChat({ isLoggedIn: !!user?.isLoggedIn })

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

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
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-[min(560px,90vw)]">

      {/* Chat panel - slides up when open */}
      {isOpen && (
        <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: '420px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#009A44]">
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
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-[#009A44] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#009A44] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-1">S</div>
                <div className="flex items-end gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm">
                  {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="flex justify-center gap-3 py-2 border-t border-gray-100">
            {['SubAssist','ToneSense','BrainMenu'].map(label => (
              <span key={label} className="text-[9px] text-gray-400 font-semibold">★ {label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom pill - always visible */}
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
        <button onClick={handleVoice} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7V3a3 3 0 00-6 0v8a3 3 0 006 0z" />
          </svg>
        </button>
        <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="w-8 h-8 rounded-full bg-[#009A44] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#007A36] transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      <p className="text-[9px] text-gray-400">SubAI · Subway's AI assistant</p>
    </div>
  )
}