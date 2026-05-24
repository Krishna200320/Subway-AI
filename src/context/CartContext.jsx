import { createContext, useContext, useState, useEffect } from 'react'
import { PROMOS } from '../data/promotionsData'

const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem('subway_cart')
    if (!raw) return { items: [], promoCode: null }
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('subway_cart')
    return { items: [], promoCode: null }
  }
}

export function CartProvider({ children }) {
  const initial = loadCart()
  const [items, setItems] = useState(initial.items)
  const [promoCode, setPromoCode] = useState(initial.promoCode)

  useEffect(() => {
    localStorage.setItem('subway_cart', JSON.stringify({ items, promoCode }))
  }, [items, promoCode])

  function addItem(cartItem) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setItems(prev => [...prev, { ...cartItem, id }])
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateQuantity(id, qty) {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  function clearCart() {
    setItems([])
    setPromoCode(null)
  }

  function applyPromo(code) {
    const promo = PROMOS[code.toUpperCase()]
    if (!promo) return { success: false, error: 'Invalid promo code.' }
    if (!promo.validate(items)) return { success: false, error: promo.errorMsg }
    setPromoCode(code.toUpperCase())
    return { success: true }
  }

  function removePromo() {
    setPromoCode(null)
  }

  function getDiscount() {
    if (!promoCode) return 0
    const promo = PROMOS[promoCode]
    if (!promo) return 0
    return promo.calculate(items)
  }

  function getTotals() {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const discount = getDiscount()
    const taxable  = Math.max(0, subtotal - discount)
    const tax      = taxable * 0.13
    const total    = taxable + tax
    const itemCount = items.reduce((n, i) => n + i.quantity, 0)
    return {
      subtotal: +subtotal.toFixed(2),
      discount: +discount.toFixed(2),
      tax:      +tax.toFixed(2),
      total:    +total.toFixed(2),
      itemCount,
    }
  }

  return (
    <CartContext.Provider value={{ items, promoCode, addItem, removeItem, updateQuantity, clearCart, applyPromo, removePromo, getTotals }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
