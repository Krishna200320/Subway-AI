import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ALL_ITEMS } from '../../data/menuData'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'

const mdComponents = {
  p({ children }) {
    return <p style={{ marginBottom: 8, fontSize: 13, lineHeight: 1.7, color: '#111827' }}>{children}</p>
  },
  strong({ children }) {
    return <strong style={{ fontWeight: 600, color: '#007A36' }}>{children}</strong>
  },
  em({ children }) {
    return <em style={{ fontStyle: 'italic' }}>{children}</em>
  },
  ul({ children }) {
    return <ul style={{ marginLeft: 16, marginBottom: 8, listStyleType: 'disc', paddingLeft: 4 }}>{children}</ul>
  },
  ol({ children }) {
    return <ol style={{ marginLeft: 16, marginBottom: 8, listStyleType: 'decimal', paddingLeft: 4 }}>{children}</ol>
  },
  li({ children }) {
    return <li style={{ marginBottom: 4, fontSize: 13, lineHeight: 1.7 }}>{children}</li>
  },
  h1({ children }) {
    return <h1 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>{children}</h1>
  },
  h2({ children }) {
    return <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>{children}</h2>
  },
  h3({ children }) {
    return <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>{children}</h3>
  },
}

function getFoodEmoji(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('tuna')) return '🐟'
  if (n.includes('turkey')) return '🦃'
  if (n.includes('chicken') || n.includes('rotisserie')) return '🍗'
  if (n.includes('veggie') || n.includes('vegetarian') || n.includes('beyond')) return '🥗'
  if (n.includes('blt') || n.includes('bacon')) return '🥓'
  if (n.includes('steak') || n.includes('philly')) return '🥩'
  if (n.includes('meatball')) return '🍖'
  if (n.includes('pizza')) return '🍕'
  if (n.includes('seafood') || n.includes('shrimp')) return '🦐'
  if (n.includes('egg') || n.includes('breakfast')) return '🥚'
  if (n.includes('club')) return '🥪'
  if (n.includes('italian') || n.includes('spicy')) return '🌶️'
  return '🥖'
}

function findItem(name) {
  if (!name) return null
  const lower = name.toLowerCase().trim()
  return ALL_ITEMS.find(i => i.name.toLowerCase() === lower) || null
}

function parseBlocks(text) {
  if (!text) return [{ type: 'text', content: '' }]

  const lines = text.split('\n')
  const blocks = []
  let textBuffer = []

  function flushText() {
    const joined = textBuffer.join('\n').trim()
    if (joined) blocks.push({ type: 'text', content: joined })
    textBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trim()

    // ITEM: Turkey Breast | PRICE: $12.49 | CAL: 280cal
    const itemM = line.match(/^ITEM:\s*(.+?)\s*\|\s*PRICE:\s*\$?([\d.]+)\s*\|\s*CAL:\s*(\d+)/i)
    if (itemM) {
      flushText()
      blocks.push({ type: 'item', name: itemM[1].trim(), price: parseFloat(itemM[2]), calories: parseInt(itemM[3]) })
      continue
    }

    // SIZE_CHOICE: 6inch | Footlong
    const sizeM = line.match(/^SIZE_CHOICE:\s*(.+)/i)
    if (sizeM) {
      flushText()
      blocks.push({ type: 'size', options: sizeM[1].split('|').map(s => s.trim()) })
      continue
    }

    // TOPPING_CHOICE: ...
    const topM = line.match(/^TOPPING_CHOICE:\s*(.+)/i)
    if (topM) {
      flushText()
      blocks.push({ type: 'toppings', options: topM[1].split(',').map(s => s.trim()).filter(Boolean) })
      continue
    }

    // SAUCE_CHOICE: ...
    const sauceM = line.match(/^SAUCE_CHOICE:\s*(.+)/i)
    if (sauceM) {
      flushText()
      blocks.push({ type: 'sauces', options: sauceM[1].split(',').map(s => s.trim()).filter(Boolean) })
      continue
    }

    // YES_NO: question
    const ynM = line.match(/^YES_NO:\s*(.+)/i)
    if (ynM) {
      flushText()
      blocks.push({ type: 'yesno', question: ynM[1].trim() })
      continue
    }

    // PROMO: CODE — description
    const promoM = line.match(/^PROMO:\s*([A-Z0-9]+)\s*[—\-–]\s*(.+)/i)
    if (promoM) {
      flushText()
      blocks.push({ type: 'promo', code: promoM[1].toUpperCase(), desc: promoM[2].trim() })
      continue
    }

    textBuffer.push(raw)
  }

  flushText()

  // Group consecutive item blocks into a scrollable row
  const result = []
  let i = 0
  while (i < blocks.length) {
    if (blocks[i].type === 'item') {
      const items = []
      while (i < blocks.length && blocks[i].type === 'item') {
        items.push(blocks[i++])
      }
      result.push(items.length > 1 ? { type: 'items_row', items } : items[0])
    } else {
      result.push(blocks[i++])
    }
  }

  return result.length ? result : [{ type: 'text', content: text }]
}

/* ── Single item card ── */
function ItemCard({ name, price, calories, compact = false, onChoose }) {
  const item = findItem(name)
  const { addItem } = useCart()
  const { showToast } = useToast()

  function handleAdd() {
    addItem({
      menuItemId: item?.id || name.replace(/\s+/g, '-').toLowerCase(),
      name,
      category: item?.category || 'Footlongs',
      customizations: { bread: '9-Grain Wheat', size: 'Footlong', cheese: 'American', veggies: [], sauces: [], toasted: false },
      quantity: 1,
      unitPrice: price,
    })
    showToast(`${name} added to cart!`)
  }

  const emoji = getFoodEmoji(name)

  return (
    <div className={`bg-white border border-gray-200 overflow-hidden shadow-sm flex-shrink-0 ${compact ? 'w-44' : 'w-full'}`}
      style={{ borderRadius: 12, scrollSnapAlign: compact ? 'start' : undefined }}>
      {item?.image && (
        <img src={item.image} alt={name} loading="lazy"
          className={`w-full object-cover ${compact ? 'h-28' : 'h-32'}`} />
      )}
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm leading-tight">{emoji} {name}</p>
        <div className="flex items-center gap-2 mt-1 mb-2.5">
          <span className="text-[#009A44] font-bold text-sm">${price.toFixed(2)}</span>
          <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-medium">{calories} cal</span>
        </div>
        <button
          onClick={onChoose || handleAdd}
          className="w-full bg-[#009A44] text-white text-xs font-bold py-1.5 rounded-full hover:bg-[#007A36] active:scale-95 transition-all">
          {onChoose ? 'Choose This' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

/* ── Size pill buttons ── */
function SizeButtons({ options, onSelect }) {
  const price = (opt) => opt.toLowerCase().includes('6') ? 7.49 : 12.49
  const label = (opt) => opt.toLowerCase().includes('6') ? '6-inch' : 'Footlong'
  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button key={opt}
          onClick={() => onSelect?.(`${label(opt)} please`)}
          className="flex-1 border-2 border-[#009A44] text-[#009A44] font-bold py-3 px-4 rounded-2xl hover:bg-[#009A44] hover:text-white active:scale-95 transition-all text-center">
          <span className="block text-base font-black">{label(opt)}</span>
          <span className="block text-xs opacity-75">${price(opt).toFixed(2)}</span>
        </button>
      ))}
    </div>
  )
}

/* ── Multi-select chip grid ── */
function ChipGrid({ options, onConfirm, label }) {
  const [selected, setSelected] = useState([])

  function toggle(opt) {
    setSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt])
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)}
            className={`text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all active:scale-95 ${
              selected.includes(opt)
                ? 'bg-[#009A44] border-[#009A44] text-white'
                : 'border-gray-300 text-gray-700 hover:border-[#009A44]'
            }`}>
            {selected.includes(opt) && '✓ '}{opt}
          </button>
        ))}
      </div>
      <button onClick={() => onConfirm?.(selected.length ? selected.join(', ') : 'None')}
        className="self-start bg-[#009A44] text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-[#007A36] active:scale-95 transition-all">
        Confirm {label}
      </button>
    </div>
  )
}

/* ── Yes / No buttons ── */
function YesNoButtons({ question, onSelect }) {
  return (
    <div className="flex flex-col gap-2.5">
      {question && <p className="text-sm text-gray-700 font-medium">{question}</p>}
      <div className="flex gap-2">
        <button onClick={() => onSelect?.('Yes')}
          className="flex-1 bg-[#009A44] text-white font-bold py-2.5 rounded-full hover:bg-[#007A36] active:scale-95 transition-all text-sm">
          Yes
        </button>
        <button onClick={() => onSelect?.('No')}
          className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-2.5 rounded-full hover:border-[#009A44] hover:text-[#009A44] active:scale-95 transition-all text-sm">
          No
        </button>
      </div>
    </div>
  )
}

/* ── Copyable promo pill ── */
function PromoChip({ code, desc }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all active:scale-95 text-sm ${
        copied ? 'bg-[#009A44] text-white' : 'bg-[#FFCC00] text-[#7A5C00] hover:bg-[#f5c100]'
      }`}>
      <span className="font-black">{code}</span>
      <span className="text-xs opacity-75">— {desc}</span>
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {copied
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        }
      </svg>
      {copied && <span className="font-semibold">Copied!</span>}
    </button>
  )
}

export default function MessageRenderer({ content, onReply, isUser }) {
  if (isUser) {
    return <p className="text-sm" style={{ lineHeight: 1.6 }}>{content}</p>
  }

  const blocks = parseBlocks(content)

  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return (
              <div key={i}>
                <ReactMarkdown components={mdComponents}>{block.content}</ReactMarkdown>
              </div>
            )

          case 'item':
            return <ItemCard key={i} name={block.name} price={block.price} calories={block.calories} />

          case 'items_row':
            return (
              <div key={i} className="flex gap-3 overflow-x-auto pb-1" style={{ scrollSnapType: 'x mandatory' }}>
                {block.items.map((item, j) => (
                  <ItemCard key={j} name={item.name} price={item.price} calories={item.calories}
                    compact onChoose={() => onReply?.(`I'd like the ${item.name}`)} />
                ))}
              </div>
            )

          case 'size':
            return <SizeButtons key={i} options={block.options} onSelect={onReply} />

          case 'toppings':
            return <ChipGrid key={i} options={block.options} label="Toppings"
              onConfirm={(v) => onReply?.(`Toppings: ${v}`)} />

          case 'sauces':
            return <ChipGrid key={i} options={block.options} label="Sauces"
              onConfirm={(v) => onReply?.(`Sauces: ${v}`)} />

          case 'yesno':
            return <YesNoButtons key={i} question={block.question} onSelect={onReply} />

          case 'promo':
            return <PromoChip key={i} code={block.code} desc={block.desc} />

          default:
            return null
        }
      })}
    </div>
  )
}
