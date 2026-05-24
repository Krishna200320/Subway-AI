const promos = [
  {
    id: 1,
    title: 'Buy 1 Footlong, Get 1 50% Off',
    description: 'Mix and match any two Footlongs. Offer valid for a limited time at participating locations.',
    code: 'LONGWEEKEND',
    badge: 'Best Value',
  },
  {
    id: 2,
    title: '$1.99 6-inch Sub',
    description: 'Add a 6-inch sub to your order when you buy any Footlong. Available on select subs.',
    code: '6INCH199',
    badge: 'Add-On Deal',
  },
  {
    id: 3,
    title: '$5 Snackwich & Potato Rings',
    description: 'Get a Snackwich sandwich paired with Potato Rings for just $5. A perfect snack combo.',
    code: 'SNACKRING',
    badge: 'Snack Combo',
  },
  {
    id: 4,
    title: '20% Off Any Bowl',
    description: 'Enjoy any Subway Bowl at 20% off. Fresh, made-your-way, and perfectly portioned.',
    code: '20OFFBOWL',
    badge: 'Bowl Deal',
  },
]

function PromoCard({ promo }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 flex flex-col">
      {/* Green accent top bar */}
      <div className="h-2 bg-[#009A44]" />

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="bg-[#E8F5ED] text-[#007A36] text-xs font-semibold px-2.5 py-1 rounded-full">
            {promo.badge}
          </span>
        </div>

        <h3 className="text-gray-900 font-bold text-lg leading-snug mb-2">{promo.title}</h3>
        <p className="text-gray-500 text-sm flex-1 leading-relaxed">{promo.description}</p>

        {/* Promo code pill */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-gray-400 text-xs">Use code:</span>
          <span className="bg-[#FFCC00] text-[#007A36] font-bold text-xs px-3 py-1 rounded-full tracking-wider">
            {promo.code}
          </span>
        </div>

        <button className="mt-4 w-full bg-[#009A44] text-white font-semibold py-2.5 rounded-full hover:bg-[#007A36] transition-colors duration-150 text-sm">
          Order Now
        </button>
      </div>
    </div>
  )
}

export default function PromotionsSection() {
  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-[#009A44] font-semibold text-sm uppercase tracking-widest mb-1">Save More</p>
          <h2 className="text-gray-900 font-black text-3xl sm:text-4xl">Deals & Promotions</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Exclusive offers and limited-time deals — only at Subway Canada.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      </div>
    </section>
  )
}
