'use client'

import { useState, useRef } from 'react'
import { Upload, ArrowLeft, Loader2, Check, AlertCircle, Download } from 'lucide-react'

const N = '#0D1B3E'
const G = '#C9973A'
const G_LIGHT = '#E8B86D'
const WHITE = '#FFFFFF'
const RED = '#DC2626'
const GREEN = '#16A34A'
const GREY = '#6B7280'

interface ParsedRow {
  row: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  years_experience?: string
  city?: string
  province_state?: string
  valid: boolean
  errors: string[]
}

export default function ImportPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ created: number; failed: number; errors: any[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (content: string): ParsedRow[] => {
    const lines = content.trim().split(/\r?\n/)
    if (lines.length < 2) return []

    const header = lines[0].toLowerCase().split(',').map(h => h.trim())
    const rows: ParsedRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      if (cols.length < 5 || !cols[0]) continue

      const getField = (name: string) => {
        const idx = header.indexOf(name)
        return idx >= 0 && idx < cols.length ? cols[idx] : ''
      }

      const row: ParsedRow = {
        row: i + 1,
        first_name: getField('first_name'),
        last_name: getField('last_name'),
        email: getField('email'),
        phone: getField('phone'),
        role: getField('role'),
        years_experience: getField('years_experience'),
        city: getField('city'),
        province_state: getField('province_state'),
        valid: true,
        errors: [],
      }

      // Validate
      if (!row.first_name || row.first_name.length < 2) row.errors.push('first_name')
      if (!row.last_name || row.last_name.length < 2) row.errors.push('last_name')
      if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) row.errors.push('email')
      if (!row.phone || !/^\d{10}$/.test(row.phone)) row.errors.push('phone')
      if (!row.role) row.errors.push('role')

      if (row.errors.length > 0) row.valid = false
      rows.push(row)
    }

    return rows
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    setFile(f)
    setParsing(true)

    try {
      const text = await f.text()
      const parsed = parseCSV(text)
      setParsedData(parsed)
      setStep('preview')
    } catch (err) {
      console.error('Parse error:', err)
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    const validRows = parsedData.filter(r => r.valid)
    if (validRows.length === 0) return

    setImporting(true)

    // Create CSV content
    const header = 'first_name,last_name,email,phone,role,years_experience,city,province_state'
    const csvContent = validRows.map(r =>
      `${r.first_name},${r.last_name},${r.email},${r.phone},${r.role},${r.years_experience || ''},${r.city || ''},${r.province_state || ''}`
    ).join('\n')

    const formData = new FormData()
    const csvFile = new File([header + '\n' + csvContent], 'import.csv', { type: 'text/csv' })
    formData.append('csv', csvFile)

    try {
      const res = await fetch('/api/roster/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      setResult({
        created: data.created || 0,
        failed: data.failed || 0,
        errors: data.errors || [],
      })
      setStep('done')
    } catch (err) {
      console.error('Import error:', err)
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = 'first_name,last_name,email,phone,role,years_experience,city,province_state\nJane,Smith,jane@example.com,6471234567,PSW,3,Toronto,ON'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'careified-roster-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validCount = parsedData.filter(r => r.valid).length
  const errorCount = parsedData.filter(r => !r.valid).length

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
              <Upload size={40} style={{ color: GREY, marginBottom: 16 }} />
              <div style={{ fontSize: 16, fontWeight: 500, color: N, marginBottom: 8 }}>
                {file ? file.name : 'Drop your CSV file here or click to browse'}
              </div>
              <div style={{ fontSize: 13, color: GREY }}>
                Accepts .csv files
              </div>
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

        {step === 'preview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span style={{ fontWeight: 600, color: GREEN, marginRight: 16 }}>{validCount} ready to import</span>
                {errorCount > 0 && <span style={{ color: RED }}>{errorCount} rows with errors</span>}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => { setStep('upload'); setFile(null); setParsedData([]); }}
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
                  Fix errors and re-upload
                </button>
                <button
                  onClick={handleImport}
                  disabled={validCount === 0 || importing}
                  style={{
                    padding: '10px 24px',
                    background: validCount === 0 || importing ? '#94A3B8' : `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
                    color: N,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: validCount === 0 || importing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {importing ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Importing...
                    </>
                  ) : (
                    `Import ${validCount} Caregivers`
                  )}
                </button>
              </div>
            </div>

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
                  {parsedData.map((row) => (
                    <tr key={row.row} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: GREY }}>{row.row}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.first_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.last_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.phone}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.role}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {row.valid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: GREEN, fontSize: 12, fontWeight: 500 }}>
                            <Check size={14} /> Valid
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: RED, fontSize: 12, fontWeight: 500 }}>
                            <AlertCircle size={14} /> {row.errors.join(', ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div style={{ background: WHITE, borderRadius: 16, padding: 40, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={32} style={{ color: GREEN }} />
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 12px' }}>
              {result.created} profiles created
            </h2>
            <p style={{ fontSize: 14, color: GREY, margin: '0 0 24px' }}>
              Invite emails have been sent to all new caregivers.
            </p>
            {result.failed > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.1)', borderRadius: 8, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: RED, marginBottom: 8 }}>{result.failed} rows failed</div>
                {result.errors.slice(0, 3).map((err: any, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: RED }}>Row {err.row}: {err.message}</div>
                ))}
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
              Back to Roster
            </a>
          </div>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}