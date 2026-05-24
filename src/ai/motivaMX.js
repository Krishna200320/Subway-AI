// Motiva MX — Tone and personality detection engine

const SIGNALS = {
  spicyLover:      ['spicy', 'hot', 'jalapeño', 'jalapeno', 'fire', 'heat', 'buffalo', 'burn', 'sriracha', 'pepper', 'spice', 'kick', 'flaming'],
  healthConscious: ['calorie', 'healthy', 'light', 'diet', 'low cal', 'vegetarian', 'vegan', 'fresh', 'veggie', 'salad', 'low carb', 'fit', 'clean', 'macro', 'fitness', 'weight'],
  proteinFocused:  ['protein', 'gym', 'gains', 'chicken', 'steak', 'double', 'macro', 'muscle', 'bulk', 'high protein', 'meat', 'workout', 'lifting'],
  dealSeeker:      ['cheap', 'deal', 'discount', 'offer', 'code', 'save', 'promo', 'sale', 'coupon', 'free', 'cost', 'price', 'budget', 'value', 'student'],
  inARush:         ['quick', 'fast', 'hurry', 'busy', 'same as always', 'usual', 'asap', 'in a rush', 'no time', 'quickly'],
  indecisive:      ['not sure', 'idk', 'i don\'t know', 'maybe', 'help me', 'what do you recommend', 'suggest', 'can\'t decide', 'anything'],
}

export const PERSONALITY_META = {
  spicyLover:      { label: 'Spice Lover 🌶️',       color: 'bg-orange-100 text-orange-700' },
  healthConscious: { label: 'Health-conscious 🥗',   color: 'bg-emerald-100 text-emerald-700' },
  proteinFocused:  { label: 'Protein-focused 💪',    color: 'bg-blue-100 text-blue-700' },
  dealSeeker:      { label: 'Deal seeker 💰',         color: 'bg-yellow-100 text-yellow-700' },
  inARush:         { label: 'In a rush ⚡',            color: 'bg-orange-100 text-orange-700' },
  indecisive:      { label: 'Needs guidance 🤔',      color: 'bg-purple-100 text-purple-700' },
}

const PERSONALITY_ORDER = ['spicyLover', 'healthConscious', 'proteinFocused', 'dealSeeker', 'inARush', 'indecisive']

export function detectPersonality(text, current = null) {
  if (!text) return current
  const lower = text.toLowerCase()

  const scores = {}
  for (const type of PERSONALITY_ORDER) {
    scores[type] = SIGNALS[type].filter(kw => lower.includes(kw)).length
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  if (best[1] === 0) return current
  return best[0]
}

const FRUSTRATION_SIGNALS = [
  'wrong', 'broken', "doesn't work", "not working", "won't work", "isn't working",
  'useless', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'annoyed',
  'ridiculous', 'seriously', 'wtf', 'ugh', "come on", 'again', 'still not',
  'not helpful', 'bad', 'worst', 'horrible', "can't even", 'give up', 'help me',
]

export function detectFrustration(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return FRUSTRATION_SIGNALS.some(s => lower.includes(s))
}

export function getPersonalityContext(personality) {
  if (!personality) return ''
  const contexts = {
    spicyLover:      'The user loves spicy food. Always include jalapeños, pepperjack cheese, and buffalo sauce in recommendations. Mention heat levels.',
    healthConscious: 'The user is health-conscious. Mention calories for every item, highlight Veggie Delite, Turkey Breast, and low-cal options. Include macros when relevant.',
    proteinFocused:  'The user is protein-focused. Recommend double protein options, Rotisserie Chicken (52g protein), Steak. Include protein grams in every recommendation.',
    dealSeeker:      'The user wants deals. Proactively mention all active promo codes: LONGWEEKEND, 6INCH199, SNACKRING, 20OFFBOWL, SOUPNSUB. Lead with value.',
    inARush:         'The user is in a rush. Be concise. Give top 2-3 options immediately. Skip long explanations. Use short sentences.',
    indecisive:      'The user is indecisive. Ask one simple yes/no question to narrow down choice (meat or no meat? hot or cold?). Guide gently.',
  }
  return contexts[personality] || ''
}
