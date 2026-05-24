import { createContext, useContext, useState, useCallback, useRef } from 'react'

const GhostNavContext = createContext(null)

export function GhostNavProvider({ children }) {
  const pendingHighlightsRef     = useRef([])  // persists across navigation
  const pendingCategoryScrollRef = useRef(null)
  const [activeHighlights, setActiveHighlights]   = useState([])
  const [ghostNavActive,   setGhostNavActive]     = useState(false)
  const clearTimerRef = useRef(null)

  const queueHighlights = useCallback((itemIds) => {
    pendingHighlightsRef.current = itemIds || []
  }, [])

  const queueCategoryScroll = useCallback((catId) => {
    pendingCategoryScrollRef.current = catId
  }, [])

  const applyPendingHighlights = useCallback(() => {
    const ids = pendingHighlightsRef.current
    if (!ids.length) return false
    pendingHighlightsRef.current = []
    setActiveHighlights(ids)
    setGhostNavActive(true)
    clearTimeout(clearTimerRef.current)
    clearTimerRef.current = setTimeout(() => {
      setActiveHighlights([])
      setGhostNavActive(false)
    }, 5000)
    return true
  }, [])

  const popCategoryScroll = useCallback(() => {
    const cat = pendingCategoryScrollRef.current
    pendingCategoryScrollRef.current = null
    return cat
  }, [])

  return (
    <GhostNavContext.Provider value={{
      queueHighlights,
      queueCategoryScroll,
      applyPendingHighlights,
      popCategoryScroll,
      activeHighlights,
      ghostNavActive,
    }}>
      {children}
    </GhostNavContext.Provider>
  )
}

export function useGhostNav() {
  const ctx = useContext(GhostNavContext)
  if (!ctx) throw new Error('useGhostNav must be used within GhostNavProvider')
  return ctx
}
