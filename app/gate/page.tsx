'use client'
import { useState } from 'react'

export default function GatePage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const res = await fetch('/api/gate/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      const { redirect } = await res.json()
      window.location.href = redirect || '/'
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0D1B3E', fontFamily: 'DM Sans, sans-serif'
    }}>
      <div style={{ width: 360, padding: '40px', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(201,151,58,0.2)', borderRadius: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#C9973A',
          fontFamily: 'DM Serif Display, serif', marginBottom: 8 }}>Careified</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>
          Private access only
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Access code"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 8, fontSize: 14,
              background: 'rgba(255,255,255,0.07)', border: error
                ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.15)',
              color: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 8,
            }}
          />
          {error && <div style={{ fontSize: 12, color: '#F87171', marginBottom: 8 }}>
            Incorrect access code
          </div>}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '12px', borderRadius: 8, fontSize: 14,
              fontWeight: 600, background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E', border: 'none', cursor: loading ? 'wait' : 'pointer',
              opacity: loading || !password ? 0.6 : 1,
            }}
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}