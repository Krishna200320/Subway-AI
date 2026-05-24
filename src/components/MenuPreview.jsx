import { useNavigate } from 'react-router-dom'

const categories = [
  { id: 1, name: 'Footlongs', emoji: '🥖', bg: 'from-green-400 to-green-600', description: '12" of fresh flavour' },
  { id: 2, name: '6-inch Subs', emoji: '🥪', bg: 'from-emerald-400 to-emerald-600', description: 'The perfect size' },
  { id: 3, name: 'Wraps', emoji: '🌯', bg: 'from-teal-400 to-teal-600', description: 'Fresh & portable' },
  { id: 4, name: 'Bowls', emoji: '🥗', bg: 'from-lime-500 to-green-600', description: 'Low carb, big flavour' },
  { id: 5, name: 'Sides', emoji: '🍟', bg: 'from-yellow-400 to-orange-400', description: 'Chips, rings & more' },
  { id: 6, name: 'Drinks', emoji: '🥤', bg: 'from-sky-400 to-blue-500', description: 'Cold & refreshing' },
  { id: 7, name: 'Cookies', emoji: '🍪', bg: 'from-amber-400 to-yellow-500', description: 'Baked fresh daily' },
]

function CategoryCard({ category, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-none w-36 sm:w-44 group cursor-pointer text-left"
    >
      <div className={`bg-gradient-to-br ${category.bg} rounded-2xl h-36 sm:h-44 flex flex-col items-center justify-center gap-2 shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-200`}>
        <span className="text-4xl sm:text-5xl">{category.emoji}</span>
        <span className="text-white font-bold text-sm sm:text-base text-center px-2">{category.name}</span>
      </div>
      <p className="text-gray-500 text-xs text-center mt-2">{category.description}</p>
    </button>
  )
}

export default function MenuPreview() {
  const navigate = useNavigate()

  const handleCategoryClick = () => {
    navigate('/menu')
  }

  return (
    <section className="py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#009A44] font-semibold text-sm uppercase tracking-widest mb-1">Explore</p>
            <h2 className="text-gray-900 font-black text-3xl sm:text-4xl">Our Menu</h2>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="text-[#009A44] font-semibold text-sm hover:text-[#007A36] hover:underline transition-colors flex items-center gap-1"
          >
            View Full Menu
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onClick={handleCategoryClick} />
          ))}
        </div>
      </div>
    </section>
  )
}
