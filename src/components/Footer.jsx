import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const YouTubeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
)

const footerLinks = [
  { label: 'View National Menu', href: '/menu' },
  { label: 'Gift Cards', href: '#' },
  { label: 'Download App', href: '#' },
  { label: 'About Us', href: '#' },
  { label: 'Careers', href: '#' },
]

const socialLinks = [
  { Icon: FacebookIcon, label: 'Facebook', href: '#' },
  { Icon: InstagramIcon, label: 'Instagram', href: '#' },
  { Icon: TwitterIcon, label: 'Twitter / X', href: '#' },
  { Icon: YouTubeIcon, label: 'YouTube', href: '#' },
]

export default function Footer() {
  const [lang, setLang] = useState('en')
  const { setDemoMode } = useDemo()

  return (
    <footer className="bg-white border-t-4 border-[#009A44] mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#009A44] rounded px-2 py-1">
              <span className="text-white font-black text-lg tracking-tight">SUBWAY</span>
            </div>
            <span className="text-gray-500 text-xs">Canada</span>
          </Link>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-gray-400 hover:text-[#009A44] transition-colors duration-150 p-2 rounded-full hover:bg-[#E8F5ED]"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-gray-500 text-sm hover:text-[#009A44] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <hr className="border-gray-200 mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-xs">
          <p>
            © 2026 Subway. All Rights Reserved. Subway is a registered trademark.
            <button onClick={() => setDemoMode(d => !d)}
              className="ml-2 opacity-0 hover:opacity-30 focus:opacity-30 transition-opacity text-gray-400 text-[10px]"
              title="Toggle demo mode" aria-label="Toggle demo mode">
              ◉
            </button>
          </p>

          {/* Language toggle */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-full overflow-hidden text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-[#009A44] text-white font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              CA English
            </button>
            <button
              onClick={() => setLang('fr')}
              className={`px-3 py-1.5 transition-colors ${lang === 'fr' ? 'bg-[#009A44] text-white font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              CA Français
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
