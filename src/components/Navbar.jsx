import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const navLinks = [
  { label: 'Menu', href: '/menu' },
  { label: 'Find a Subway', href: '#' },
  { label: 'Rewards', href: '#' },
  { label: 'Gift Cards', href: '#' },
  { label: 'Catering', href: '#' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user, selectedStore, signOut } = useAuth()
  const { getTotals } = useCart()
  const cartCount = getTotals().itemCount

  // Close dropdown on outside click (only attaches when open)
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  function handleSignOut() {
    signOut()
    setDropdownOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-[#009A44] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-white rounded px-2 py-1">
              <span className="text-[#009A44] font-black text-xl tracking-tight leading-none">SUBWAY</span>
            </div>
            <span className="text-white text-xs font-medium opacity-80 hidden sm:block">Canada</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#007A36] transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* "Ordering from" badge — desktop only */}
          {user?.isLoggedIn && selectedStore && (
            <Link to="/store-select"
              className="hidden lg:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {selectedStore.name.replace('Subway ', '')}
              <span className="opacity-60">— change?</span>
            </Link>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Auth: avatar (logged in) or Sign In button */}
            {user?.isLoggedIn ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-white text-[#009A44] font-black text-sm flex items-center justify-center hover:ring-2 hover:ring-[#FFCC00] transition-all"
                  aria-label="Account menu"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-gray-900 font-semibold text-sm">Hi, {user.name} 👋</p>
                      <p className="text-gray-400 text-xs truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link to="#" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F5ED] hover:text-[#009A44] transition-colors">
                      My Orders
                    </Link>
                    <Link to="#" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F5ED] hover:text-[#009A44] transition-colors">
                      Rewards
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/signin')}
                className="hidden sm:block bg-white text-[#009A44] font-semibold text-sm px-4 py-2 rounded-full hover:bg-[#FFCC00] hover:text-[#007A36] transition-colors duration-150"
              >
                Sign In
              </button>
            )}

            {/* Cart */}
            <button onClick={() => navigate('/cart')} className="relative p-2 hover:bg-[#007A36] rounded-full transition-colors">
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFCC00] text-[#007A36] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-[#007A36] rounded-full transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#007A36] border-t border-[#006B2F]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#009A44] transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile store badge */}
            {user?.isLoggedIn && selectedStore && (
              <div className="px-3 py-2 text-xs text-white/70 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {selectedStore.name}
              </div>
            )}

            <div className="pt-2 border-t border-[#006B2F]">
              {user?.isLoggedIn ? (
                <>
                  <div className="px-3 py-2 text-sm font-semibold">Hi, {user.name} 👋</div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-red-300 hover:bg-[#009A44] transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { navigate('/signin'); setMobileOpen(false) }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold hover:bg-[#009A44] transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
