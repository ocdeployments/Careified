'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { MessageCircle, Copy, Check } from 'lucide-react'

interface LiveBannerProps {
  firstName?: string
  userId?: string
}

export default function LiveBanner({ firstName, userId: propUserId }: LiveBannerProps) {
  const { user } = useUser()
  const userId = propUserId || user?.id
  const [copied, setCopied] = useState(false)
  const shareUrl = userId
    ? `https://careified.ca/for-caregivers?ref=${userId}`
    : 'https://careified.ca/for-caregivers'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: '#F0FDF4',
      border: '1px solid #16A34A',
      borderRadius: '8px',
      padding: '20px 24px',
      marginBottom: '24px',
    }}>
      <div style={{
        fontSize: '15px',
        fontWeight: 600,
        color: '#15803D',
        marginBottom: '12px',
      }}>
        You are live. Agencies can now find you in search.
      </div>
      <div style={{
        fontSize: '14px',
        color: '#64748B',
        marginBottom: '16px',
      }}>
        Know another PSW or caregiver looking for work? Share Careified with them.
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <a
          href={`https://wa.me/?text=I just built my professional profile on Careified — agencies can find and verify me now. You should get on it: ${userId ? `https://careified.ca/for-caregivers?ref=${userId}` : 'https://careified.ca/for-caregivers'}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#16A34A',
            color: 'white',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#0D1B3E',
            color: 'white',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}