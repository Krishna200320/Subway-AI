import { ALL_ITEMS } from '../data/menuData'

const ITEM_LOOKUP = ALL_ITEMS.map(item => ({
  id:   item.id,
  name: item.name.toLowerCase(),
}))

const CATEGORY_KEYS = {
  footlongs: ['footlong', 'footlongs'],
  sixInch:   ['6-inch', 'six inch', '6 inch', 'half sub'],
  wraps:     ['wrap', 'wraps'],
  bowls:     ['bowl', 'bowls'],
  sides:     ['side', 'sides', 'chips', 'potato rings', 'snackwich', 'soup'],
  drinks:    ['drink', 'drinks', 'beverage', 'water', 'juice', 'coffee'],
  cookies:   ['cookie', 'cookies', 'dessert'],
  sauces:    ['sauce', 'sauces'],
}

const SHOW_MENU_PHRASES = [
  'let me show you the menu',
  "here's the menu",
  'check out the menu',
  'take a look at the menu',
]

const PROMO_PHRASES = [
  'promo', 'deal', 'discount', 'code', 'offer', 'save', 'free',
  'longweekend', '6inch199', 'snackring', '20offbowl', 'soupnsub',
]

const STORE_PHRASES = ['find a store', 'store locator', 'near me', 'pick a location', 'select a store']

export function parseGhostActions(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const actions = []

  // Specific item highlights (highest priority)
  const itemMatches = ITEM_LOOKUP.filter(({ name }) => lower.includes(name))
  if (itemMatches.length > 0) {
    actions.push({ type: 'highlightItems', itemIds: itemMatches.slice(0, 3).map(i => i.id), page: 'menu' })
    return actions // one action type per response
  }

  // Category scroll
  for (const [catId, phrases] of Object.entries(CATEGORY_KEYS)) {
    if (phrases.some(p => lower.includes(p))) {
      actions.push({ type: 'scrollToCategory', catId, page: 'menu' })
      return actions
    }
  }

  // Show menu phrases
  if (SHOW_MENU_PHRASES.some(p => lower.includes(p))) {
    actions.push({ type: 'navigateTo', page: 'menu' })
    return actions
  }

  // Promo/deal highlight
  if (PROMO_PHRASES.some(p => lower.includes(p))) {
    actions.push({ type: 'showPromos', page: 'home' })
    return actions
  }

  // Store selection
  if (STORE_PHRASES.some(p => lower.includes(p))) {
    actions.push({ type: 'navigateTo', page: 'store-select' })
    return actions
  }

  return actions
}
