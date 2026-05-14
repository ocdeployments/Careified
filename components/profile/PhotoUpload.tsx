'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X } from 'lucide-react'

interface PhotoUploadProps {
  currentPhotoUrl: string | null
  caregiverId: string
  onUploadComplete: (photoUrl: string) => void
  onRemove: () => void
}

export default function PhotoUpload({
  currentPhotoUrl,
  onUploadComplete,
  onRemove
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (file: File) => {
    setError(null)

    // Client-side validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    // Instant local preview
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const res = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (!res.ok) {
        setPreview(null)
        setError(data.error || 'Upload failed')
        return
      }

      // Replace local preview with permanent URL
      URL.revokeObjectURL(localUrl)
      setPreview(null)
      onUploadComplete(data.photo_url)

    } catch {
      setPreview(null)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleRemove = async () => {
    try {
      await fetch('/api/profile/upload-photo', {
        method: 'DELETE'
      })
      onRemove()
    } catch {
      onRemove()
    }
  }

  // Auto-clear error after 5 seconds
  if (error) {
    setTimeout(() => setError(null), 5000)
  }

  const displayUrl = preview || currentPhotoUrl

  return (
    <div style={{ width: '100%' }}>
      {/* PHOTO PREVIEW AREA */}
      {displayUrl && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #C9973A',
              position: 'relative',
            }}
          >
            <img
              src={displayUrl}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              color: 'white',
              border: '2px solid white',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              lineHeight: 1,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* UPLOAD ZONE - show if no photo */}
      {!displayUrl && !uploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#C9973A' : '#D1D5DB'}`,
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#F9FAFB',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
        >
          <Camera
            size={32}
            color="#9CA3AF"
            style={{ marginBottom: '8px' }}
          />
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
            Upload your photo
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
            JPG, PNG or WebP — max 5MB
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
            or drag and drop
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* UPLOADING STATE */}
      {uploading && (
        <div
          style={{
            border: '2px dashed #D1D5DB',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid #E5E7EB',
              borderTopColor: '#C9973A',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 8px',
            }}
          />
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Uploading...</div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '8px' }}>
          {error}
        </div>
      )}
    </div>
  )
}