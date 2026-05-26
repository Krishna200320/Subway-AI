import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { callClaude } from '../config/api'
import { buildSystemPrompt } from './systemPrompt'
import { buildPreLoginSystemPrompt } from './preLoginSystemPrompt'
import { detectPersonality } from './motivaMX'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const WIDGET_MSGS_KEY = 'subway_widget_msgs'

function parseAIResponse(text) {
  // Check for [BUILD_SUB: name] pattern
  const buildSubRegex = /\[BUILD_SUB:\s*([^\]]+)\]/i
  const buildSubMatch = text.match(buildSubRegex)
  let buildSub = null
  let workingText = text
  if (buildSubMatch) {
    buildSub    = buildSubMatch[1].trim()
    workingText = text.replace(buildSubMatch[0], '').trim()
  }

  // Check for existing ACTION: line
  const lines     = workingText.split('\n')
  const actionIdx = lines.findIndex(l => l.trim().startsWith('ACTION:'))

  if (actionIdx !== -1) {
    const actionStr = lines[actionIdx].trim().replace(/^ACTION:\s*/, '')
    const cleanText = lines.filter((_, i) => i !== actionIdx).join('\n').trim()
    try {
      return { text: cleanText || workingText, action: JSON.parse(actionStr), buildSub }
    } catch {
      return { text: workingText, action: null, buildSub }
    }
  }

  // Check for prefillBuilder JSON block at end of message
  const prefillRegex = /\{[\s\S]*?"action"\s*:\s*"prefillBuilder"[\s\S]*?\}\s*$/
  const prefillMatch = workingText.match(prefillRegex)
  if (prefillMatch) {
    const jsonStr   = prefillMatch[0].trim()
    const cleanText = workingText.slice(0, workingText.lastIndexOf(prefillMatch[0])).trim()
    try {
      const action = JSON.parse(jsonStr)
      return { text: cleanText || workingText, action, buildSub }
    } catch {
      return { text: workingText, action: null, buildSub }
    }
  }

  return { text: workingText, action: null, buildSub }
}

export function useAIChat({ isLoggedIn = true, onPrefillBuilder = null, getCurrentBuild = null } = {}) {
  const [messages, setMessages]           = useState([])
  const [isLoading, setIsLoading]         = useState(false)
  const [personality, setPersonality]     = useState(null)
  const [goToCartReady, setGoToCartReady] = useState(false)

  const { addItem, items: cartItems } = useCart()
  const { showToast }                 = useToast()
  const navigate                      = useNavigate()

  // Persist detected personality so other parts of the app (e.g. CartPage) can adapt tone
  useEffect(() => {
    if (personality) {
      try { localStorage.setItem('subway_personality', personality) } catch {}
    }
  }, [personality])

  const sendMessage = useCallback(async (userText, currentPage = 'menu') => {
    if (!userText.trim()) return

    let baseMessages    = messages
    let basePersonality = personality
    let welcomeBack     = false

    if (isLoggedIn && messages.length === 0) {
      try {
        const saved = localStorage.getItem(WIDGET_MSGS_KEY)
        if (saved) {
          const { messages: priorMsgs, personality: priorPersonality } = JSON.parse(saved)
          if (priorMsgs?.length > 0) {
            baseMessages    = priorMsgs
            basePersonality = priorPersonality
            welcomeBack     = true
            localStorage.removeItem(WIDGET_MSGS_KEY)
          }
        }
      } catch {}
    }

    const userMsg        = { role: 'user', content: userText.trim() }
    const updatedHistory = [...baseMessages, userMsg]
    setMessages(updatedHistory)
    setIsLoading(true)
    setGoToCartReady(false)

    const newPersonality = detectPersonality(userText, basePersonality || personality)
    if (newPersonality !== personality) setPersonality(newPersonality)

    const currentBuild = getCurrentBuild ? getCurrentBuild() : null

    const systemPrompt = isLoggedIn
      ? buildSystemPrompt(newPersonality || personality, currentPage, cartItems, welcomeBack, currentBuild)
      : buildPreLoginSystemPrompt(newPersonality || personality, currentPage)

    if (!isLoggedIn) {
      try {
        localStorage.setItem(WIDGET_MSGS_KEY, JSON.stringify({
          messages:    updatedHistory,
          personality: newPersonality || personality,
        }))
      } catch {}
    }

    const apiMessages = updatedHistory.map(({ role, content }) => ({ role, content }))

    try {
      const data = await callClaude(apiMessages, systemPrompt)
      const raw  = data.content
      const { text, action, buildSub } = parseAIResponse(raw)

      const assistantMsg  = { role: 'assistant', content: text || raw, ...(buildSub && { buildSub }) }
      const finalMessages = [...updatedHistory, assistantMsg]
      setMessages(finalMessages)

      if (!isLoggedIn) {
        try {
          localStorage.setItem(WIDGET_MSGS_KEY, JSON.stringify({
            messages:    finalMessages,
            personality: newPersonality || personality,
          }))
        } catch {}
      }

      if (isLoggedIn && action?.action === 'prefillBuilder' && onPrefillBuilder) {
        onPrefillBuilder(action.selections || {})
      }

      if (isLoggedIn && action?.action === 'addToCart') {
        const cartItem = {
          menuItemId:     action.item?.replace(/\s+/g, '-').toLowerCase() || 'ai-item',
          name:           action.item || 'Sub',
          category:       action.category || 'Footlongs',
          customizations: {
            bread:         action.bread || '9-Grain Wheat',
            size:          action.size  || 'Footlong',
            cheese:        action.cheese || 'American',
            veggies:       action.veggies || [],
            sauces:        action.sauces  || [],
            toasted:       action.toasted || false,
            doubleProtein: action.doubleProtein || false,
          },
          quantity:  action.quantity || 1,
          unitPrice: action.price || 12.49,
        }
        addItem(cartItem)
        showToast(`${action.item} added to your cart!`)
      }

      if (isLoggedIn && action?.action === 'goToCart') {
        setGoToCartReady(true)
      }
    } catch (err) {
      const errMsg = err.message?.includes('fetch')
        ? 'Can\'t reach the AI server. Make sure `npm run server` is running on port 3001.'
        : err.message || 'Something went wrong. Please try again!'
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I hit a snag — ${errMsg}` }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, personality, cartItems, addItem, showToast, isLoggedIn, onPrefillBuilder, getCurrentBuild])

  const clearChat = useCallback(() => {
    setMessages([])
    setPersonality(null)
    setGoToCartReady(false)
    if (!isLoggedIn) {
      try { localStorage.removeItem(WIDGET_MSGS_KEY) } catch {}
    }
  }, [isLoggedIn])

  return { messages, isLoading, personality, goToCartReady, sendMessage, clearChat, navigate }
}
