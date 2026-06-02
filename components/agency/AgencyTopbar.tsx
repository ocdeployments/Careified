'use client'

import { Bell } from 'lucide-react'

interface AgencyTopbarProps {
  agencyName?: string
  unreadCount?: number
}

export default function AgencyTopbar({ agencyName, unreadCount }: AgencyTopbarProps) {
  const getInitials = (name: string) => {
    if (!name) return 'AG'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      background: '#0D1728',
      borderBottom: '0.5px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 200,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Left: Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>Care</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#C9973A' }}>ified</span>
      </div>

      {/* Right: Notifications + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notification bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="rgba(255,255,255,0.6)" />
          {unreadCount && unreadCount > 0 && (
            <div style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              background: '#E24B4A',
              borderRadius: '50%',
            }} />
          )}
        </div>

        {/* Avatar */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#0D1728',
        }}>
          {getInitials(agencyName || 'Agency')}
        </div>
      </div>
    </div>
  )
}