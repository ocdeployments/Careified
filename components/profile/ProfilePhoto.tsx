'use client'
import { Camera } from 'lucide-react'

interface ProfilePhotoProps {
  url: string
  x: number
  y: number
  scale: number
  size?: number
  initials?: string
  showEditOverlay?: boolean
  onEditClick?: () => void
}

export default function ProfilePhoto({
  url,
  x,
  y,
  scale,
  size = 96,
  initials,
  showEditOverlay = false,
  onEditClick,
}: ProfilePhotoProps) {
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    border: '3px solid #C9973A',
    flexShrink: 0,
    background: '#F7F4F0',
  }

  // If no URL, show initials fallback
  if (!url) {
    return (
      <div style={{
        ...containerStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1B3E',
      }}>
        <span style={{
          fontSize: size * 0.36,
          fontWeight: 600,
          color: '#E8B86D',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {initials || '?'}
        </span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={containerStyle}>
        <img
          src={url}
          alt="Profile photo"
          style={{
            position: 'absolute',
            width: `${size * scale}px`,
            height: `${size * scale}px`,
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            objectFit: 'cover',
            userSelect: 'none',
            pointerEvents: 'none',
            
          }}
        />
      </div>

      {/* Edit overlay on hover */}
      {showEditOverlay && (
        <div
          onClick={onEditClick}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'rgba(13, 27, 62, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
        >
          <Camera size={size * 0.25} color="#E8B86D" />
          <span style={{
            fontSize: size * 0.1,
            color: '#F7F4F0',
            fontWeight: 600,
            marginTop: 4,
          }}>
            Reposition
          </span>
        </div>
      )}
    </div>
  )
}