const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.18 23.76c.37.2.79.24 1.17.12l12.46-7.19-2.68-2.68-10.95 9.75zM.36 1.7C.14 2.07 0 2.53 0 3.09v17.82c0 .56.14 1.02.36 1.39l.08.07 9.98-9.98v-.24L.44 1.63l-.08.07zM23.36 10.49l-2.67-1.54-3 2.67 3 2.66 2.69-1.56c.76-.44.76-1.79-.02-2.23zM4.35.12C3.97 0 3.55.04 3.18.24L14.29 11.35l-2.68-2.67L4.35.12z"/>
  </svg>
)

export default function RewardsBanner() {
  return (
    <section className="bg-[#009A44] py-14 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 text-white">
        {/* Left text */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
            <span className="bg-[#FFCC00] text-[#007A36] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              MVP Rewards
            </span>
          </div>
          <h2 className="font-black text-3xl sm:text-4xl leading-tight">
            Join Subway MVP Rewards
          </h2>
          <p className="text-white/80 mt-2 text-lg max-w-md">
            Earn points on every order. Redeem for free subs, sides, and more.
          </p>
          <ul className="mt-4 space-y-1 text-white/70 text-sm">
            <li>✓ &nbsp;200 points = free 6-inch sub</li>
            <li>✓ &nbsp;Exclusive member-only deals</li>
            <li>✓ &nbsp;Birthday rewards every year</li>
          </ul>
        </div>

        {/* Right CTAs */}
        <div className="flex flex-col items-center gap-4">
          <button className="bg-white text-[#009A44] font-bold px-10 py-3 rounded-full text-lg hover:bg-[#FFCC00] hover:text-[#007A36] transition-all duration-200 shadow-lg hover:-translate-y-0.5">
            Join Now — It's Free
          </button>
          <p className="text-white/60 text-xs">Download the app to start earning today</p>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white/10 border border-white/30 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              <AppleIcon />
              App Store
            </button>
            <button className="flex items-center gap-2 bg-white/10 border border-white/30 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              <GoogleIcon />
              Google Play
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
