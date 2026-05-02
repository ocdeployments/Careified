'use client'

import { useState, useCallback } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
}

const styles = {
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: COLORS.slate,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  section: { marginBottom: '32px' },
  card: {
    background: 'white',
    border: '1px solid ' + COLORS.border,
    borderRadius: '16px',
    padding: '32px',
  },
  uploadZone: {
    border: '2px dashed ' + COLORS.border,
    borderRadius: '12px',
    padding: '40px 24px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  uploadZoneActive: {
    border: '2px dashed ' + COLORS.gold,
    background: '#FFFBF0',
  },
  fileName: {
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.navy,
    marginBottom: '4px',
  },
  fileSize: {
    fontSize: '12px',
    color: COLORS.slate,
  },
  parsedField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #F1F5F9',
    fontSize: '14px',
  },
  skipBtn: {
    background: 'none',
    border: 'none',
    color: COLORS.slate,
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  primaryBtn: {
    padding: '12px 24px',
    background: COLORS.navy,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  goldBtn: {
    padding: '12px 24px',
    background: COLORS.gold,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
}

type ParseStatus = 'idle' | 'parsing' | 'done' | 'error'

interface ParsedData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  city?: string
  yearsExperience?: number
  jobTitle?: string
  services?: string[]
}

interface Props {
  onNext?: () => void
  onSkip?: () => void
}

export default function Step0ResumeUpload({ onNext, onSkip }: Props) {
  const { formData, updateFields } = useProfileForm()
  const { saveField } = useProfileSave()
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFile = useCallback(async (f: File) => {
    setFile(f)
    setParseStatus('parsing')
    setParseError(null)
    setParsedData(null)

    saveField('resumeFileName' as any, f.name)

    try {
      const formPayload = new FormData()
      formPayload.append('resume', f)

      const res = await fetch('/api/profile/parse-resume', {
        method: 'POST',
        body: formPayload,
      })

      if (!res.ok) throw new Error('Parse failed')

      const data: ParsedData = await res.json()
      setParsedData(data)
      setParseStatus('done')
    } catch {
      setParseStatus('error')
      setParseError('Could not parse resume. You can still fill in your details manually.')
    }
  }, [saveField])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const handleApplyParsed = () => {
    if (!parsedData) return
    updateFields({
      ...parsedData,
      resumeParsed: true,
    })
    saveField('resumeParsed' as any, true)
    onNext?.()
  }

  const handleSkip = () => {
    onSkip?.()
  }

  const PARSED_LABELS: Record<keyof ParsedData, string> = {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    city: 'City',
    yearsExperience: 'Years of experience',
    jobTitle: 'Job title',
    services: 'Services',
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>

      {/* Header */}
      <div style={styles.section}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: COLORS.navy, marginBottom: '8px' }}>
          Start with your resume
        </div>
        <p style={{ fontSize: '15px', color: COLORS.slate, marginBottom: '0' }}>
          Upload your resume and we'll pre-fill your profile. You can edit everything after.
        </p>
      </div>

      {/* Upload zone */}
      {parseStatus === 'idle' && (
        <div style={styles.section}>
          <label
            htmlFor="resume-upload"
            style={{
              ...styles.uploadZone,
              ...(dragOver ? styles.uploadZoneActive : {}),
              display: 'block',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px', color: COLORS.slate }}>
              ↑
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.navy, marginBottom: '6px' }}>
              Drop your resume here
            </div>
            <div style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '16px' }}>
              PDF or Word document — max 5MB
            </div>
            <div style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: COLORS.navy,
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              Choose file
            </div>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {/* Parsing state */}
      {parseStatus === 'parsing' && (
        <div style={{ ...styles.card, textAlign: 'center', marginBottom: '32px' }}>
          <div style={styles.fileName}>{file?.name}</div>
          <div style={styles.fileSize}>{file ? formatBytes(file.size) : ''}</div>
          <div style={{ marginTop: '20px', fontSize: '14px', color: COLORS.slate }}>
            Reading your resume...
          </div>
          <div style={{
            width: '40px', height: '40px', border: '3px solid ' + COLORS.border,
            borderTop: '3px solid ' + COLORS.gold, borderRadius: '50%',
            margin: '16px auto 0',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error state */}
      {parseStatus === 'error' && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ ...styles.card, border: '1px solid #FECACA', background: '#FEF2F2' }}>
            <div style={styles.fileName}>{file?.name}</div>
            <p style={{ fontSize: '14px', color: COLORS.red, marginTop: '8px' }}>{parseError}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setParseStatus('idle')} style={styles.primaryBtn}>
              Try another file
            </button>
            <button type="button" onClick={handleSkip} style={{ ...styles.skipBtn, padding: '12px 0' }}>
              Continue without resume
            </button>
          </div>
        </div>
      )}

      {/* Parsed results */}
      {parseStatus === 'done' && parsedData && (
        <div style={styles.section}>
          <div style={{ ...styles.card, marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#DCFCE7', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '16px', color: '#16A34A',
              }}>
                ✓
              </div>
              <div>
                <div style={styles.fileName}>{file?.name}</div>
                <div style={styles.fileSize}>{file ? formatBytes(file.size) : ''}</div>
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.slate, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Found in your resume
            </div>

            {(Object.keys(parsedData) as Array<keyof ParsedData>)
              .filter(k => parsedData[k] !== undefined && parsedData[k] !== null && parsedData[k] !== '')
              .map(key => (
                <div key={key} style={styles.parsedField}>
                  <span style={{ color: COLORS.slate }}>{PARSED_LABELS[key]}</span>
                  <span style={{ fontWeight: 500, color: COLORS.navy }}>
                    {Array.isArray(parsedData[key])
                      ? (parsedData[key] as string[]).join(', ')
                      : String(parsedData[key])}
                  </span>
                </div>
              ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="button" onClick={handleApplyParsed} style={styles.goldBtn}>
              Looks right — apply to profile
            </button>
            <button type="button" onClick={handleSkip} style={styles.skipBtn}>
              Skip and fill in manually
            </button>
          </div>
        </div>
      )}

      {/* Always-visible skip at bottom */}
      {parseStatus === 'idle' && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button type="button" onClick={handleSkip} style={styles.skipBtn}>
            Skip — I'll fill in my details manually
          </button>
        </div>
      )}

    </div>
  )
}
