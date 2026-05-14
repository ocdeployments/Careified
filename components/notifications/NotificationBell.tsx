'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export default function NotificationBell() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Only show for caregiver role
  const role = user?.publicMetadata?.role as string | undefined
  if (role !== 'caregiver') {
    return null
  }

  useEffect(() => {
    if (!isLoaded || !user) return

    async function fetchCount() {
      try {
        const res = await fetch('/api/notifications/count')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unread_count || 0)
        }
      } catch {
        // Silent fail - never crash navbar
      } finally {
        setIsLoading(false)
      }
    }

    fetchCount()

    // Poll every 60 seconds
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [user, isLoaded])

  const handleClick = () => {
    router.push('/caregiver/notifications')
  }

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '8px',
      }}
      title="Notifications"
    >
      <Bell size={20} color="#0D1B3E" />
      {!isLoading && unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            backgroundColor: '#DC2626',
            color: 'white',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: 700,
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}
        >
          {displayCount}
        </span>
      )}
    </div>
  )
}