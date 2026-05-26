import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const TABS = ['Bread', 'Protein', 'Cheese', 'Vegetables', 'Sauce']

const INGREDIENTS = {
  Bread: [
    { name: 'Italian White', price: 0,    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&h=80&fit=crop&crop=center' },
    { name: 'Honey Oat',     price: 0,    image: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=80&h=80&fit=crop&crop=center' },
    { name: 'Multigrain',    price: 0,    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=80&h=80&fit=crop&crop=center' },
    { name: 'Flatbread',     price: 0,    image: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=80&h=80&fit=crop&crop=center' },
  ],
  Protein: [
    { name: 'Rotisserie Chicken', price: 2.00, image: 'https://images.unsplash.com/photo-1598514982901-9b62ec0ea996?w=80&h=80&fit=crop&crop=center' },
    { name: 'Steak',              price: 2.50, image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=80&h=80&fit=crop&crop=center' },
    { name: 'Tuna',               price: 1.50, image: 'https://images.unsplash.com/photo-1568040439228-db00bd7c10da?w=80&h=80&fit=crop&crop=center' },
    { name: 'Veggie Patty',       price: 1.50, image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=80&h=80&fit=crop&crop=center' },
    { name: 'Meatball',           price: 2.00, image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=80&h=80&fit=crop&crop=center' },
  ],
  Cheese: [
    { name: 'American',   price: 0.50, image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=80&h=80&fit=crop&crop=center' },
    { name: 'Provolone',  price: 0.50, image: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=80&h=80&fit=crop&crop=center' },
    { name: 'Pepperjack', price: 0.50, image: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=80&h=80&fit=crop&crop=center' },
    { name: 'Swiss',      price: 0.50, image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=80&h=80&fit=crop&crop=center' },
  ],
  Vegetables: [
    { name: 'Lettuce',  price: 0, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop&crop=center' },
    { name: 'Tomato',   price: 0, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop&crop=center' },
    { name: 'Onion',    price: 0, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=80&h=80&fit=crop&crop=center' },
    { name: 'Cucumber', price: 0, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=80&h=80&fit=crop&crop=center' },
    { name: 'Peppers',  price: 0, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=80&h=80&fit=crop&crop=center' },
    { name: 'Spinach',  price: 0, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=80&h=80&fit=crop&crop=center' },
    { name: 'Olives',   price: 0, image: 'https://images.unsplash.com/photo-1593001872095-7d5b3868dd20?w=80&h=80&fit=crop&crop=center' },
  ],
  Sauce: [
    { name: 'Ranch',        price: 0, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=80&h=80&fit=crop&crop=center' },
    { name: 'Chipotle',     price: 0, image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=80&h=80&fit=crop&crop=center' },
    { name: 'Honey Mustard',price: 0, image: 'https://images.unsplash.com/photo-1626078541682-c9cf2bc0f977?w=80&h=80&fit=crop&crop=center' },
    { name: 'Sweet Onion',  price: 0, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=80&h=80&fit=crop&crop=center' },
    { name: 'Buffalo',      price: 0, image: 'https://images.unsplash.com/photo-1612871689985-8c7a4dfcc234?w=80&h=80&fit=crop&crop=center' },
  ],
}

export default function SubIngredientBuilder({ subName }) {
  const [activeTab, setActiveTab] = useState('Bread')
  const [selections, setSelections] = useState({ Bread: {}, Protein: {}, Cheese: {}, Vegetables: {}, Sauce: {} })
  const [added, setAdded] = useState(false)

  const { addItem } = useCart()
  const { showToast } = useToast()

  const totalPrice = Object.entries(selections).reduce((sum, [tab, chosen]) =>
    sum + Object.entries(chosen).reduce((s, [name, qty]) => {
      const ing = INGREDIENTS[tab]?.find(i => i.name === name)
      return s + (ing?.price || 0) * qty
    }, 0), 0)

  function increment(name) {
    setSelections(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], [name]: (prev[activeTab][name] || 0) + 1 } }))
  }

  function decrement(name) {
    setSelections(prev => {
      const qty = prev[activeTab][name] || 0
      if (qty <= 0) return prev
      const updated = { ...prev[activeTab], [name]: qty - 1 }
      if (qty - 1 === 0) delete updated[name]
      return { ...prev, [activeTab]: updated }
    })
  }

  function handleAddToCart() {
    const bread   = Object.keys(selections.Bread)[0] || 'Italian White'
    const cheese  = Object.keys(selections.Cheese)[0] || 'None'
    const veggies = Object.keys(selections.Vegetables)
    const sauces  = Object.keys(selections.Sauce)
    const proteins = Object.keys(selections.Protein)

    addItem({
      menuItemId:     subName.toLowerCase().replace(/\s+/g, '-'),
      name:           subName,
      category:       'Footlongs',
      customizations: { bread, size: 'Footlong', cheese, veggies, sauces, proteins, toasted: false, doubleProtein: false },
      quantity:       1,
      unitPrice:      totalPrice,
    })
    setAdded(true)
    showToast(`${subName} added to your cart!`)
  }

  if (added) {
    return (
      <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4 text-center">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 text-[#009A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-bold text-[#009A44] text-sm">{subName} added to cart!</p>
        <p className="text-xs text-gray-400 mt-0.5">Your custom sub is ready</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#009A44] px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm leading-tight">{subName}</p>
          <p className="text-white/70 text-[10px]">Customize your sub</p>
        </div>
        <div className="bg-white/20 rounded-full px-3 py-1">
          <span className="text-white font-black text-sm">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Tab row */}
      <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-max text-[10px] font-bold py-2 px-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-[#009A44] border-b-2 border-[#009A44] bg-green-50/60'
                : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ingredient grid */}
      <div className="p-2 overflow-y-auto" style={{ maxHeight: 196 }}>
        <div className="grid grid-cols-2 gap-1.5">
          {INGREDIENTS[activeTab].map(item => {
            const qty = selections[activeTab][item.name] || 0
            return (
              <div
                key={item.name}
                className={`border rounded-lg p-2 flex flex-col items-center gap-1 transition-all ${
                  qty > 0 ? 'border-[#009A44] bg-green-50/40' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-100"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <p className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{item.name}</p>
                {item.price > 0 && (
                  <p className="text-[9px] text-[#009A44] font-medium">+${item.price.toFixed(2)}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={() => decrement(item.name)}
                    disabled={qty === 0}
                    className="w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-xs flex items-center justify-center disabled:opacity-25 hover:enabled:border-red-300 hover:enabled:text-red-500 transition-colors"
                  >−</button>
                  <span className="text-xs font-bold text-gray-700 w-3 text-center tabular-nums">{qty}</span>
                  <button
                    onClick={() => increment(item.name)}
                    className="w-5 h-5 rounded-full bg-[#009A44] text-white text-xs flex items-center justify-center hover:bg-[#007A36] transition-colors"
                  >+</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add to Cart */}
      <div className="p-2.5 border-t border-gray-100">
        <button
          onClick={handleAddToCart}
          className="w-full bg-[#009A44] text-white text-xs font-bold py-2.5 rounded-full hover:bg-[#007A36] transition-colors active:scale-[0.98]"
        >
          Add to Cart — ${totalPrice.toFixed(2)}
        </button>
      </div>
    </div>
  )
}
