// StyleSense — Visual personality themes for the AI chat panel

export const PERSONALITY_THEMES = {
  healthConscious: {
    id:           'healthConscious',
    name:         'Health Mode',
    panelBg:      '#F0FBF4',
    headerBg:     '#009A44',
    accentColor:  '#009A44',
    bubbleStyle:  { backgroundColor: '#ffffff', borderLeft: '3px solid #22c55e', paddingLeft: '14px' },
    pillLabel:    'StyleSense: Health Mode',
    pillStyle:    { backgroundColor: '#dcfce7', color: '#15803d' },
    greeting:     "I'm in health mode — I'll keep everything under 400 calories and show you macros for every suggestion.",
    quickReplies: ['Under 300 cal', 'High protein', 'Vegetarian', 'Low carb'],
    showTicker:   false,
  },
  dealSeeker: {
    id:           'dealSeeker',
    name:         'Deal Mode',
    panelBg:      '#FFFDF0',
    headerBg:     '#F59E0B',
    accentColor:  '#F59E0B',
    bubbleStyle:  { backgroundColor: '#fffbeb', borderLeft: '3px solid #f59e0b', paddingLeft: '14px' },
    pillLabel:    'StyleSense: Deal Mode',
    pillStyle:    { backgroundColor: '#fef3c7', color: '#b45309' },
    greeting:     "Deal mode activated — I'll find you the best value and mention every promo code that applies to your order.",
    quickReplies: ['Best value today', 'Combos', 'Student deals', 'Free items'],
    showTicker:   true,
    tickerText:   'LONGWEEKEND: Buy 1 Footlong get 1 50% off  ·  6INCH199: 6-inch for $1.99 with any footlong  ·  SNACKRING: $5 Snackwich + Rings  ·  20OFFBOWL: 20% off any bowl  ·  SOUPNSUB: Soup $0.99 with any sub',
  },
  proteinFocused: {
    id:           'proteinFocused',
    name:         'Gains Mode',
    panelBg:      '#FFF8F0',
    headerBg:     '#DC2626',
    accentColor:  '#DC2626',
    bubbleStyle:  { backgroundColor: '#fff7ed', borderLeft: '3px solid #dc2626', paddingLeft: '14px' },
    pillLabel:    'StyleSense: Gains Mode',
    pillStyle:    { backgroundColor: '#fee2e2', color: '#b91c1c' },
    greeting:     "Gains mode — I'll maximize your protein. Every recommendation comes with a full macro breakdown.",
    quickReplies: ['Highest protein', 'Double protein', 'Low carb high protein', 'Post workout meal'],
    showTicker:   false,
  },
  spicyLover: {
    id:           'spicyLover',
    name:         'Spice Mode',
    panelBg:      '#FFF5F0',
    headerBg:     '#FF6B35',
    accentColor:  '#FF6B35',
    bubbleStyle:  { backgroundColor: '#fff7ed', borderLeft: '3px solid #ff6b35', paddingLeft: '14px' },
    pillLabel:    'StyleSense: Spice Mode',
    pillStyle:    { backgroundColor: '#ffedd5', color: '#c2410c' },
    greeting:     "Spice mode — I'm building you something that will wake you up. 🌶️",
    quickReplies: ['Make it hotter', 'Spiciest item', 'Medium heat', 'Fire combo'],
    showTicker:   false,
  },
  default: {
    id:           'default',
    name:         'Standard',
    panelBg:      '#ffffff',
    headerBg:     '#009A44',
    accentColor:  '#009A44',
    bubbleStyle:  { backgroundColor: '#f3f4f6' },
    pillLabel:    'StyleSense: Getting to know you...',
    pillStyle:    { backgroundColor: '#f3f4f6', color: '#6b7280' },
    greeting:     null,
    quickReplies: ['Surprise me', 'Most popular', 'Something new', 'My usual'],
    showTicker:   false,
  },
}

const PERSONALITY_TO_THEME = {
  healthConscious: 'healthConscious',
  dealSeeker:      'dealSeeker',
  proteinFocused:  'proteinFocused',
  spicyLover:      'spicyLover',
  inARush:         'default',
  indecisive:      'default',
}

export function getTheme(personality) {
  const key = PERSONALITY_TO_THEME[personality] || 'default'
  return PERSONALITY_THEMES[key]
}
