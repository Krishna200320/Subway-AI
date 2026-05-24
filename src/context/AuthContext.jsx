import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('subway_auth')
    if (!raw) return { user: null, selectedStore: null }
    const parsed = JSON.parse(raw)
    if (parsed?.user?.loginTime && Date.now() - parsed.user.loginTime > SESSION_TTL) {
      localStorage.removeItem('subway_auth')
      return { user: null, selectedStore: null }
    }
    return {
      user: parsed?.user ?? null,
      selectedStore: parsed?.selectedStore ?? null,
    }
  } catch {
    localStorage.removeItem('subway_auth')
    return { user: null, selectedStore: null }
  }
}

export function AuthProvider({ children }) {
  const initial = loadFromStorage()
  const [user, setUser] = useState(initial.user)
  const [selectedStore, setSelectedStore] = useState(initial.selectedStore)

  useEffect(() => {
    localStorage.setItem('subway_auth', JSON.stringify({ user, selectedStore }))
  }, [user, selectedStore])

  function signIn(email, password) {
    if (email.trim() === 'krishna@test.com' && password === 'password123') {
      setUser({ name: 'Krishna', email: email.trim(), isLoggedIn: true, loginTime: Date.now() })
      return { success: true }
    }
    return { success: false, error: 'Invalid email or password.' }
  }

  function register(firstName, lastName, email, password) {
    setUser({ name: firstName.trim(), email: email.trim(), isLoggedIn: true, loginTime: Date.now() })
    return { success: true }
  }

  function signOut() {
    setUser(null)
    setSelectedStore(null)
    try { localStorage.removeItem('subway_auth') } catch {}
  }

  function selectStore(store) {
    setSelectedStore(store)
  }

  return (
    <AuthContext.Provider value={{ user, selectedStore, signIn, register, signOut, selectStore }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
