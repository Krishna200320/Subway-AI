import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const stores = [
  { id: 1, name: 'Subway Vaughan Mills',        address: '1 Bass Pro Mills Dr, Vaughan ON',      hours: 'Open until 10pm', distance: '0.8km', rating: 4.3 },
  { id: 2, name: 'Subway Jane & Major Mac',     address: '3075 Major Mackenzie Dr, Vaughan ON',  hours: 'Open until 11pm', distance: '1.2km', rating: 4.1 },
  { id: 3, name: 'Subway Rutherford & Weston',  address: '600 Rutherford Rd, Vaughan ON',        hours: 'Open until 9pm',  distance: '2.1km', rating: 4.5 },
]

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

function StarRating({ rating }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= filled ? 'text-[#FFCC00]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-gray-500 text-xs ml-1">{rating}</span>
    </div>
  )
}

function StoreCard({ store, onOrderNow }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 text-base leading-snug">{store.name}</h3>
        <span className="flex-shrink-0 bg-[#009A44] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {store.distance}
        </span>
      </div>

      <p className="text-gray-500 text-sm mt-1.5 flex items-start gap-1.5">
        <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {store.address}
      </p>

      <p className="text-sm mt-1 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-[#009A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[#007A36] font-medium">{store.hours}</span>
      </p>

      <div className="mt-2">
        <StarRating rating={store.rating} />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onOrderNow(store)}
          className="flex-1 bg-[#009A44] text-white font-semibold py-2 rounded-full text-sm hover:bg-[#007A36] transition-colors"
        >
          Order Now
        </button>
        <button
          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(store.address)}`, '_blank')}
          className="flex-1 border border-[#009A44] text-[#009A44] font-semibold py-2 rounded-full text-sm hover:bg-[#E8F5ED] transition-colors"
        >
          Get Directions
        </button>
      </div>
    </div>
  )
}

export default function StoreSelectPage() {
  const navigate = useNavigate()
  const { user, selectStore } = useAuth()
  const [showStores, setShowStores] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function handleUseLocation() {
    setLocationLoading(true)
    setShowStores(false)
    setTimeout(() => {
      setLocationLoading(false)
      setShowStores(true)
    }, 1000)
  }

  function handleSearch(e) {
    e.preventDefault()
    setShowStores(true)
  }

  function handleOrderNow(store) {
    selectStore(store)
    navigate('/menu')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Page header */}
          <div className="mb-8">
            <p className="text-[#009A44] font-semibold text-sm uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-gray-900 font-black text-3xl sm:text-4xl">
              Hi, {user?.name}. Find your Subway.
            </h1>
            <p className="text-gray-500 mt-1.5">Choose a location to start your order.</p>
          </div>

          {/* Location banner */}
          <div className="bg-[#009A44] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-white text-center sm:text-left">
              <p className="font-bold text-lg">Use your current location</p>
              <p className="text-white/70 text-sm">We'll find the nearest Subway stores.</p>
            </div>
            <button
              onClick={handleUseLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 bg-white text-[#009A44] font-semibold px-6 py-2.5 rounded-full hover:bg-[#FFCC00] hover:text-[#007A36] transition-colors disabled:opacity-70 flex-shrink-0 text-sm"
            >
              {locationLoading ? (
                <>
                  <Spinner />
                  Locating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use My Location
                </>
              )}
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by city, address or postal code…"
              className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009A44] focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-[#009A44] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#007A36] transition-colors text-sm flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Store cards */}
          {showStores && (
            <div>
              <p className="text-gray-500 text-sm mb-4">{stores.length} locations found near you</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {stores.map(store => (
                  <StoreCard key={store.id} store={store} onOrderNow={handleOrderNow} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state — before any search */}
          {!showStores && !locationLoading && (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Use your location or search to find nearby stores.</p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}
