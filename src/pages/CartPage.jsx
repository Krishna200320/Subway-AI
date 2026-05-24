import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { PROMOS } from '../data/promotionsData'

/* ── Animated checkmark for order confirmation ── */
function Checkmark() {
  return (
    <svg className="w-20 h-20 text-[#009A44]" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
      <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        d="M14 27l8 8 16-16"
        style={{ strokeDasharray: 40, strokeDashoffset: 0, animation: 'draw 0.5s ease forwards' }}
      />
      <style>{`@keyframes draw { from { stroke-dashoffset: 40 } to { stroke-dashoffset: 0 } }`}</style>
    </svg>
  )
}

function getPersonalityConfirmation(personality) {
  switch (personality) {
    case 'healthConscious': return { title: 'Order Confirmed!', subtitle: 'Great choice — keeping it fresh and nutritious.' }
    case 'proteinFocused':  return { title: 'Order Confirmed!', subtitle: 'Gains incoming. Your high-protein order is on its way!' }
    case 'spicyLover':      return { title: 'Order Confirmed!', subtitle: 'Spice is on the way — hope you can handle the heat! 🌶️' }
    case 'dealSeeker':      return { title: 'Order Confirmed!', subtitle: "Smart order — you've saved money on this one!" }
    case 'inARush':         return { title: 'Order Confirmed.', subtitle: 'Ready in 12 mins. Order placed. You\'re good to go.' }
    case 'indecisive':      return { title: 'Order Confirmed!', subtitle: "You made a great call — that's going to be delicious!" }
    default:                return { title: 'Order Confirmed!', subtitle: 'Your order has been placed successfully.' }
  }
}

/* ── Order confirmation modal ── */
function ConfirmationModal({ store, onClose }) {
  const orderNum    = `SW-${Math.floor(1000 + Math.random() * 9000)}`
  const personality = (() => { try { return localStorage.getItem('subway_personality') } catch { return null } })()
  const { title, subtitle } = getPersonalityConfirmation(personality)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="flex justify-center mb-4"><Checkmark /></div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">{title}</h2>
        <p className="text-gray-500 text-sm mb-5">{subtitle}</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Order #</span>
            <span className="font-bold text-gray-900">{orderNum}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Est. ready in</span>
            <span className="font-bold text-gray-900">12–15 minutes</span>
          </div>
          {store && (
            <div className="flex justify-between">
              <span className="text-gray-500">Pick up at</span>
              <span className="font-semibold text-gray-900 text-right max-w-[60%]">{store.address}</span>
            </div>
          )}
        </div>

        <button
          className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-full mb-3 hover:bg-gray-200 transition-colors text-sm"
          onClick={() => alert('Order tracking coming soon!')}
        >
          Track Order
        </button>
        <button
          className="w-full bg-[#009A44] text-white font-bold py-2.5 rounded-full hover:bg-[#007A36] transition-colors"
          onClick={onClose}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

/* ── Cart item row ── */
function CartItem({ item, onQuantity, onRemove }) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      <div className="w-10 h-10 rounded-xl bg-[#E8F5ED] flex items-center justify-center text-lg flex-shrink-0">
        {item.category === 'Footlongs' || item.category === '6-inch Subs' || item.category === 'Wraps' ? '🥪'
          : item.category === 'Bowls' ? '🥗'
          : item.category === 'Sides' ? '🍟'
          : item.category === 'Drinks' ? '🥤'
          : item.category === 'Cookies' ? '🍪' : '🍽️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
        {item.customSummary && (
          <p className="text-gray-400 text-xs mt-0.5 truncate">{item.customSummary}</p>
        )}
        <p className="text-[#009A44] font-bold text-sm mt-1">${(item.unitPrice * item.quantity).toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#009A44] hover:text-[#009A44] font-bold transition-colors text-sm"
          >−</button>
          <span className="w-4 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
          <button
            onClick={() => onQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#009A44] hover:text-[#009A44] font-bold transition-colors text-sm"
          >+</button>
        </div>
      </div>
    </div>
  )
}

/* ── Pickup time options ── */
function pickupTimes() {
  const times = ['ASAP (12–15 min)']
  const now = new Date()
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15 + 15, 0, 0)
  for (let i = 0; i < 8; i++) {
    times.push(now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }))
    now.setMinutes(now.getMinutes() + 15)
  }
  return times
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, promoCode, removeItem, updateQuantity, clearCart, applyPromo, removePromo, getTotals } = useCart()
  const { selectedStore, user } = useAuth()

  const [promoInput,    setPromoInput]    = useState('')
  const [promoError,    setPromoError]    = useState('')
  const [promoSuccess,  setPromoSuccess]  = useState('')
  const [pickupTime,    setPickupTime]    = useState('ASAP (12–15 min)')
  const [orderType,     setOrderType]     = useState('Pickup')
  const [instructions,  setInstructions]  = useState('')
  const [showConfirm,   setShowConfirm]   = useState(false)

  const { subtotal, discount, tax, total, itemCount } = getTotals()
  const times = pickupTimes()

  function handleApplyPromo() {
    setPromoError('')
    setPromoSuccess('')
    const result = applyPromo(promoInput)
    if (result.success) {
      setPromoSuccess(`✓ Code "${promoInput.toUpperCase()}" applied!`)
      setPromoInput('')
    } else {
      setPromoError(result.error)
    }
  }

  function handlePlaceOrder() {
    // Save last order for smart order memory
    try {
      const mainItem = items[0]
      if (mainItem?.customizations) {
        localStorage.setItem('subway_last_order', JSON.stringify({
          protein:   mainItem.customizations.protein || mainItem.name,
          bread:     mainItem.customizations.bread   || '9-Grain Wheat',
          cheese:    mainItem.customizations.cheese  || null,
          veggies:   mainItem.customizations.veggies || [],
          sauces:    mainItem.customizations.sauces  || [],
          toasted:   mainItem.customizations.toasted || false,
          timestamp: Date.now(),
        }))
      }
    } catch {}
    setShowConfirm(true)
  }

  function handleConfirmClose() {
    clearCart()
    navigate('/')
  }

  if (items.length === 0 && !showConfirm) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 mb-6">Add some items from the menu to get started.</p>
            <Link to="/menu" className="bg-[#009A44] text-white font-bold px-8 py-3 rounded-full hover:bg-[#007A36] transition-colors inline-block">
              Browse Menu
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900">Your Order</h1>
          {selectedStore && <p className="text-gray-500 text-sm mt-1">Pickup from {selectedStore.name}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — items + promo */}
          <div className="lg:col-span-2 space-y-4">
            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</h2>
              <div>
                {items.map(item => (
                  <CartItem key={item.id} item={item} onQuantity={updateQuantity} onRemove={removeItem} />
                ))}
              </div>
              <Link to="/menu" className="inline-flex items-center gap-1 text-[#009A44] text-sm font-semibold mt-4 hover:underline">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add more items
              </Link>
            </div>

            {/* Promo code */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Promo Code</h2>
              {promoCode ? (
                <div className="flex items-center justify-between bg-[#E8F5ED] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-[#007A36] font-bold text-sm">{promoCode}</p>
                    <p className="text-[#009A44] text-xs">{PROMOS[promoCode]?.title}</p>
                  </div>
                  <button onClick={removePromo} className="text-gray-400 hover:text-red-400 text-sm">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                    placeholder="Enter promo code"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#009A44] focus:border-transparent uppercase tracking-wider"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-[#009A44] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#007A36] transition-colors text-sm"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError   && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
              {promoSuccess && <p className="text-[#009A44] text-xs mt-2">{promoSuccess}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {['LONGWEEKEND', '6INCH199', '20OFFBOWL', 'SNACKRING', 'SOUPNSUB'].map(code => (
                  <button
                    key={code}
                    onClick={() => { setPromoInput(code); setPromoError(''); setPromoSuccess('') }}
                    className="bg-[#FFCC00]/20 text-[#7A5C00] text-xs font-bold px-2.5 py-1 rounded-full hover:bg-[#FFCC00]/40 transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Order details */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-gray-900">Order Details</h2>

              {/* Order type */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Order type</p>
                <div className="flex gap-2">
                  {['Pickup', 'Dine In'].map(t => (
                    <button
                      key={t}
                      onClick={() => setOrderType(t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        orderType === t ? 'border-[#009A44] bg-[#E8F5ED] text-[#009A44]' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup time */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Pick up time</p>
                <select
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#009A44] bg-white"
                >
                  {times.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Special instructions */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Special instructions <span className="text-gray-400">(optional)</span></p>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="Allergy info, extra napkins, etc."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#009A44]"
                />
              </div>
            </div>
          </div>

          {/* Right — summary + checkout */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#009A44] font-semibold">
                    <span>Promo ({promoCode})</span>
                    <span>−${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>HST (13%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-[#009A44] text-white font-black py-4 rounded-full text-base hover:bg-[#007A36] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Place Order · ${total.toFixed(2)}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                {orderType} · {pickupTime}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showConfirm && (
        <ConfirmationModal store={selectedStore} onClose={handleConfirmClose} />
      )}
    </div>
  )
}
