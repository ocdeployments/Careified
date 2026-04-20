import Link from 'next/link'
import { Search, UserCheck, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="font-sans">

      {/* ── Hero (dark navy) ── */}
      <section className="relative bg-navy pt-32 pb-20 px-4 md:px-6 overflow-hidden">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,151,58,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,151,58,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/10 text-[11px] font-semibold tracking-[0.08em] uppercase text-gold mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
            Caregiving&apos;s trust layer
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-6xl font-normal text-white tracking-tight leading-[1.0] mb-2">
            Verified reputations.
          </h1>
          <h1 className="font-serif text-5xl md:text-6xl font-normal text-gold italic tracking-tight leading-[1.0] mb-6">
            Built on real work.
          </h1>

          {/* Subtext */}
          <p className="text-[15px] text-white/75 leading-[1.7] max-w-[480px] mx-auto mb-12 font-light">
            The platform where caregivers earn credibility and agencies hire with confidence.
          </p>

          {/* Hero CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/agency/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-navy text-sm font-semibold hover:bg-white/90 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              Start hiring →
            </Link>
            <Link
              href="/sign-up?role=caregiver"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-white text-white text-sm font-semibold hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              Build free profile →
            </Link>
            <Link
              href="/for-families"
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-gold text-sm font-semibold hover:text-gold-warm transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              Learn more →
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[700px] mx-auto text-left">
            {/* Agencies */}
            <div className="relative p-5 rounded-[14px] bg-white/8 border border-white/15 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-800 to-blue-500" />
              <div className="text-[13px] font-semibold text-white mb-1">For Agencies</div>
              <div className="text-[11px] text-white/60 leading-[1.5]">Search verified profiles. AI-powered matching.</div>
            </div>

            {/* Caregivers */}
            <div className="relative p-5 rounded-[14px] bg-white/8 border border-white/15 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold to-gold-warm" />
              <div className="text-[13px] font-semibold text-white mb-1">For Caregivers</div>
              <div className="text-[11px] text-white/60 leading-[1.5]">Free. Always. Build your portable professional identity.</div>
            </div>

            {/* Families */}
            <div className="relative p-5 rounded-[14px] bg-white/8 border border-white/15 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-700 to-amber-500" />
              <div className="text-[13px] font-semibold text-white mb-1">For Families</div>
              <div className="text-[11px] text-white/60 leading-[1.5]">Know who is caring for your loved ones.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats (very dark) ── */}
      <section className="bg-[#080F1E] px-4 md:px-6 py-5" aria-label="Industry statistics">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { n: '75%',    l: 'Annual turnover',   s: '2025' },
            { n: '4 in 5', l: 'Leave in 100 days', s: '2024' },
            { n: '9.7M',   l: 'Jobs by 2034',      s: 'PHI'  },
            { n: '15+',    l: 'Live in TX',         s: 'Now'  },
          ].map(stat => (
            <div key={stat.n} className="p-3">
              <div className="font-serif text-[22px] text-white">{stat.n}</div>
              <div className="text-[11px] text-slate-300 mt-1 leading-tight">{stat.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works (cream) ── */}
      <section className="bg-cream px-4 md:px-6 py-20" aria-label="How Careified works">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-[38px] text-navy leading-tight mb-10">
            A reputation system<br />caregiving has never had
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <UserCheck size={24} className="text-navy" />,
                num: '01',
                title: 'Build your profile',
                desc: '7 steps. Your complete professional record — credentials, experience, references.',
              },
              {
                icon: <Search size={24} className="text-navy" />,
                num: '02',
                title: 'Get placed',
                desc: 'Agencies search by match score, availability, and specialization.',
              },
              {
                icon: <Shield size={24} className="text-navy" />,
                num: '03',
                title: 'Earn your score',
                desc: 'Verified badges and ratings no one can take away.',
              },
            ].map(step => (
              <div key={step.num} className="bg-white rounded-2xl p-7 shadow-sm">
                <div className="font-serif text-[44px] font-bold leading-none text-gold mb-3 select-none">{step.num}</div>
                <div className="mb-3">{step.icon}</div>
                <div className="text-[15px] font-semibold text-navy mb-2">{step.title}</div>
                <div className="text-[13px] text-slate-500 leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (dark gradient) ── */}
      <section
        className="px-4 md:px-6 py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 100%)' }}
        aria-label="Call to action"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-[44px] font-bold text-white tracking-tight leading-tight mb-3">
            The information problem<br />in caregiving ends here
          </h2>
          <p className="text-sm text-white/80 mb-9 leading-relaxed">
            75% annual turnover. Every hire starts blind. Not anymore.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/agency/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-br from-gold to-gold-warm text-navy text-sm font-bold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              I&apos;m an agency
            </Link>
            <Link
              href="/sign-up?role=caregiver"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 border border-white/30 text-white text-sm font-medium hover:bg-white/20 transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              I&apos;m a caregiver — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#080F1E] px-4 md:px-6 pt-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-[6px] bg-gradient-to-br from-gold to-gold-warm flex items-center justify-center">
              <span className="font-extrabold text-navy text-xs">C</span>
            </div>
            <span className="text-[13px] font-semibold text-white">Careified</span>
          </div>
          <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mb-8">
            Verified reputations for the caregiving profession. Texas-first.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            {[
              { href: '/for-agencies',   label: 'Agencies'   },
              { href: '/for-caregivers', label: 'Caregivers' },
              { href: '/for-families',   label: 'Families'   },
              { href: '/about',          label: 'About'      },
              { href: '/privacy',        label: 'Privacy'    },
              { href: '/terms',          label: 'Terms'      },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
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
