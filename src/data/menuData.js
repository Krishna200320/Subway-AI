export const CATEGORIES = [
  { id: 'footlongs',  label: 'Footlongs',    emoji: '🥖' },
  { id: 'sixInch',    label: '6-inch Subs',  emoji: '🥪' },
  { id: 'wraps',      label: 'Wraps',        emoji: '🌯' },
  { id: 'bowls',      label: 'Bowls',        emoji: '🥗' },
  { id: 'sides',      label: 'Sides',        emoji: '🍟' },
  { id: 'drinks',     label: 'Drinks',       emoji: '🥤' },
  { id: 'cookies',    label: 'Cookies',      emoji: '🍪' },
  { id: 'sauces',     label: 'Sauces',       emoji: '🫙' },
]

export const BREAD_OPTIONS = ['9-Grain Wheat', 'Italian White', 'Hearty Multigrain', 'Flatbread', 'Wrap']
export const CHEESE_OPTIONS = ['American', 'Cheddar', 'Provolone', 'Swiss', 'Pepperjack', 'No Cheese']
export const VEGGIE_OPTIONS = [
  { name: 'Lettuce' },
  { name: 'Tomatoes' },
  { name: 'Cucumbers' },
  { name: 'Green Peppers' },
  { name: 'Red Onions' },
  { name: 'Jalapeños' },
  { name: 'Pickles' },
  { name: 'Olives' },
  { name: 'Banana Peppers' },
  { name: 'Spinach' },
  { name: 'Avocado', extraCost: 1.50 },
]
export const SAUCE_OPTIONS = [
  'Mayo', 'Mustard', 'Ranch', 'Chipotle', 'Sweet Onion',
  'Honey Mustard', 'Oil & Vinegar', 'Salt & Pepper',
]

const FL_ITEMS = [
  { id: 'fl-bmt',      name: 'Italian BMT',        description: 'Pepperoni, salami, ham',             calories: 410, price: 12.49, deals: ['LONGWEEKEND', '6INCH199'], image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400' },
  { id: 'fl-chicken',  name: 'Rotisserie Chicken',  description: 'Tender rotisserie chicken',          calories: 360, price: 13.99, deals: ['LONGWEEKEND', '6INCH199'], image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400' },
  { id: 'fl-steak',    name: 'Steak and Cheese',    description: 'Steak, melted cheese',               calories: 380, price: 13.49, deals: ['LONGWEEKEND', '6INCH199'], image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400' },
  { id: 'fl-tuna',     name: 'Tuna',                description: 'Creamy tuna mix',                    calories: 390, price: 12.49, deals: ['LONGWEEKEND', '6INCH199'], image: 'https://images.unsplash.com/photo-1485704686097-ed47f7263ca4?w=400' },
  { id: 'fl-veggie',   name: 'Veggie Delite',       description: 'Fresh vegetables only',              calories: 230, price: 11.99, deals: ['LONGWEEKEND', '6INCH199'], image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
  { id: 'fl-teriyaki', name: 'Teriyaki Crunch',     description: 'Chicken, teriyaki, crispy onions',  calories: 420, price: 13.99, deals: ['LONGWEEKEND', '6INCH199'], image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400' },
  { id: 'fl-turkey',   name: 'Turkey Breast',       description: 'Oven-roasted turkey, lettuce',       calories: 280, price: 12.49, deals: ['LONGWEEKEND', '6INCH199'], image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
  { id: 'fl-meatball', name: 'Meatball Marinara',   description: 'Meatballs in marinara sauce',        calories: 480, price: 11.99, deals: ['LONGWEEKEND', '6INCH199'], image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
]

// 6-inch items inherit image from footlong via spread
const SIX_ITEMS = FL_ITEMS.map(item => ({
  ...item,
  id:       item.id.replace('fl-', 'si-'),
  price:    Math.round((item.price / 2) * 4) / 4,
  calories: Math.round(item.calories / 2),
  deals:    item.deals.filter(d => d !== '6INCH199'),
}))

const WRAP_ITEMS = [
  { id: 'wr-chicken', name: 'Rotisserie Chicken Wrap', description: 'Tender chicken in a soft flour wrap', calories: 340, price: 12.99, deals: [], image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400' },
  { id: 'wr-turkey',  name: 'Turkey Wrap',              description: 'Oven-roasted turkey, fresh veggies',  calories: 300, price: 11.99, deals: [], image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
  { id: 'wr-veggie',  name: 'Veggie Wrap',              description: 'Fresh greens, colourful veggies',     calories: 240, price: 10.99, deals: [], image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
]

const BOWL_ITEMS = [
  { id: 'bw-chicken', name: 'Rotisserie Chicken Bowl', description: 'Chicken over fresh lettuce & toppings', calories: 360, price: 12.99, deals: ['20OFFBOWL'], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
  { id: 'bw-steak',   name: 'Steak Bowl',              description: 'Steak over fresh greens',               calories: 340, price: 12.99, deals: ['20OFFBOWL'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
  { id: 'bw-veggie',  name: 'Veggie Bowl',             description: 'All vegetables, all flavour',           calories: 220, price: 11.99, deals: ['20OFFBOWL'], image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400' },
  { id: 'bw-tuna',    name: 'Tuna Bowl',               description: 'Creamy tuna on a bed of greens',        calories: 370, price: 12.49, deals: ['20OFFBOWL'], image: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?w=400' },
]

const SIDE_ITEMS = [
  { id: 'sd-chips',     name: 'Chips',       description: 'Crunchy kettle chips',                    calories: 210, price: 2.49, deals: [],              image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
  { id: 'sd-rings',     name: 'Potato Rings', description: 'Golden crispy potato rings',             calories: 180, price: 2.99, deals: ['SNACKRING'],    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400' },
  { id: 'sd-soup',      name: 'Soup',         description: 'Warm house-made soup',                   calories: 150, price: 3.49, deals: ['SOUPNSUB'],     image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
  { id: 'sd-apple',     name: 'Apple Slices', description: 'Fresh-cut apple slices',                 calories: 35,  price: 1.99, deals: [],              image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400' },
  { id: 'sd-snackwich', name: 'Snackwich',    description: 'Mini flatbread with your choice of protein', calories: 280, price: 4.49, deals: ['SNACKRING'], image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400' },
]

const DRINK_ITEMS = [
  { id: 'dr-fountain-s', name: 'Fountain Drink (S)', description: 'Small fountain drink',  calories: 150, price: 2.49, deals: [], image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
  { id: 'dr-fountain-m', name: 'Fountain Drink (M)', description: 'Medium fountain drink', calories: 210, price: 2.99, deals: [], image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
  { id: 'dr-fountain-l', name: 'Fountain Drink (L)', description: 'Large fountain drink',  calories: 270, price: 3.49, deals: [], image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
  { id: 'dr-water',      name: 'Bottled Water',       description: 'Purified water',        calories: 0,   price: 2.49, deals: [], image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400' },
  { id: 'dr-juice',      name: 'Juice Box',           description: '100% fruit juice',      calories: 110, price: 2.49, deals: [], image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  { id: 'dr-coffee',     name: 'Coffee',              description: 'Fresh brewed coffee',   calories: 5,   price: 2.99, deals: [], image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' },
]

const COOKIE_ITEMS = [
  { id: 'ck-choc',    name: 'Chocolate Chip',       description: 'Classic chocolate chip',       calories: 200, price: 1.29, deals: [], image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400' },
  { id: 'ck-dbl',     name: 'Double Chocolate',     description: 'Rich double chocolate',        calories: 210, price: 1.29, deals: [], image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
  { id: 'ck-oatmeal', name: 'Oatmeal Raisin',       description: 'Hearty oatmeal with raisins', calories: 190, price: 1.29, deals: [], image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
  { id: 'ck-wc',      name: 'White Choc Macadamia', description: 'White chocolate, macadamia',  calories: 220, price: 1.29, deals: [], image: 'https://images.unsplash.com/photo-1617883861744-4da87399b722?w=400' },
]

export const SAUCE_INFO = [
  { name: 'Mayo',           description: 'Classic creamy mayo',              heat: 0 },
  { name: 'Mustard',        description: 'Tangy yellow mustard',             heat: 0 },
  { name: 'Ranch',          description: 'Creamy herb ranch',                heat: 0 },
  { name: 'Chipotle',       description: 'Smoky chipotle southwest',         heat: 2 },
  { name: 'Sweet Onion',    description: 'Sweet caramelised onion',          heat: 0 },
  { name: 'Honey Mustard',  description: 'Sweet honey mustard blend',        heat: 0 },
  { name: 'Oil & Vinegar',  description: 'Classic oil and red wine vinegar', heat: 0 },
  { name: 'Salt & Pepper',  description: 'Simple seasoning',                 heat: 0 },
]

export const MENU_BY_CATEGORY = {
  footlongs: FL_ITEMS.map(i => ({ ...i, category: 'Footlongs' })),
  sixInch:   SIX_ITEMS.map(i => ({ ...i, category: '6-inch Subs' })),
  wraps:     WRAP_ITEMS.map(i => ({ ...i, category: 'Wraps' })),
  bowls:     BOWL_ITEMS.map(i => ({ ...i, category: 'Bowls' })),
  sides:     SIDE_ITEMS.map(i => ({ ...i, category: 'Sides' })),
  drinks:    DRINK_ITEMS.map(i => ({ ...i, category: 'Drinks' })),
  cookies:   COOKIE_ITEMS.map(i => ({ ...i, category: 'Cookies' })),
  sauces:    [],
}

export const ALL_ITEMS = Object.values(MENU_BY_CATEGORY).flat()

export function getItemType(item) {
  if (['Footlongs', '6-inch Subs', 'Wraps'].includes(item.category)) return 'sub'
  if (item.category === 'Bowls') return 'bowl'
  if (item.category === 'Cookies') return 'cookie'
  return 'simple'
}
