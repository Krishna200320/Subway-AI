export const PROMOS = {
  LONGWEEKEND: {
    code: 'LONGWEEKEND',
    title: 'Buy 1 Footlong, Get 1 50% Off',
    description: 'Add 2 footlongs to your cart and the cheaper one is 50% off.',
    validate: (items) => items.filter(i => i.category === 'Footlongs').length >= 2,
    errorMsg: 'Add at least 2 Footlongs to your cart to use this code.',
    calculate: (items) => {
      const fls = items
        .filter(i => i.category === 'Footlongs')
        .map(i => i.unitPrice)
        .sort((a, b) => a - b)
      return fls[0] * 0.5
    },
  },
  '6INCH199': {
    code: '6INCH199',
    title: '$1.99 6-inch Sub',
    description: 'Buy any Footlong and add a 6-inch sub for only $1.99.',
    validate: (items) =>
      items.some(i => i.category === 'Footlongs') &&
      items.some(i => i.category === '6-inch Subs'),
    errorMsg: 'Add a Footlong and a 6-inch Sub to your cart to use this code.',
    calculate: (items) => {
      const sixInches = items.filter(i => i.category === '6-inch Subs').map(i => i.unitPrice).sort((a, b) => a - b)
      return Math.max(0, sixInches[0] - 1.99)
    },
  },
  SNACKRING: {
    code: 'SNACKRING',
    title: '$5 Snackwich & Potato Rings',
    description: 'Get any Snackwich and Potato Rings combo for only $5.',
    validate: (items) =>
      items.some(i => i.name === 'Snackwich') &&
      items.some(i => i.name === 'Potato Rings'),
    errorMsg: 'Add a Snackwich and Potato Rings to your cart to use this code.',
    calculate: (items) => {
      const sw = items.find(i => i.name === 'Snackwich')?.unitPrice || 0
      const pr = items.find(i => i.name === 'Potato Rings')?.unitPrice || 0
      return Math.max(0, sw + pr - 5.00)
    },
  },
  '20OFFBOWL': {
    code: '20OFFBOWL',
    title: '20% Off Any Bowl',
    description: '20% off all bowl items in your cart.',
    validate: (items) => items.some(i => i.category === 'Bowls'),
    errorMsg: 'Add at least one Bowl to your cart to use this code.',
    calculate: (items) =>
      items.filter(i => i.category === 'Bowls')
        .reduce((sum, i) => sum + i.unitPrice * 0.20 * i.quantity, 0),
  },
  SOUPNSUB: {
    code: 'SOUPNSUB',
    title: 'Soup for $0.99 with any Sub',
    description: 'Buy any sub and add Soup for only $0.99.',
    validate: (items) =>
      items.some(i => ['Footlongs', '6-inch Subs', 'Wraps'].includes(i.category)) &&
      items.some(i => i.name === 'Soup'),
    errorMsg: 'Add any Sub and a Soup to your cart to use this code.',
    calculate: (items) => {
      const soup = items.find(i => i.name === 'Soup')
      return soup ? Math.max(0, soup.unitPrice - 0.99) : 0
    },
  },
}

export const ACTIVE_PROMOS = Object.values(PROMOS)
