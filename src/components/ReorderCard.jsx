import { useState } from 'react'
import { useBuilder } from '../context/BuilderContext'

export default function ReorderCard() {
  const { prefillBuilder } = useBuilder()
  const [dismissed, setDismissed] = useState(false)

  let lastOrder = null
  try {
    const raw = localStorage.getItem('subway_last_order')
    if (raw) {
      lastOrder = JSON.parse(raw)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - lastOrder.timestamp > sevenDays) lastOrder = null
    }
  } catch {}

  if (!lastOrder || dismissed) return null

  function handleReorder() {
    prefillBuilder({
      protein: lastOrder.protein,
      bread:   lastOrder.bread,
      cheese:  lastOrder.cheese,
      veggies: lastOrder.veggies || [],
      sauces:  lastOrder.sauces  || [],
      toasted: lastOrder.toasted || false,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-4 bg-[#E8F5ED] border border-[#009A44]/20 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#009A44] rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
            🥖
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-sm">Welcome back! Fancy your usual?</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {lastOrder.protein || 'Sub'} on {lastOrder.bread || '9-Grain Wheat'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleReorder}
            className="bg-[#009A44] text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-[#007A36] transition-colors"
          >
            Reorder
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
