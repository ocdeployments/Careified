'use client'

import { useState, useRef } from 'react'
import { Upload, ArrowLeft, Loader2, Check, AlertCircle, Download, AlertTriangle } from 'lucide-react'

const N = '#0D1B3E'
const G = '#C9973A'
const G_LIGHT = '#E8B86D'
const WHITE = '#FFFFFF'
const RED = '#DC2626'
const GREEN = '#16A34A'
const GREY = '#6B7280'
const YELLOW = '#CA8A04'

interface ParsedRow {
  row_number: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  years_experience?: number
  city?: string
  province_state?: string
  locale: string
}

interface InvalidRow {
  row_number: number
  errors: string[]
  raw_data: Record<string, string>
}

interface Warning {
  row_number: number
  message: string
}

interface RawRow {
  _rowIndex: number
  [key: string]: string | number
}

interface UnknownFields {
  columns: string[]
  sample_data: Record<string, string[]>
}

interface ColumnMapping {
  mapping: Record<string, string | null>
  confidence: Record<string, string>
  unmapped: string[]
}

interface ConfirmResult {
  created: number
  caregiver_ids: string[]
  merge_pending: { row: ParsedRow; existing_caregiver_id: string; reason: string }[]
  already_rostered: { row: ParsedRow; source_agency_id: string; reason: string }[]
  email_failures: { caregiver_id: string; email: string; error: string }[]
}

export default function ImportPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [previewResult, setPreviewResult] = useState<{
    valid_rows: ParsedRow[]
    invalid_rows: InvalidRow[]
    warnings: Warning[]
    total_rows: number
    raw_rows?: RawRow[]
    column_mapping?: ColumnMapping
    unknown_fields?: UnknownFields
  } | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmResult, setConfirmResult] = useState<ConfirmResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    setFile(f)
    setParsing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('csv', f)

      const res = await fetch('/api/roster/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Preview failed')
        return
      }

      setPreviewResult(data)
      setStep('preview')
    } catch (err) {
      console.error('Preview error:', err)
      setError('Failed to preview CSV')
    } finally {
      setParsing(false)
    }
  }

  const handleConfirm = async () => {
    if (!previewResult || previewResult.valid_rows.length === 0) return

    setConfirming(true)
    setError(null)

    try {
      // Build unknown fields per row for field discovery
      const unknownFieldsPerRow: Record<number, Record<string, string>> = {}
      if (previewResult.raw_rows && previewResult.column_mapping && previewResult.unknown_fields) {
        const mapping = previewResult.column_mapping
        const unknownColumns = previewResult.unknown_fields.columns

        previewResult.valid_rows.forEach((row, idx) => {
          const rawRow = previewResult.raw_rows?.find(r => r._rowIndex === idx)
          if (rawRow && unknownColumns.length > 0) {
            const unknowns: Record<string, string> = {}
            for (const col of unknownColumns) {
              const val = rawRow[col]
              const strVal = typeof val === 'string' ? val : String(val || '')
              if (strVal && strVal.toLowerCase() !== 'n/a' && strVal !== '-' && strVal.toLowerCase() !== 'none') {
                unknowns[col] = strVal
              }
            }
            if (Object.keys(unknowns).length > 0) {
              unknownFieldsPerRow[idx] = unknowns
            }
          }
        })
      }

      const res = await fetch('/api/roster/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: previewResult.valid_rows,
          column_mapping: previewResult.column_mapping || null,
          unknown_fields: previewResult.unknown_fields || null,
          unknown_fields_per_row: Object.keys(unknownFieldsPerRow).length > 0 ? unknownFieldsPerRow : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Import failed')
        return
      }

      setConfirmResult(data)
      setStep('done')
    } catch (err) {
      console.error('Confirm error:', err)
      setError('Failed to create profiles')
    } finally {
      setConfirming(false)
    }
  }

  const handleDownloadTemplate = () => {
    window.location.href = '/api/roster/template'
  }

  const validCount = previewResult?.valid_rows.length || 0
  const invalidCount = previewResult?.invalid_rows.length || 0
  const warningCount = previewResult?.warnings.length || 0

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: N, padding: '24px' }}>
        <a href="/agency/roster" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={18} />
          Back to Roster
        </a>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: N, margin: '0 0 8px' }}>
          Import CSV
        </h1>
        <p style={{ fontSize: 14, color: GREY, margin: '0 0 32px' }}>
          Upload a CSV file to import multiple caregivers at once.
        </p>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.1)', borderRadius: 8, marginBottom: 24, border: `1px solid ${RED}` }}>
            <div style={{ fontWeight: 600, color: RED, marginBottom: 4 }}>Error</div>
            <div style={{ fontSize: 14, color: RED }}>{error}</div>
          </div>
        )}

        {step === 'upload' && (
          <div style={{ background: WHITE, borderRadius: 16, padding: 40, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <button
              onClick={handleDownloadTemplate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'transparent',
                color: N,
                border: `1px solid ${N}`,
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 24,
              }}
            >
              <Download size={18} />
              Download CSV Template
            </button>

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed #CBD5E1`,
                borderRadius: 12,
                padding: '48px 24px',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              {parsing ? (
                <>
                  <Loader2 size={40} style={{ color: G, animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                  <div style={{ fontSize: 16, fontWeight: 500, color: N, marginBottom: 8 }}>
                    Processing CSV...
                  </div>
                </>
              ) : (
                <>
                  <Upload size={40} style={{ color: GREY, marginBottom: 16 }} />
                  <div style={{ fontSize: 16, fontWeight: 500, color: N, marginBottom: 8 }}>
                    {file ? file.name : 'Drop your CSV file here or click to browse'}
                  </div>
                  <div style={{ fontSize: 13, color: GREY }}>
                    Accepts .csv files
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}

        {step === 'preview' && previewResult && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span style={{ fontWeight: 600, color: GREEN, marginRight: 16 }}>{validCount} ready to import</span>
                {invalidCount > 0 && <span style={{ color: RED, marginRight: 16 }}>{invalidCount} invalid</span>}
                {warningCount > 0 && <span style={{ color: YELLOW }}>{warningCount} warnings</span>}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => { setStep('upload'); setFile(null); setPreviewResult(null); }}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: N,
                    border: `1px solid ${N}`,
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Upload Different File
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={validCount === 0 || confirming}
                  style={{
                    padding: '10px 24px',
                    background: validCount === 0 || confirming ? '#94A3B8' : `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
                    color: N,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: validCount === 0 || confirming ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {confirming ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Creating profiles...
                    </>
                  ) : (
                    `Confirm Import (${validCount} caregivers)`
                  )}
                </button>
              </div>
            </div>

            {warningCount > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(202,138,4,0.1)', borderRadius: 8, marginBottom: 24, border: `1px solid ${YELLOW}` }}>
                <div style={{ fontWeight: 600, color: YELLOW, marginBottom: 8 }}>Warnings</div>
                {previewResult.warnings.slice(0, 5).map((w, i) => (
                  <div key={i} style={{ fontSize: 13, color: YELLOW }}>Row {w.row_number}: {w.message}</div>
                ))}
              </div>
            )}

            <div style={{ background: WHITE, borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>#</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>First Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Last Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Phone</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Role</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewResult.valid_rows.map((row) => (
                    <tr key={row.row_number} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: GREY }}>{row.row_number}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.first_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.last_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.phone}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.role}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: GREEN, fontSize: 12, fontWeight: 500 }}>
                          <Check size={14} /> Ready
                        </span>
                      </td>
                    </tr>
                  ))}
                  {previewResult.invalid_rows.map((row) => (
                    <tr key={row.row_number} style={{ borderBottom: '1px solid #F1F5F9', background: 'rgba(220,38,38,0.05)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: GREY }}>{row.row_number}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.raw_data.first_name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.raw_data.last_name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.raw_data.email || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.raw_data.phone || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.raw_data.role || '-'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: RED, fontSize: 12, fontWeight: 500 }}>
                          <AlertCircle size={14} /> {row.errors.join(', ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 'done' && confirmResult && (
          <div style={{ background: WHITE, borderRadius: 16, padding: 40, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={32} style={{ color: GREEN }} />
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 12px' }}>
              {confirmResult.created} caregiver profiles created
            </h2>
            <p style={{ fontSize: 14, color: GREY, margin: '0 0 24px' }}>
              Invite emails have been sent to all new caregivers.
            </p>

            {confirmResult.merge_pending.length > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(202,138,4,0.1)', borderRadius: 8, marginBottom: 16, textAlign: 'left', border: `1px solid ${YELLOW}` }}>
                <div style={{ fontWeight: 600, color: YELLOW, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} />
                  {confirmResult.merge_pending.length} caregivers already have profiles
                </div>
                <div style={{ fontSize: 13, color: YELLOW }}>
                  They will be prompted to merge when they claim their profile.
                </div>
              </div>
            )}

            {confirmResult.already_rostered.length > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(202,138,4,0.1)', borderRadius: 8, marginBottom: 16, textAlign: 'left', border: `1px solid ${YELLOW}` }}>
                <div style={{ fontWeight: 600, color: YELLOW, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} />
                  {confirmResult.already_rostered.length} caregivers were already added by another agency
                </div>
              </div>
            )}

            {confirmResult.email_failures.length > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.1)', borderRadius: 8, marginBottom: 24, textAlign: 'left', border: `1px solid ${RED}` }}>
                <div style={{ fontWeight: 600, color: RED, marginBottom: 4 }}>
                  {confirmResult.email_failures.length} claim emails failed to send
                </div>
                <div style={{ fontSize: 13, color: RED }}>
                  Use "Resend Invite" from the roster to retry.
                </div>
              </div>
            )}

            <a
              href="/agency/roster"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                background: `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
                color: N,
                textDecoration: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              View Roster
            </a>
          </div>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}