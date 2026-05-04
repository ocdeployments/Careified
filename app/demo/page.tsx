import Link from 'next/link'
import { Search, Users, Briefcase, MessageSquare, ArrowRight, CheckCircle, Shield, Zap } from 'lucide-react'

const FEATURES = [
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find caregivers with 20+ filters. AI understands natural language like "experienced with dementia in Toronto"',
  },
  {
    icon: Users,
    title: 'Verified Profiles',
    description: 'Every caregiver is verified. Credentials, references, and background checks — all in one place.',
  },
  {
    icon: Briefcase,
    title: 'Client Management',
    description: 'Track clients, match with caregivers, and manage placements — all from one dashboard.',
  },
  {
    icon: MessageSquare,
    title: 'AI Recruiting',
    description: 'Let AI call candidates for you. Screen, schedule, and convert — on autopilot.',
  },
]

const STATS = [
  { value: '15', label: 'Demo Caregivers' },
  { value: '5', label: 'Demo Clients' },
  { value: '98%', label: 'Match Accuracy' },
]

export default function DemoPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#0D1B3E',
          fontFamily: 'DM Serif Display, serif',
          marginBottom: '16px',
        }}>
          Try Careified — No Sign-Up Required
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#64748B',
          maxWidth: '600px',
          margin: '0 auto 24px',
          lineHeight: '1.6',
        }}>
          Explore the platform with demo data. See how agencies find, vet, and hire verified caregivers — no commitment needed.
        </p>
        <Link
          href="/demo/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#C9973A',
            color: '#0D1B3E',
            padding: '14px 28px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            textDecoration: 'none',
          }}
        >
          Enter Demo Dashboard
          <ArrowRight size={20} />
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '48px',
        marginBottom: '48px',
        padding: '24px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
      }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#C9973A', fontFamily: 'DM Serif Display, serif' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#0D1B3E',
        fontFamily: 'DM Serif Display, serif',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        What You Can Explore
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '48px',
      }}>
        {FEATURES.map(feature => {
          const Icon = feature.icon
          return (
            <div key={feature.title} style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FDF6EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon size={24} color="#C9973A" />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0D1B3E',
                marginBottom: '8px',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748B',
                lineHeight: '1.6',
              }}>
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Value props */}
      <div style={{
        backgroundColor: '#0D1B3E',
        borderRadius: '16px',
        padding: '32px',
        color: '#fff',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <CheckCircle size={24} color="#C9973A" />
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>No Credit Card</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Try everything free, no commitment</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Shield size={24} color="#C9973A" />
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Real Data</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Same caregivers you&apos;ll see in production</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Zap size={24} color="#C9973A" />
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Full Access</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Try every feature — search, clients, AI</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        textAlign: 'center',
        marginTop: '48px',
        padding: '32px',
        backgroundColor: '#FDF6EC',
        borderRadius: '16px',
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#0D1B3E',
          fontFamily: 'DM Serif Display, serif',
          marginBottom: '12px',
        }}>
          Ready to get started?
        </h3>
        <p style={{ color: '#64748B', marginBottom: '20px' }}>
          Create your agency account and start hiring today.
        </p>
        <Link
          href="/sign-up?role=agency"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#C9973A',
            color: '#0D1B3E',
            padding: '14px 28px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            textDecoration: 'none',
          }}
        >
          Start Free 30-Day Trial
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  )
}