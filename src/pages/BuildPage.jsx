import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BuilderNudge from '../components/builder/BuilderNudge'
import { useBuilder } from '../context/BuilderContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

/* ─── Option data ─── */
const ITEM_OPTIONS = [
  { key: 'Footlong',  label: 'Footlong',    desc: '12-inch sub · best value',     icon: '🥖', price: '$12.99' },
  { key: '6-inch',    label: '6-inch Sub',  desc: 'Half sub',                     icon: '🥪', price: '$8.99'  },
  { key: 'Wrap',      label: 'Wrap',        desc: 'Soft tortilla wrap',           icon: '🌯', price: '$10.99' },
  { key: 'Bowl',      label: 'Bowl',        desc: 'Low-carb, no bread',           icon: '🥗', price: '$11.99' },
]

const BREAD_OPTIONS = [
  { key: '9-Grain Wheat',    label: '9-Grain Wheat',    desc: '180 cal · most popular' },
  { key: 'Italian White',    label: 'Italian White',    desc: '190 cal'                },
  { key: 'Hearty Multigrain', label: 'Hearty Multigrain', desc: '200 cal'              },
  { key: 'Flatbread',        label: 'Flatbread',        desc: '170 cal · thin & crispy'},
  { key: 'Sourdough',        label: 'Sourdough',        desc: '190 cal · tangy'        },
]

const PROTEIN_OPTIONS = [
  { key: 'Turkey Breast',      label: 'Turkey Breast',      cal: 280, icon: '🦃' },
  { key: 'Rotisserie Chicken', label: 'Rotisserie Chicken', cal: 360, icon: '🍗' },
  { key: 'Steak & Cheese',     label: 'Steak & Cheese',     cal: 380, icon: '🥩' },
  { key: 'Italian BMT',        label: 'Italian BMT',        cal: 410, icon: '🍕' },
  { key: 'Tuna',               label: 'Tuna',               cal: 380, icon: '🐟' },
  { key: 'Meatball Marinara',  label: 'Meatball Marinara',  cal: 480, icon: '🍝' },
  { key: 'Veggie Delite',      label: 'Veggie Delite',      cal: 230, icon: '🥦' },
]

const CHEESE_OPTIONS = [
  { key: 'No Cheese',  label: 'No Cheese',  icon: '✕' },
  { key: 'American',   label: 'American',   icon: '🧀' },
  { key: 'Cheddar',    label: 'Cheddar',    icon: '🧀' },
  { key: 'Provolone',  label: 'Provolone',  icon: '🧀' },
  { key: 'Swiss',      label: 'Swiss',      icon: '🧀' },
  { key: 'Pepperjack', label: 'Pepperjack', icon: '🌶️' },
]

const VEGGIE_OPTIONS = [
  'Lettuce', 'Tomatoes', 'Cucumbers', 'Green Peppers', 'Red Onions',
  'Jalapeños', 'Pickles', 'Olives', 'Banana Peppers', 'Spinach', 'Avocado',
]

const SAUCE_OPTIONS = [
  'Mayo', 'Yellow Mustard', 'Honey Mustard', 'Ranch',
  'Chipotle Southwest', 'Sweet Onion', 'Buffalo', 'Oil & Vinegar',
]

const MEAL_OPTIONS = [
  { key: 'Chips + Drink',        label: 'Chips + Drink',        price: '+$3.99' },
  { key: 'Potato Rings + Drink', label: 'Potato Rings + Drink', price: '+$4.49' },
  { key: 'Soup + Drink',         label: 'Soup + Drink',         price: '+$4.99' },
]

const STEP_TITLES = [
  'Choose Your Item',
  'Choose Your Bread',
  'Choose Your Protein',
  'Choose Your Cheese',
  'Choose Your Veggies',
  'Choose Your Sauces',
  'Extras',
  'Review Your Order',
]

/* ─── Selection pill ─── */
function Pill({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
        selected
          ? 'border-[#009A44] bg-[#E8F5ED] text-[#007A36]'
          : 'border-gray-200 text-gray-600 hover:border-[#009A44]/50'
      }`}
    >
      {label}
    </button>
  )
}

/* ─── Card option ─── */
function OptionCard({ icon, label, desc, sub, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected
          ? 'border-[#009A44] bg-[#E8F5ED]'
          : 'border-gray-200 hover:border-[#009A44]/40 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{label}</p>
          {desc && <p className="text-gray-400 text-xs mt-0.5">{desc}</p>}
        </div>
        {sub && <span className="text-gray-400 text-xs flex-shrink-0">{sub}</span>}
        {selected && (
          <span className="w-5 h-5 rounded-full bg-[#009A44] flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
            </svg>
          </span>
        )}
      </div>
    </button>
  )
}

/* ─── Review section row ─── */
function ReviewRow({ label, value, onEdit, step }) {
  if (!value || (Array.isArray(value) && !value.length)) return null
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-gray-900 font-semibold text-sm mt-0.5">
          {Array.isArray(value) ? value.join(', ') : value}
        </p>
      </div>
      <button onClick={() => onEdit(step)} className="text-[#009A44] text-xs font-semibold hover:underline flex-shrink-0 mt-1">
        Edit
      </button>
    </div>
  )
}

function getBasePrice(item) {
  if (item === 'Footlong') return 12.99
  if (item === '6-inch')   return 8.99
  if (item === 'Wrap')     return 10.99
  if (item === 'Bowl')     return 11.99
  return 12.99
}

function getMealPrice(mealDeal) {
  if (!mealDeal) return 0
  if (mealDeal.includes('Chips'))       return 3.99
  if (mealDeal.includes('Potato'))      return 4.49
  if (mealDeal.includes('Soup'))        return 4.99
  return 0
}

export default function BuildPage() {
  const navigate    = useNavigate()
  const builder     = useBuilder()
  const { addItem } = useCart()
  const { showToast } = useToast()

  const {
    item, bread, protein, cheese, veggies, sauces, toasted, mealDeal,
    aiPrefilled, updateBuilder, dismissAIPrefill, getCurrentBuild, reviewNudgeCache, resetBuilder,
  } = builder

  const [step,             setStep]            = useState(1)
  const [bannerDismissed,  setBannerDismissed]  = useState(false)

  const builderState = { item, bread, protein, cheese, veggies, sauces, toasted, mealDeal }

  function goNext() { setStep(s => Math.min(s + 1, 8)) }
  function goBack() { setStep(s => Math.max(s - 1, 1)) }

  function toggleVeggie(v) {
    const next = veggies.includes(v) ? veggies.filter(x => x !== v) : [...veggies, v]
    updateBuilder('veggies', next)
  }

  function toggleSauce(s) {
    const next = sauces.includes(s) ? sauces.filter(x => x !== s) : [...sauces, s]
    updateBuilder('sauces', next)
  }

  function handleAddToCart() {
    const basePrice  = getBasePrice(item)
    const avocadoAdd = veggies.includes('Avocado') ? 1.50 : 0
    const mealAdd    = getMealPrice(mealDeal)
    const total      = basePrice + avocadoAdd + mealAdd

    const customSummary = [
      bread && `${bread}`,
      protein && `${protein}`,
      cheese && cheese !== 'No Cheese' && `${cheese}`,
      veggies?.length && veggies.join(', '),
      sauces?.length  && sauces.join(', '),
      toasted && 'Toasted',
      mealDeal && `+ ${mealDeal}`,
    ].filter(Boolean).join(' · ')

    addItem({
      menuItemId: `builder-${Date.now()}`,
      name: `${protein || 'Sub'} ${item || 'Footlong'}`,
      category: item === 'Bowl' ? 'Bowls' : item === 'Wrap' ? 'Wraps' : item === '6-inch' ? '6-inch Subs' : 'Footlongs',
      customSummary,
      customizations: { bread, protein, cheese, veggies, sauces, toasted, mealDeal },
      quantity: 1,
      unitPrice: total,
    })

    // Save last order for smart memory
    try {
      localStorage.setItem('subway_last_order', JSON.stringify({
        protein, bread, cheese, veggies, sauces, toasted, timestamp: Date.now(),
      }))
    } catch {}

    showToast(`${protein || 'Sub'} added to your cart!`)
    resetBuilder()
    navigate('/cart')
  }

  /* ─── Step content ─── */
  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ITEM_OPTIONS.map(o => (
              <OptionCard key={o.key} icon={o.icon} label={o.label} desc={o.desc} sub={o.price}
                selected={item === o.key} onClick={() => updateBuilder('item', o.key)} />
            ))}
          </div>
        )

      case 2:
        if (item === 'Bowl') {
          return (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-3">🥗</p>
              <p className="font-semibold text-gray-700">Bowls don't need bread!</p>
              <p className="text-sm mt-1">We'll skip this step — tap Next to choose your protein.</p>
            </div>
          )
        }
        return (
          <div className="space-y-3">
            {BREAD_OPTIONS.map(o => (
              <OptionCard key={o.key} label={o.label} desc={o.desc}
                selected={bread === o.key} onClick={() => updateBuilder('bread', o.key)} />
            ))}
          </div>
        )

      case 3:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROTEIN_OPTIONS.map(o => (
              <OptionCard key={o.key} icon={o.icon} label={o.label} desc={`${o.cal} cal`}
                selected={protein === o.key} onClick={() => updateBuilder('protein', o.key)} />
            ))}
          </div>
        )

      case 4:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CHEESE_OPTIONS.map(o => (
              <OptionCard key={o.key} icon={o.icon} label={o.label}
                selected={cheese === o.key} onClick={() => updateBuilder('cheese', o.key)} />
            ))}
          </div>
        )

      case 5:
        return (
          <div className="flex flex-wrap gap-2">
            {VEGGIE_OPTIONS.map(v => (
              <Pill key={v} label={v === 'Avocado' ? 'Avocado +$1.50' : v}
                selected={veggies.includes(v)} onClick={() => toggleVeggie(v)} />
            ))}
          </div>
        )

      case 6:
        return (
          <div className="flex flex-wrap gap-2">
            {SAUCE_OPTIONS.map(s => (
              <Pill key={s} label={s} selected={sauces.includes(s)} onClick={() => toggleSauce(s)} />
            ))}
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            {/* Toasted toggle */}
            <div
              onClick={() => updateBuilder('toasted', !toasted)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                toasted ? 'border-[#009A44] bg-[#E8F5ED]' : 'border-gray-200 bg-white hover:border-[#009A44]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-semibold text-gray-900">Toast my sub</p>
                  <p className="text-gray-400 text-xs">~90 seconds · perfectly melted cheese</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${toasted ? 'bg-[#009A44]' : 'bg-gray-200'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${toasted ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Meal deal */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Add a Meal Deal</p>
              <div className="space-y-2">
                {MEAL_OPTIONS.map(o => (
                  <OptionCard key={o.key} label={o.label} sub={o.price}
                    selected={mealDeal === o.key}
                    onClick={() => updateBuilder('mealDeal', mealDeal === o.key ? null : o.key)} />
                ))}
              </div>
            </div>
          </div>
        )

      case 8: {
        const base    = getBasePrice(item)
        const avo     = veggies.includes('Avocado') ? 1.50 : 0
        const meal    = getMealPrice(mealDeal)
        const total   = base + avo + meal
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <ReviewRow label="Item"    value={item}    onEdit={setStep} step={1} />
              <ReviewRow label="Bread"   value={bread}   onEdit={setStep} step={2} />
              <ReviewRow label="Protein" value={protein} onEdit={setStep} step={3} />
              <ReviewRow label="Cheese"  value={cheese !== 'No Cheese' ? cheese : null} onEdit={setStep} step={4} />
              <ReviewRow label="Veggies" value={veggies} onEdit={setStep} step={5} />
              <ReviewRow label="Sauces"  value={sauces}  onEdit={setStep} step={6} />
              {toasted  && <ReviewRow label="Extras"   value="Toasted"  onEdit={setStep} step={7} />}
              {mealDeal && <ReviewRow label="Meal Deal" value={mealDeal} onEdit={setStep} step={7} />}
            </div>

            {/* Price summary */}
            <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>{item || 'Footlong'}</span>
                <span>${base.toFixed(2)}</span>
              </div>
              {avo > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Avocado add-on</span>
                  <span>+$1.50</span>
                </div>
              )}
              {meal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Meal Deal</span>
                  <span>+${meal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-900 border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span className="text-[#009A44]">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-[#009A44] text-white font-black py-4 rounded-full text-base hover:bg-[#007A36] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Add to Cart · ${total.toFixed(2)}
            </button>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">

        {/* AI pre-fill welcome banner */}
        {aiPrefilled && !bannerDismissed && (
          <div className="mb-5 flex items-start gap-3 bg-[#E8F5ED] border border-[#009A44]/30 rounded-2xl px-5 py-4">
            <svg className="w-5 h-5 text-[#009A44] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div className="flex-1">
              <p className="text-[#007A36] font-bold text-sm">SubAI built this for you</p>
              <p className="text-green-700 text-xs mt-0.5">Based on your request — feel free to customise any step!</p>
            </div>
            <button onClick={() => { setBannerDismissed(true); dismissAIPrefill() }}
              className="text-green-400 hover:text-green-600 transition-colors text-lg leading-none">×</button>
          </div>
        )}

        {/* Back to menu link */}
        <Link to="/menu" className="inline-flex items-center gap-1.5 text-gray-400 text-sm hover:text-[#009A44] transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to menu
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {STEP_TITLES.map((_, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setStep(i + 1)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i + 1 === step
                    ? 'bg-[#009A44] text-white'
                    : i + 1 < step
                    ? 'bg-[#009A44]/30 text-[#007A36]'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i + 1 < step ? '✓' : i + 1}
              </button>
              {i < 7 && <div className={`w-4 h-0.5 ${i + 1 < step ? 'bg-[#009A44]/40' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step heading */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Step {step} of 8</p>
          <h1 className="text-2xl font-black text-gray-900">{STEP_TITLES[step - 1]}</h1>
          {(step === 5 || step === 6) && (
            <p className="text-gray-400 text-sm mt-1">Select as many as you like</p>
          )}
        </div>

        {/* AI nudge — between title and options */}
        <BuilderNudge
          step={step}
          builderState={builderState}
          getCurrentBuild={getCurrentBuild}
          reviewNudgeCache={reviewNudgeCache}
        />

        {/* Step content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        {step < 8 && (
          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={goBack}
                className="flex-1 py-3.5 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:border-gray-300 transition-colors">
                Back
              </button>
            )}
            <button onClick={goNext}
              className="flex-1 bg-[#009A44] text-white font-bold py-3.5 rounded-full hover:bg-[#007A36] transition-colors shadow-md">
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
