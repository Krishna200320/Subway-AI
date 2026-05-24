import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const DemoContext = createContext(null)

export const BADGE_TYPES = {
  SubAssist: { color: 'bg-green-500',  label: 'SubAssist — guiding user'   },
  ToneSense: { color: 'bg-purple-500', label: 'ToneSense — adapting tone'  },
  BrainMenu: { color: 'bg-orange-500', label: 'BrainMenu — menu knowledge' },
}

export function DemoProvider({ children }) {
  const [demoMode,    setDemoMode]    = useState(false)
  const [activeBadge, setActiveBadge] = useState(null)
  const badgeTimerRef                 = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'd' || e.key === 'D') {
        const tag = e.target?.tagName?.toLowerCase()
        if (tag === 'input' || tag === 'textarea') return
        setDemoMode(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const showBadge = useCallback((type) => {
    if (!BADGE_TYPES[type]) return
    clearTimeout(badgeTimerRef.current)
    setActiveBadge(type)
    badgeTimerRef.current = setTimeout(() => setActiveBadge(null), 3000)
  }, [])

  return (
    <DemoContext.Provider value={{ demoMode, setDemoMode, activeBadge, showBadge, BADGE_TYPES }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
