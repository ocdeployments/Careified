'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

const G = '#C9973A'
const S = "'DM Sans', sans-serif"
const M = 'rgba(255,255,255,0.55)'
const B = 'rgba(255,255,255,0.08)'
const C = 'rgba(255,255,255,0.04)'
const GREEN = '#22C55E'
const AMBER = '#F59E0B'
const RED = '#E24B4A'

interface TelegramUser {
  telegram_user_id: number
  telegram_username: string | null
  label: string
  connected_at: string
  last_active_at: string | null
}

interface TelegramStatus {
  connected: boolean
  users: TelegramUser[]
  user_limit: number
  plan_tier: string
}

export default function TelegramIntegration() {
  const [status, setStatus] = useState<TelegramStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(900)
  const [polling, setPolling] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/telegram/connect')
      const data = await res.json()
      setStatus(data)
    } catch (e) {
      console.error('Failed to fetch status:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (!code || polling) return
    const interval = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [code, polling])

  useEffect(() => {
    if (!polling || !status) return
    const poll = setInterval(async () => {
      await fetchStatus()
      if (status.users.length > 0 && status.users[status.users.length - 1]?.connected_at) {
        setPolling(false)
        setCode(null)
        setCountdown(900)
      }
    }, 5000)
    return () => clearInterval(poll)
  }, [polling, status?.users.length])

  const generateCode = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/telegram/connect', { method: 'POST' })
      const data = await res.json()
      if (data.code) {
        setCode(data.code)
        setCountdown(data.expires_in)
        setPolling(true)
      }
    } catch (e) {
      toast.error('Failed to generate code')
    } finally {
      setGenerating(false)
    }
  }

  const cancelCode = () => {
    setCode(null)
    setCountdown(900)
    setPolling(false)
  }

  const removeUser = async (telegramUserId: number) => {
    if (!confirm('Remove this user?')) return
    try {
      await fetch('/api/telegram/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_user_id: telegramUserId }),
      })
      toast.success('User removed')
      fetchStatus()
    } catch (e) {
      toast.error('Failed to remove user')
    }
  }

  const updateLabel = async (telegramUserId: number) => {
    try {
      await fetch('/api/telegram/connect', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_user_id: telegramUserId, label: editLabel }),
      })
      setEditingId(null)
      fetchStatus()
    } catch (e) {
      toast.error('Failed to update label')
    }
  }

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const getDaysAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: S, color: M }}>Loading...</div>
  }

  const isStarter = status?.plan_tier === 'starter'
  const userCount = status?.users?.length || 0
  const userLimit = status?.user_limit || 0
  const atLimit = userCount >= userLimit

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#F5F0E8', margin: '0 0 8px' }}>Telegram Bot</h2>
        <p style={{ fontSize: 13, color: M, margin: '0 0 12px' }}>
          Message @Careified_bot from Telegram to get triage briefings, search caregivers, and check your roster — without opening the app.
        </p>
        <a href="https://t.me/Careified_bot" target="_blank" rel="noopener" style={{
          fontSize: 14, color: G, fontFamily: 'monospace', textDecoration: 'none'
        }}>@Careified_bot</a>
      </div>

      {isStarter ? (
        <div style={{ padding: 20, background: 'rgba(201,151,58,0.1)', borderRadius: 12, border: '1px solid rgba(201,151,58,0.25)' }}>
          <p style={{ fontSize: 14, color: '#F5F0E8', marginBottom: 8 }}>Telegram is available on Growth and Scale plans.</p>
          <a href="/agency/billing" style={{ fontSize: 13, color: G }}>Upgrade at /agency/billing</a>
        </div>
      ) : (
        <>
          {/* Connected Users */}
          {userCount > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F0E8' }}>Connected Users</span>
                <span style={{ fontSize: 12, color: atLimit ? AMBER : M }}>
                  {userCount} of {userLimit} users connected
                  {atLimit && ' — User limit reached'}
                </span>
              </div>

              {status?.users.map(user => (
                <div key={user.telegram_user_id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  background: C, borderRadius: 8, marginBottom: 8, border: `1px solid ${B}`
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />
                  <span style={{ fontSize: 14, color: '#F5F0E8', flex: 1 }}>
                    @{user.telegram_username || 'Unknown user'}
                  </span>

                  {editingId === user.telegram_user_id ? (
                    <input
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      onBlur={() => updateLabel(user.telegram_user_id)}
                      onKeyDown={e => e.key === 'Enter' && updateLabel(user.telegram_user_id)}
                      autoFocus
                      style={{ width: 100, padding: '4px 8px', fontSize: 12, background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${G}`, borderRadius: 4, color: M, fontStyle: 'italic' }}
                    />
                  ) : (
                    <span
                      onClick={() => { setEditingId(user.telegram_user_id); setEditLabel(user.label) }}
                      style={{ fontSize: 12, color: M, fontStyle: 'italic', cursor: 'pointer' }}
                    >
                      {user.label}
                    </span>
                  )}

                  <span style={{ fontSize: 11, color: M }}>{getDaysAgo(user.last_active_at)}</span>

                  <button
                    onClick={() => removeUser(user.telegram_user_id)}
                    style={{ background: 'none', border: 'none', color: M, fontSize: 16, cursor: 'pointer', padding: '0 4px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add User Button or Code UI */}
          {!code ? (
            userCount === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, background: C, borderRadius: 12, border: `1px solid ${B}` }}>
                <p style={{ fontSize: 13, color: M, marginBottom: 16 }}>No Telegram users connected yet.</p>
                <button
                  onClick={generateCode}
                  disabled={generating || atLimit}
                  style={{
                    padding: '10px 20px', borderRadius: 10, border: atLimit ? `1px solid ${M}` : `1px solid ${G}`,
                    background: atLimit ? 'transparent' : 'transparent', color: atLimit ? M : G,
                    fontSize: 14, fontWeight: 600, cursor: atLimit ? 'not-allowed' : 'pointer', fontFamily: S
                  }}
                >
                  {generating ? 'Generating...' : '+ Add User'}
                </button>
              </div>
            ) : (
              !atLimit && (
                <button
                  onClick={generateCode}
                  disabled={generating}
                  style={{
                    padding: '10px 20px', borderRadius: 10, border: `1px solid ${G}`,
                    background: 'transparent', color: G, fontSize: 14, fontWeight: 600,
                    cursor: generating ? 'not-allowed' : 'pointer', fontFamily: S
                  }}
                >
                  {generating ? 'Generating...' : '+ Add User'}
                </button>
              )
            )
          ) : (
            <div style={{ padding: 24, background: C, borderRadius: 12, border: `1px solid ${B}`, textAlign: 'center' }}>
              <div style={{
                fontSize: 32, letterSpacing: '0.3em', color: G, fontFamily: 'monospace',
                background: 'rgba(255,255,255,0.04)', padding: '16px 24px', borderRadius: 8, marginBottom: 16
              }}>
                {code}
              </div>

              <div style={{ fontSize: 13, color: M, lineHeight: 1.8, marginBottom: 16 }}>
                1. Open Telegram<br />
                2. Search @Careified_bot<br />
                3. Send: /connect {code}
              </div>

              <div style={{
                fontSize: 14, color: countdown < 120 ? AMBER : M, marginBottom: 16
              }}>
                Expires in {formatCountdown(countdown)}
              </div>

              <button
                onClick={cancelCode}
                style={{ background: 'none', border: 'none', color: M, fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Commands */}
          <div style={{ marginTop: 24, padding: 16, background: C, borderRadius: 8, border: `1px solid ${B}` }}>
            <span style={{ fontSize: 12, color: M, fontFamily: 'monospace' }}>
              /morning · /unmatched · /airecruit · /creds · /search · /help
            </span>
          </div>
        </>
      )}
    </div>
  )
}