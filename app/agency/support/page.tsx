'use client'

import { useState } from 'react'
import { Mail, MessageCircle, Phone, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

export default function AgencySupportPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setSubmitting(true)
    // Placeholder - would POST to /api/support
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Message sent! We will respond within 24 hours.')
    setSubject('')
    setMessage('')
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S, padding: '32px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link href="/agency/billing" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to billing
        </Link>

        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, margin: '0 0 8px' }}>
          Contact Support
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 32px' }}>
          Questions about billing, modules, or your account? We're here to help.
        </p>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>
                Subject
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: N, outline: 'none', background: 'white' }}
              >
                <option value="">Select a topic...</option>
                <option value="billing">Billing question</option>
                <option value="modules">Module upgrade</option>
                <option value="account">Account access</option>
                <option value="technical">Technical issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your question or issue..."
                rows={5}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: N, outline: 'none', fontFamily: S, resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', padding: '14px 24px', borderRadius: 10, border: 'none', background: submitting ? '#E2E8F0' : `linear-gradient(135deg, ${G}, #E8B86D)`, color: submitting ? '#94A3B8' : N, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: S }}
            >
              {submitting ? 'Sending...' : 'Send message'}
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: N, marginBottom: 16 }}>Other ways to reach us</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={18} color="#64748B" />
                <span style={{ fontSize: 14, color: '#64748B' }}>support@careified.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Clock size={18} color="#64748B" />
                <span style={{ fontSize: 14, color: '#64748B' }}>Response within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}