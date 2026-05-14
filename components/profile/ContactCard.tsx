'use client'

import { Phone, Mail, MessageCircle } from 'lucide-react'

interface ContactCardProps {
  phone?: string | null
  email?: string | null
}

const C = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  goldLight: '#E8B86D',
  white: '#FFFFFF',
  bgSubtle: '#F7F4F0',
  borderSoft: '#E2E8F0',
  fg1: '#0D1B3E',
  fg4: '#64748B',
  fg5: '#94A3B8',
}

export default function ContactCard({ phone, email }: ContactCardProps) {
  if (!phone && !email) return null

  const whatsappLink = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : null

  return (
    <div style={{
      background: C.white,
      borderRadius: 16,
      border: `1px solid ${C.borderSoft}`,
      padding: 20,
      marginTop: 24,
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: C.navy,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        Contact
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {phone && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            background: C.bgSubtle,
            borderRadius: 10,
            border: `1px solid ${C.borderSoft}`,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(201,151,58,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Phone size={18} color={C.gold} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.fg5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.fg1 }}>{phone}</div>
            </div>
          </div>
        )}

        {email && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            background: C.bgSubtle,
            borderRadius: 10,
            border: `1px solid ${C.borderSoft}`,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(201,151,58,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mail size={18} color={C.gold} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.fg5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.fg1 }}>{email}</div>
            </div>
          </div>
        )}

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: '#25D366',
              borderRadius: 10,
              textDecoration: 'none',
              color: C.white,
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageCircle size={18} color={C.white} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>WhatsApp</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Send a message</div>
            </div>
          </a>
        )}
      </div>

      <button
        style={{
          width: '100%',
          marginTop: 16,
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
          color: C.navy,
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
        disabled
        title="Coming soon"
      >
        Request Introduction
      </button>
    </div>
  )
}