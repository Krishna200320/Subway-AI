import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { BREAD_OPTIONS, CHEESE_OPTIONS, VEGGIE_OPTIONS, SAUCE_OPTIONS, getItemType } from '../data/menuData'

function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-[#009A44]' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function ChipButton({ label, selected, onClick, extraBadge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
        selected
          ? 'bg-[#009A44] text-white border-[#009A44]'
          : 'bg-white text-gray-700 border-gray-200 hover:border-[#009A44] hover:text-[#009A44]'
      }`}
    >
      {label}
      {extraBadge && <span className="ml-1 text-xs opacity-80">{extraBadge}</span>}
    </button>
  )
}

export default function CustomizationModal({ item, onClose }) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const type = getItemType(item)
  const isSub = type === 'sub'

  const defaultSize = item.category === 'Footlongs' ? 'Footlong' : item.category === '6-inch Subs' ? '6-inch' : 'Footlong'

  const [bread,         setBread]         = useState('9-Grain Wheat')
  const [size,          setSize]          = useState(defaultSize)
  const [cheese,        setCheese]        = useState('American')
  const [veggies,       setVeggies]       = useState([])
  const [sauces,        setSauces]        = useState([])
  const [toasted,       setToasted]       = useState(false)
  const [doubleProtein, setDoubleProtein] = useState(false)
  const [quantity,      setQuantity]      = useState(1)

  const sizeAdj = isSub
    ? (item.category === 'Footlongs' && size === '6-inch')  ? -4.00
    : (item.category === '6-inch Subs' && size === 'Footlong') ? 4.00
    : 0 : 0

  const proteinAdj  = doubleProtein ? 2.50 : 0
  const avocadoAdj  = veggies.includes('Avocado') ? 1.50 : 0
  const unitPrice   = item.price + sizeAdj + proteinAdj + avocadoAdj
  const totalPrice  = unitPrice * quantity

  function toggleMulti(arr, setter, val) {
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  function buildSummary() {
    const parts = []
    if (isSub) parts.push(`${size} on ${bread}`)
    if (cheese !== 'No Cheese') parts.push(cheese)
    if (doubleProtein) parts.push('Double Protein')
    if (toasted) parts.push('Toasted')
    if (veggies.length) parts.push(veggies.join(', '))
    if (sauces.length) parts.push(sauces.join(', '))
    return parts.join(' · ') || 'No customizations'
  }

  function handleAddToCart() {
    addItem({
      menuItemId:     item.id,
      name:           item.name,
      category:       item.category,
      customizations: { bread, size, cheese, veggies, sauces, toasted, doubleProtein },
      customSummary:  buildSummary(),
      quantity,
      unitPrice,
    })
    showToast(`${item.name} added to your cart!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Item image */}
        {item.image && (
          <div className="h-[200px] overflow-hidden rounded-t-2xl sm:rounded-t-2xl flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">{item.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mr-1 ml-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Size — only for subs */}
          {isSub && (
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Size</h3>
              <div className="flex gap-3">
                {['Footlong', '6-inch'].map(s => {
                  const adj = s === '6-inch' && item.category === 'Footlongs' ? -4.00
                            : s === 'Footlong' && item.category === '6-inch Subs' ? +4.00 : 0
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        size === s ? 'border-[#009A44] bg-[#E8F5ED] text-[#009A44]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {s}
                      {adj !== 0 && <span className="block text-xs font-normal mt-0.5">{adj > 0 ? '+' : ''}${adj.toFixed(2)}</span>}
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Bread — subs + wraps */}
          {isSub && (
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Bread</h3>
              <div className="flex flex-wrap gap-2">
                {BREAD_OPTIONS.map(b => (
                  <ChipButton key={b} label={b} selected={bread === b} onClick={() => setBread(b)} />
                ))}
              </div>
            </section>
          )}

          {/* Double protein */}
          {(isSub || type === 'bowl') && (
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Double Protein</p>
                  <p className="text-xs text-gray-500">+$2.50</p>
                </div>
                <Toggle value={doubleProtein} onChange={setDoubleProtein} />
              </div>
            </section>
          )}

          {/* Cheese — subs */}
          {isSub && (
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Cheese</h3>
              <div className="flex flex-wrap gap-2">
                {CHEESE_OPTIONS.map(c => (
                  <ChipButton key={c} label={c} selected={cheese === c} onClick={() => setCheese(c)} />
                ))}
              </div>
            </section>
          )}

          {/* Toasted — subs */}
          {isSub && (
            <section>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">Toasted</p>
                <Toggle value={toasted} onChange={setToasted} />
              </div>
            </section>
          )}

          {/* Veggies — subs and bowls */}
          {(isSub || type === 'bowl') && (
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Veggies <span className="text-gray-400 font-normal">(select all you want)</span></h3>
              <div className="flex flex-wrap gap-2">
                {VEGGIE_OPTIONS.map(v => (
                  <ChipButton
                    key={v.name}
                    label={v.name}
                    selected={veggies.includes(v.name)}
                    onClick={() => toggleMulti(veggies, setVeggies, v.name)}
                    extraBadge={v.extraCost ? `+$${v.extraCost.toFixed(2)}` : null}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sauces — subs and bowls */}
          {(isSub || type === 'bowl') && (
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Sauces <span className="text-gray-400 font-normal">(select all you want)</span></h3>
              <div className="flex flex-wrap gap-2">
                {SAUCE_OPTIONS.map(s => (
                  <ChipButton
                    key={s}
                    label={s}
                    selected={sauces.includes(s)}
                    onClick={() => toggleMulti(sauces, setSauces, s)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer — quantity + Add to Cart */}
        <div className="p-5 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#009A44] hover:text-[#009A44] font-bold transition-colors"
              >−</button>
              <span className="w-6 text-center font-bold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#009A44] hover:text-[#009A44] font-bold transition-colors"
              >+</button>
            </div>
            <p className="text-xl font-black text-gray-900">${totalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#009A44] text-white font-bold py-3 rounded-full hover:bg-[#007A36] transition-colors text-base"
          >
            Add to Cart — ${totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}
