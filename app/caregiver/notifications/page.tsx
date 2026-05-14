'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, useAuth } from '@clerk/nextjs'
import { Bell, Eye, Bookmark, Star, TrendingUp, CheckCircle, X } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  action_url: string | null
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'profile_viewed':
      return <Eye size={18} color="#C9973A" />
    case 'shortlisted':
      return <Bookmark size={18} color="#C9973A" />
    case 'badge_earned':
      return <Star size={18} color="#C9973A" />
    case 'profile_nudge':
      return <TrendingUp size={18} color="#C9973A" />
    case 'reference_completed':
      return <CheckCircle size={18} color="#C9973A" />
    default:
      return <Bell size={18} color="#C9973A" />
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function NotificationsPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (!isLoaded || !userId) return

    async function fetchNotifications() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/notifications?limit=50')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unread_count || 0)
        } else {
          setError('Failed to load notifications')
        }
      } catch {
        setError('Failed to load notifications')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [userId, isLoaded])

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch {
      // Silent fail
    }
  }

  const handleRowClick = async (notification: Notification) => {
    if (!notification.read_at) {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_ids: [notification.id] }),
        })
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch {
        // Continue anyway
      }
    }

    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  if (!isLoaded || !userId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: '#6B7280' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '28px',
            color: '#0D1B3E',
            margin: 0,
          }}
        >
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#C9973A',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#DC2626',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: '72px',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px',
                animation: 'pulse 2s infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && notifications.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6B7280',
          }}
        >
          <Bell size={40} color="#D1D5DB" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', fontWeight: 500 }}>No notifications yet.</div>
          <div style={{ fontSize: '13px', marginTop: '8px' }}>
            You&apos;ll see activity here when agencies view or shortlist your profile.
          </div>
        </div>
      )}

      {/* Notification list */}
      {!isLoading && notifications.length > 0 && (
        <div style={{ border: '1px solid #F0F0F0', borderRadius: '12px', overflow: 'hidden' }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleRowClick(notification)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '16px 20px',
                borderBottom: '1px solid #F0F0F0',
                cursor: 'pointer',
                backgroundColor: notification.read_at ? 'white' : '#FDFBF7',
                borderLeft: notification.read_at
                  ? '3px solid transparent'
                  : '3px solid #C9973A',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#F9F7F4'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = notification.read_at ? 'white' : '#FDFBF7'
              }}
            >
              {/* Icon */}
              <div style={{ marginRight: '16px', marginTop: '2px' }}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: notification.read_at ? '#6B7280' : '#0D1B3E',
                    marginBottom: '4px',
                  }}
                >
                  {notification.title}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    marginBottom: '4px',
                  }}
                >
                  {notification.message}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                  }}
                >
                  {formatRelativeTime(notification.created_at)}
                </div>
              </div>

              {/* Unread dot */}
              {!notification.read_at && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#C9973A',
                    marginTop: '6px',
                    marginLeft: '8px',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}