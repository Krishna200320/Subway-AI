import { useState, useEffect, useRef } from 'react'
import { callClaude } from '../../config/api'

const SparkleIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

function getNudgeText(step, builderState) {
  const { item, protein, cheese, mealDeal } = builderState

  try {
    const lastOrder = JSON.parse(localStorage.getItem('subway_last_order') || 'null')
    const isRecent  = lastOrder && (Date.now() - lastOrder.timestamp < 7 * 24 * 60 * 60 * 1000)

    if (step === 1) {
      if (isRecent && lastOrder.protein?.toLowerCase().includes('chicken'))
        return 'Welcome back — your usual Rotisserie Chicken?'
      return 'The Footlong gives you the best value per dollar'
    }

    if (step === 2) {
      if (protein === 'Veggie Delite')
        return 'Try Flatbread for a lighter, crispier base with your Veggie Delite'
      return '9-Grain Wheat is our most popular and has the most fibre'
    }

    if (step === 3) {
      if (item === 'Bowl' || item === 'bowl')
        return 'Steak Bowl is our highest rated bowl — 4.8 stars'
      return 'Rotisserie Chicken is our highest protein option at 52g per footlong'
    }

    if (step === 4) {
      if (protein === 'Veggie Delite')
        return 'American cheese keeps it simple and classic'
      return 'Provolone melts the best if you are toasting your sub'
    }

    if (step === 5) {
      if (protein === 'Rotisserie Chicken')
        return 'Spinach and cucumber go perfectly with Rotisserie Chicken'
      return 'Avocado adds healthy fats and makes it extra creamy'
    }

    if (step === 6) {
      if (cheese === 'Pepperjack')
        return 'Buffalo sauce will amplify the heat from your Pepperjack — are you ready?'
      return 'Chipotle Southwest is our most ordered sauce — smoky and slightly spicy'
    }

    if (step === 7) {
      return 'Toasting takes about 90 seconds and makes cheese perfectly melted'
    }
  } catch {}

  return null
}

/* ── Step 8 live AI nudge ── */
function ReviewNudge({ getCurrentBuild, reviewNudgeCache }) {
  const [text,    setText]    = useState(reviewNudgeCache.current)
  const [loading, setLoading] = useState(!reviewNudgeCache.current)
  const [dismissed, setDismissed] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current || reviewNudgeCache.current) {
      if (reviewNudgeCache.current) setText(reviewNudgeCache.current)
      setLoading(false)
      return
    }
    fetchedRef.current = true

    const build = getCurrentBuild()
    const prompt = `User has built this sub: ${build}. Give ONE short friendly sentence (max 15 words) suggesting an upsell or deal they qualify for. Be specific to their actual order. No emojis.`

    callClaude([{ role: 'user', content: prompt }], 'You are a concise Subway Canada AI ordering assistant.')
      .then(data => {
        const msg = data.content?.trim() || ''
        reviewNudgeCache.current = msg
        setText(msg)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [getCurrentBuild, reviewNudgeCache])

  if (dismissed || (!loading && !text)) return null

  return (
    <div className="mb-4 flex items-start gap-2 bg-green-50 border-l-4 border-[#009A44] rounded-r-xl px-4 py-3 text-sm text-green-900 relative"
      style={{ animation: 'nudgeFadeIn 0.4s ease 0.8s both' }}>
      <SparkleIcon />
      <div className="flex-1">
        {loading ? (
          <div className="flex gap-2 items-center">
            <div className="h-3 bg-green-200 rounded animate-pulse w-48" />
            <div className="h-3 bg-green-200 rounded animate-pulse w-24" />
          </div>
        ) : (
          <>
            <span>{text}</span>
            <span className="ml-2 text-[10px] text-green-600 font-semibold opacity-70">Powered by SubAI</span>
          </>
        )}
      </div>
      {!loading && (
        <button onClick={() => setDismissed(true)} className="text-green-400 hover:text-green-600 transition-colors leading-none">×</button>
      )}
    </div>
  )
}

export default function BuilderNudge({ step, builderState, getCurrentBuild, reviewNudgeCache }) {
  const [dismissed, setDismissed] = useState(false)
  const [visible,   setVisible]   = useState(false)

  // Reset dismiss + visibility when step changes
  useEffect(() => {
    setDismissed(false)
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [step])

  if (step === 8) {
    return <ReviewNudge getCurrentBuild={getCurrentBuild} reviewNudgeCache={reviewNudgeCache} />
  }

  const nudge = getNudgeText(step, builderState)
  if (!nudge || dismissed || !visible) return null

  return (
    <div
      className="mb-4 flex items-start gap-2 bg-green-50 border-l-4 border-[#009A44] rounded-r-xl px-4 py-3 text-sm text-green-900 relative"
      style={{ animation: 'nudgeFadeIn 0.4s ease both' }}
    >
      <SparkleIcon />
      <span className="flex-1">{nudge}</span>
      <button
        onClick={() => setDismissed(true)}
        className="text-green-400 hover:text-green-600 transition-colors leading-none ml-2"
      >×</button>
    </div>
  )
}
