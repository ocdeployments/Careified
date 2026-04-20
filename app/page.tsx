import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          /* dynamic: radial gradient cannot be expressed as a Tailwind class */
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,151,58,0.12) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
            Texas-first · Verified caregiver profiles
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-tight mb-6">
            The verified reputation layer<br className="hidden md:block" /> for caregiving
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg text-white/75 leading-relaxed max-w-xl mx-auto mb-10 font-light">
            Agencies find matched, verified caregivers in minutes. Caregivers build a portable professional identity — free, forever.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/agency/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-br from-gold to-gold-warm text-navy text-sm font-bold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              I&apos;m an agency — find caregivers
            </Link>
            <Link
              href="/sign-up?role=caregiver"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 border border-white/12 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              I&apos;m a caregiver — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="px-4 md:px-6 pb-16" aria-label="Key features">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '🔍',
              title: 'AI-powered matching',
              desc: 'Search verified profiles.',
              href: '/for-agencies',
            },
            {
              icon: '🆓',
              title: 'Free for caregivers',
              desc: 'Free. Always. Build once.',
              href: '/for-caregivers',
            },
            {
              icon: '✅',
              title: 'Verified identities',
              desc: 'Know who is caring.',
              href: '/about',
            },
          ].map(card => (
            <Link
              key={card.title}
              href={card.href}
              className="group block p-5 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/8 hover:border-white/15 transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <div className="text-2xl mb-3" aria-hidden="true">{card.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{card.title}</div>
              <div className="text-xs text-white/65 leading-relaxed">{card.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-4 md:px-6 pb-16" aria-label="Industry statistics">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white/4 border border-white/8">
            {[
              { n: '75%', l: 'Annual turnover', s: '2025' },
              { n: '4 in 5', l: 'Leave in 100 days', s: '2024' },
              { n: '9.7M', l: 'Jobs by 2034', s: 'PHI' },
              { n: '15+', l: 'Live in TX', s: 'Now' },
            ].map(stat => (
              <div key={stat.n} className="text-center p-3">
                <div className="font-serif text-2xl md:text-3xl text-white mb-1">{stat.n}</div>
                <div className="text-[11px] text-white/65 leading-tight">{stat.l}</div>
                <div className="text-[10px] text-white/35 mt-0.5">{stat.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="px-4 md:px-6 pb-20" aria-label="Call to action">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-white tracking-tight mb-4">
            Ready to fix caregiver hiring?
          </h2>
          <p className="text-sm text-white/70 mb-9 leading-relaxed">
            75% annual turnover. Every hire starts blind. Not anymore.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/agency/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-br from-gold to-gold-warm text-navy text-sm font-bold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              Get started — it&apos;s free
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-serif text-lg text-white">Careified</span>
            <p className="text-xs text-white/55 mt-1 max-w-[200px] leading-relaxed">
              Verified reputations for the caregiving profession. Texas-first.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2" aria-label="Footer navigation">
            {[
              { href: '/for-agencies', label: 'Agencies' },
              { href: '/for-caregivers', label: 'Caregivers' },
              { href: '/for-families', label: 'Families' },
              { href: '/about', label: 'About' },
              { href: '/privacy', label: 'Privacy' },
              { href: '/terms', label: 'Terms' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/50 hover:text-white/80 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
