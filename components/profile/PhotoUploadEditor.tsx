'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

interface PhotoUploadEditorProps {
  isOpen: boolean
  imageUrl: string
  initialX?: number
  initialY?: number
  initialScale?: number
  onSave: (data: { url: string; x: number; y: number; scale: number }) => void
  onCancel: () => void
}

const CROP_SIZE = 280

export default function PhotoUploadEditor({
  isOpen,
  imageUrl,
  initialX = 0,
  initialY = 0,
  initialScale = 1,
  onSave,
  onCancel,
}: PhotoUploadEditorProps) {
  const [zoom, setZoom] = useState(initialScale)
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Reset state when modal opens with new image
  useEffect(() => {
    if (isOpen) {
      setZoom(initialScale)
      setPosition({ x: initialX, y: initialY })
      setImageLoaded(false)
    }
  }, [isOpen, initialX, initialY, initialScale])

  // Load image natural size
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      })
      setImageLoaded(true)
    }
  }, [])

  // Calculate constraints
  const imgDisplaySize = CROP_SIZE * zoom
  const maxOffset = Math.max(0, (imgDisplaySize - CROP_SIZE) / 2)

  const clampX = (x: number) => Math.max(-maxOffset, Math.min(maxOffset, x))
  const clampY = (y: number) => Math.max(-maxOffset, Math.min(maxOffset, y))

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX - position.x, y: clientY - position.y })
  }

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const newX = clampX(clientX - dragStart.x)
    const newY = clampY(clientY - dragStart.y)

    setPosition({ x: newX, y: newY })
  }, [isDragging, dragStart, maxOffset])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove)
      window.addEventListener('touchend', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 32,
        maxWidth: 400,
        width: '90%',
      }}>
        <h2 style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 24,
          color: '#0D1B3E',
          margin: '0 0 24px',
          textAlign: 'center',
        }}>
          Position Your Photo
        </h2>

        {/* Crop Circle */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          style={{
            width: CROP_SIZE,
            height: CROP_SIZE,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #C9973A',
            margin: '0 auto 24px',
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'relative',
            background: '#F7F4F0',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Profile photo"
            onLoad={handleImageLoad}
            style={{
              position: 'absolute',
              width: imgDisplaySize,
              height: imgDisplaySize,
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
              objectFit: 'cover',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Zoom Slider */}
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: '#0D1B3E',
            marginBottom: 8,
          }}>
            Zoom: {zoom.toFixed(2)}x
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              appearance: 'none',
              background: `linear-gradient(to right, #C9973A 0%, #C9973A ${((zoom - 1) / 2) * 100}%, #E2E8F0 ${((zoom - 1) / 2) * 100}%, #E2E8F0 100%)`,
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: 'transparent',
              color: '#64748B',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ url: imageUrl, x: position.x, y: position.y, scale: zoom })}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  )
}