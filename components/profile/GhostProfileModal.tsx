'use client'

interface Props {
  onDismiss: () => void
}

const VALUE_PROPS = [
  { emoji: '📁', title: 'You Own It', desc: 'Not trapped in agency computers. Take it anywhere.' },
  { emoji: '👀', title: 'Be Seen', desc: 'Hundreds of agencies searching. Multiple opportunities.' },
  { emoji: '⭐', title: 'Get Recognized', desc: 'Prove your reliability. No more starting from scratch.' },
  { emoji: '💰', title: 'Better Matches', desc: 'Specialized skills = better pay. Work you actually want.' },
]

export default function GhostProfileModal({ onDismiss }: Props) {
  return (
    <div
      className="fixed inset-0 bg-navy/95 flex items-center justify-center z-[9999] p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ghost-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-[600px] w-full p-8 md:p-10 relative">

        {/* Close button */}
        <button
          onClick={onDismiss}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl leading-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📋</div>
          <h2 id="ghost-modal-title" className="text-[28px] font-extrabold text-navy mb-3 tracking-tight">
            Own Your Professional Story
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            For the first time, your experience belongs to you—not locked in someone else&apos;s files
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {VALUE_PROPS.map(({ emoji, title, desc }) => (
            <div key={title} className="p-5 bg-slate-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">{emoji}</div>
              <h3 className="text-sm font-bold text-navy mb-1">{title}</h3>
              <p className="text-xs text-slate-500 leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mb-6">
          <button
            onClick={onDismiss}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-br from-gold to-gold-warm text-navy text-base font-bold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            Build My Profile →
          </button>
          <p className="text-[13px] text-slate-400 mt-3">
            Takes 15 minutes. Lasts your entire career.
          </p>
        </div>

        {/* Preview sample */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
          <p className="text-xs text-slate-400 mb-3 text-center">⬇️ Example: What agencies see</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-warm flex items-center justify-center text-lg font-black text-navy flex-shrink-0">
              MS
            </div>
            <div>
              <div className="text-sm font-bold text-navy">Maria Santos</div>
              <div className="text-xs text-slate-500">Certified Personal Support Worker</div>
              <div className="text-[11px] text-slate-400 mt-1">📍 McKinney, TX · 📅 8 years · 🟢 Available now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
