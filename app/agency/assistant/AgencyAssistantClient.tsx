'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AgencyShell from '@/components/shells/AgencyShell'

const STARTER_PROMPTS = [
  "Find caregivers with dementia experience",
  "Which clients don't have a caregiver yet?",
  "Start a screening campaign",
  "Show me my AIRecruit results"
]

const M = 'rgba(255,255,255,0.55)'
const B = 'rgba(255,255,255,0.08)'
const C = 'rgba(255,255,255,0.04)'

interface ParsedMessage {
  role: 'user' | 'assistant'
  content: string
  actionUrl?: string
}

export default function AgencyAssistantClient({ agencyName }: { agencyName: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState<ParsedMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hoveredChip, setHoveredChip] = useState<number | null>(null)

  function parseActionBlock(text: string): { content: string; actionUrl?: string } {
    const actionRegex = /<action>{"type":"navigate","url":"([^"]+)"}<\/action>/
    const match = text.match(actionRegex)
    if (match) {
      return {
        content: text.replace(actionRegex, '').trim(),
        actionUrl: match[1]
      }
    }
    return { content: text }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(messageToSend?: string) {
    const text = messageToSend || input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await fetch('/api/agency/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()

      if (res.status === 403) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'You need an approved agency account to use this feature.' }])
      } else if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'AI temporarily unavailable. Please try again in a moment.' }])
      } else {
        const parsed = parseActionBlock(data.response)
        setMessages(prev => [...prev, { role: 'assistant', content: parsed.content, actionUrl: parsed.actionUrl }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AgencyShell title="AI Assistant" subtitle={`${agencyName}'s Careified assistant`}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)' }}>
        {/* Message Thread */}
        <div ref={messagesEndRef} style={{ overflowY: 'auto', flex: 1, minHeight: 300, maxHeight: 'calc(100vh - 380px)', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.role === 'user' ? '75%' : '80%',
              backgroundColor: msg.role === 'user' ? '#C9973A' : C,
              color: msg.role === 'user' ? '#0D1B3E' : '#F5F0E8',
              fontSize: 14,
              lineHeight: msg.role === 'user' ? 1.5 : 1.6,
              padding: '10px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              border: msg.role === 'assistant' ? `1px solid ${B}` : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
              {msg.role === 'assistant' && msg.actionUrl && (
                <button onClick={() => router.push(msg.actionUrl!)} style={{ background: '#C9973A', color: '#0D1B3E', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: '13px', marginTop: 8, display: 'inline-block' }}>
                  Go →
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '80%', backgroundColor: C, color: '#F5F0E8', fontSize: 14, lineHeight: 1.6, padding: '10px 16px', borderRadius: '18px 18px 18px 4px', border: `1px solid ${B}` }}>
              <span style={{ display: 'inline-block', animation: 'bounce 1s infinite', marginRight: 4 }}>.</span>
              <span style={{ display: 'inline-block', animation: 'bounce 1s infinite 0.15s', marginRight: 4 }}>.</span>
              <span style={{ display: 'inline-block', animation: 'bounce 1s infinite 0.3s' }}>.</span>
            </div>
          )}
        </div>

        {/* Starter Prompts */}
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 0' }}>
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button key={idx} onClick={() => sendMessage(prompt)} onMouseEnter={() => setHoveredChip(idx)} onMouseLeave={() => setHoveredChip(null)} style={{
                background: hoveredChip === idx ? 'rgba(201,151,58,0.15)' : C,
                border: `1px solid ${hoveredChip === idx ? 'rgba(201,151,58,0.4)' : B}`,
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#F5F0E8',
                margin: 4,
                fontFamily: '"DM Sans", sans-serif',
                transition: 'all 0.15s ease'
              }}>
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{ paddingTop: 12, paddingBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} placeholder="Ask about your roster, clients, or matches..." style={{
            flex: 1, fontSize: 15, padding: '12px 20px', border: `1px solid ${B}`, borderRadius: 24, outline: 'none', fontFamily: '"DM Sans", sans-serif', background: 'rgba(255,255,255,0.04)', color: '#F5F0E8'
          }} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
            width: 44, height: 44, borderRadius: '50%', backgroundColor: '#C9973A', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D1B3E', fontSize: 18
          }}>
            →
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 12, color: M, padding: '8px 0 16px' }}>
          This is a demo. Careified AI presents information for agency review — all hiring decisions are made independently. Not a recommendation engine.
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { opacity: 0.5; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </AgencyShell>
  )
}
