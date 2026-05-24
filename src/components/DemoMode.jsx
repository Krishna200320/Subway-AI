import { useDemo } from '../context/DemoContext'

export default function DemoMode() {
  const { demoMode, activeBadge, BADGE_TYPES, setDemoMode } = useDemo()

  if (!demoMode) return null

  const badge = activeBadge ? BADGE_TYPES[activeBadge] : null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
      {/* Demo mode label */}
      <div className="pointer-events-auto flex items-center gap-2 bg-gray-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        DEMO MODE — SubAI
        <button
          onClick={() => setDemoMode(false)}
          className="ml-1 text-white/60 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Feature badge */}
      {badge && (
        <div
          key={activeBadge}
          className={`${badge.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}
          style={{ animation: 'demoBadgeIn 0.25s ease, demoBadgeFade 0.4s ease 2.6s forwards' }}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {badge.label}
        </div>
      )}

      {/* Keyboard hint */}
      <div className="text-gray-400/70 text-[10px] mt-1">Press D to exit</div>
    </div>
  )
}
