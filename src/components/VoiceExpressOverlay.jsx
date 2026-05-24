import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { callClaude } from '../config/api'
import { useCart } from '../context/CartContext'
import { useBuilder } from '../context/BuilderContext'
import { useToast } from '../context/ToastContext'

const VOICE_SYSTEM = `You are a Subway Canada order parser. The user spoke an order request.
Extract order details and respond ONLY with valid JSON — nothing else before or after:
{"item":"footlong","protein":"turkey","bread":"wheat","cheese":"american","veggies":["Lettuce","Tomatoes"],"sauces":["Chipotle Southwest"]}

Item: footlong | sixinch | wrap | bowl
Bread: wheat | italian | multigrain | flatbread | sourdough
Protein: bmt | chicken | steak | tuna | turkey | meatball | veggie
Cheese: none | american | cheddar | provolone | swiss | pepperjack
Veggies (exact): Lettuce, Tomatoes, Cucumbers, Green Peppers, Red Onions, Jalapeños, Pickles, Olives, Banana Peppers, Spinach, Avocado
Sauces (exact): Mayo, Yellow Mustard, Honey Mustard, Ranch, Chipotle Southwest, Sweet Onion, Buffalo, Oil & Vinegar

Make sensible defaults for anything unclear. Always return valid JSON.`

const ITEM_MAP    = { footlong: 'Footlong', sixinch: '6-inch', wrap: 'Wrap', bowl: 'Bowl' }
const BREAD_MAP   = { wheat: '9-Grain Wheat', italian: 'Italian White', multigrain: 'Hearty Multigrain', flatbread: 'Flatbread', sourdough: 'Sourdough' }
const PROTEIN_MAP = { bmt: 'Italian BMT', chicken: 'Rotisserie Chicken', steak: 'Steak & Cheese', tuna: 'Tuna', turkey: 'Turkey Breast', meatball: 'Meatball Marinara', veggie: 'Veggie Delite' }
const CHEESE_MAP  = { none: 'No Cheese', american: 'American', cheddar: 'Cheddar', provolone: 'Provolone', swiss: 'Swiss', pepperjack: 'Pepperjack' }

function resolve(map, v) {
  if (!v) return v
  if (Object.values(map).includes(v)) return v
  return map[v] || v
}

function getBasePrice(item) {
  if (item === 'footlong' || item === 'Footlong') return 12.99
  if (item === 'sixinch'  || item === '6-inch')   return 8.99
  if (item === 'wrap'     || item === 'Wrap')     return 10.99
  if (item === 'bowl'     || item === 'Bowl')     return 11.99
  return 12.99
}

/* ── CSS-only waveform ── */
function Waveform({ active }) {
  const bars = [
    { delay: '0s',    dur: '0.5s'  },
    { delay: '0.15s', dur: '0.35s' },
    { delay: '0.05s', dur: '0.45s' },
    { delay: '0.2s',  dur: '0.6s'  },
    { delay: '0.1s',  dur: '0.4s'  },
  ]
  return (
    <div className="flex items-center gap-1.5" style={{ height: '48px' }}>
      {bars.map((b, i) => (
        <div key={i} style={{
          width: '7px', borderRadius: '4px',
          background: '#009A44',
          height: active ? '100%' : '20%',
          animation: active ? `voiceBar ${b.dur} ease-in-out ${b.delay} infinite alternate` : 'none',
          transition: 'height 0.3s ease',
        }} />
      ))}
    </div>
  )
}

/* ── Processing spinner ── */
function Spinner() {
  return (
    <div className="w-12 h-12 rounded-full" style={{
      border: '4px solid #bbf7d0',
      borderTopColor: '#009A44',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

/* ── Animated checkmark ── */
function Checkmark() {
  return (
    <svg className="w-16 h-16 text-[#009A44]" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
      <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        d="M14 27l8 8 16-16"
        style={{ strokeDasharray: 40, strokeDashoffset: 0, animation: 'draw 0.5s ease forwards' }}/>
      <style>{`@keyframes draw{from{stroke-dashoffset:40}to{stroke-dashoffset:0}}`}</style>
    </svg>
  )
}

export default function VoiceExpressOverlay({ onClose, onFallbackToChat }) {
  const [phase,      setPhase]      = useState('listening')
  const [transcript, setTranscript] = useState('')
  const [orderData,  setOrderData]  = useState(null)

  const recognitionRef  = useRef(null)
  const silenceTimerRef = useRef(null)
  const autoCloseRef    = useRef(null)

  const navigate        = useNavigate()
  const { addItem }     = useCart()
  const { prefillBuilder } = useBuilder()
  const { showToast }   = useToast()

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setPhase('error'); return }

    const rec = new SR()
    rec.continuous      = true
    rec.interimResults  = true
    rec.lang            = 'en-CA'
    recognitionRef.current = rec

    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
      clearTimeout(silenceTimerRef.current)
      if (e.results[e.results.length - 1].isFinal) {
        silenceTimerRef.current = setTimeout(() => {
          rec.stop()
          processTranscript(t)
        }, 1500)
      }
    }

    rec.onerror = () => setPhase('error')
    rec.onend   = () => {
      // If transcript captured but no timer fired yet, process
      setTranscript(prev => { if (prev && phase === 'listening') processTranscript(prev); return prev })
    }

    rec.start()

    return () => {
      clearTimeout(silenceTimerRef.current)
      clearTimeout(autoCloseRef.current)
      try { rec.stop() } catch {}
    }
  }, [])

  async function processTranscript(text) {
    if (!text?.trim()) { setPhase('error'); return }
    setPhase('processing')
    try {
      const data = await callClaude(
        [{ role: 'user', content: `Order request: "${text}"` }],
        VOICE_SYSTEM
      )
      const raw   = data.content?.trim()
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('no json')

      const order = JSON.parse(match[0])
      const avo   = (order.veggies || []).includes('Avocado') ? 1.50 : 0

      setOrderData({
        ...order,
        displayItem:    resolve(ITEM_MAP, order.item),
        displayBread:   resolve(BREAD_MAP, order.bread),
        displayProtein: resolve(PROTEIN_MAP, order.protein),
        displayCheese:  resolve(CHEESE_MAP, order.cheese),
        price:          getBasePrice(order.item) + avo,
      })
      setPhase('confirming')

      autoCloseRef.current = setTimeout(onClose, 30000)
    } catch {
      setPhase('error')
    }
  }

  function handleConfirm() {
    if (!orderData) return
    clearTimeout(autoCloseRef.current)
    addItem({
      menuItemId:     `voice-${Date.now()}`,
      name:           `${orderData.displayProtein || 'Sub'} ${orderData.displayItem || 'Footlong'}`,
      category:       orderData.item === 'bowl' ? 'Bowls' : orderData.item === 'wrap' ? 'Wraps' : orderData.item === 'sixinch' ? '6-inch Subs' : 'Footlongs',
      customSummary:  [orderData.displayBread, orderData.displayProtein, orderData.displayCheese !== 'No Cheese' && orderData.displayCheese, orderData.veggies?.slice(0,3).join(', ')].filter(Boolean).join(' · '),
      customizations: { bread: orderData.displayBread, protein: orderData.displayProtein, cheese: orderData.displayCheese, veggies: orderData.veggies || [], sauces: orderData.sauces || [] },
      quantity:       1,
      unitPrice:      orderData.price,
    })
    showToast(`${orderData.displayProtein} added! Going to checkout.`)
    onClose()
    navigate('/cart')
  }

  function handleEdit() {
    if (!orderData) return
    clearTimeout(autoCloseRef.current)
    prefillBuilder({
      item: orderData.item, bread: orderData.bread, protein: orderData.protein,
      cheese: orderData.cheese, veggies: orderData.veggies, sauces: orderData.sauces,
    })
    onClose()
  }

  function handleClose() {
    clearTimeout(silenceTimerRef.current)
    clearTimeout(autoCloseRef.current)
    try { recognitionRef.current?.stop() } catch {}
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={phase !== 'confirming' ? handleClose : undefined} />

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 z-10 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#009A44] rounded-xl px-3 py-1.5">
            <span className="text-white font-black text-xl tracking-tight">SUBWAY</span>
          </div>
        </div>

        {/* LISTENING */}
        {phase === 'listening' && (
          <>
            <div className="flex justify-center mb-5"><Waveform active /></div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Listening to your order...</h2>
            <p className="text-gray-400 text-sm mb-4">Speak your full order — I'll stop after a pause.</p>
            {transcript && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 italic mb-4 text-left min-h-[3rem]">
                "{transcript}"
              </div>
            )}
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
              Cancel
            </button>
          </>
        )}

        {/* PROCESSING */}
        {phase === 'processing' && (
          <>
            <div className="flex justify-center mb-5"><Spinner /></div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Building your order...</h2>
            {transcript && (
              <p className="text-gray-400 text-sm italic">
                "{transcript.slice(0, 70)}{transcript.length > 70 ? '...' : ''}"
              </p>
            )}
          </>
        )}

        {/* CONFIRMING */}
        {phase === 'confirming' && orderData && (
          <>
            <div className="flex justify-center mb-4"><Checkmark /></div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Your order is ready!</h2>
            <p className="text-gray-500 text-sm mb-5">Review and confirm below</p>
            <div className="bg-gray-50 rounded-2xl p-4 text-left mb-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥖</span>
                <span className="font-bold text-gray-900 text-sm">{orderData.displayProtein} {orderData.displayItem}</span>
              </div>
              <p className="text-gray-500 text-xs pl-8">
                {[orderData.displayBread, orderData.displayCheese !== 'No Cheese' && orderData.displayCheese, orderData.veggies?.slice(0, 3).join(', ')].filter(Boolean).join(' · ')}
                {(orderData.veggies?.length || 0) > 3 ? ` +${orderData.veggies.length - 3} more` : ''}
              </p>
              <p className="text-[#009A44] font-black text-lg text-right">${orderData.price.toFixed(2)}</p>
            </div>
            <button onClick={handleConfirm}
              className="w-full bg-[#009A44] text-white font-black py-4 rounded-full text-base hover:bg-[#007A36] transition-colors shadow-lg mb-3">
              Confirm & Pay
            </button>
            <button onClick={handleEdit}
              className="w-full border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-full hover:border-gray-300 transition-colors text-sm">
              Edit Order
            </button>
          </>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <>
            <div className="text-5xl mb-4">😅</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Didn't quite catch that</h2>
            <p className="text-gray-500 text-sm mb-6">Let me open the chat so you can clarify or try again.</p>
            <button onClick={() => { onFallbackToChat?.(transcript); handleClose() }}
              className="w-full bg-[#009A44] text-white font-bold py-3 rounded-full hover:bg-[#007A36] transition-colors mb-3">
              Open Chat
            </button>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
