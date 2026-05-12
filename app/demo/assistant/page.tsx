'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTER_PROMPTS = [
  'Find me a PSW in Toronto available mornings',
  'Show caregivers with dementia experience',
  'What can Careified do for my agency?',
  'How does AIRecruit screening work?'
]

export default function DemoAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hoveredChip, setHoveredChip] = useState<number | null>(null)

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
      const res = await fetch('/api/demo/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      })
      const data = await res.json()

      if (res.status === 429) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error
        }])
      } else if (!res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'AI temporarily unavailable. Please try again in a moment.'
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please try again.'
      }])
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
    <div style={{
      minHeight: '100vh',
      background: '#F9FAFB',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#0D1B3E'
        }}>Careified</span>
        <Link href="/agency/signup" style={{
          backgroundColor: '#C9973A',
          color: 'white',
          padding: '8px 20px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block'
        }}>Sign up free</Link>
      </div>

      {/* Hero */}
      <div style={{
        padding: '40px 24px 24px',
        textAlign: 'center',
        maxWidth: 640,
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#0D1B3E',
          marginBottom: 8,
          fontFamily: '"DM Serif Display", serif'
        }}>Meet your AI agency assistant</h1>
        <p style={{
          fontSize: 16,
          color: '#6B7280',
          marginBottom: 16
        }}>Ask anything. Find caregivers. Understand your matches.</p>
        <span style={{
          display: 'inline-block',
          backgroundColor: '#C9973A',
          color: 'white',
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 20,
          letterSpacing: '0.5px'
        }}>DEMO MODE — Live demo data</span>
      </div>

      {/* Chat Container */}
      <div style={{
        flex: 1,
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
        padding: '0 16px 16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Message Thread */}
        <div ref={messagesEndRef} style={{
          overflowY: 'auto',
          flex: 1,
          minHeight: 300,
          maxHeight: 'calc(100vh - 340px)',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.role === 'user' ? '75%' : '80%',
                backgroundColor: msg.role === 'user' ? '#C9973A' : 'white',
                color: msg.role === 'user' ? 'white' : '#1F2937',
                fontSize: 14,
                lineHeight: msg.role === 'user' ? 1.5 : 1.6,
                padding: '10px 16px',
                borderRadius: msg.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                border: msg.role === 'assistant' ? '1px solid #E5E7EB' : 'none',
                boxShadow: msg.role === 'assistant' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                whiteSpace: 'pre-wrap'
              }}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div style={{
              alignSelf: 'flex-start',
              maxWidth: '80%',
              backgroundColor: 'white',
              color: '#1F2937',
              fontSize: 14,
              lineHeight: 1.6,
              padding: '10px 16px',
              borderRadius: '18px 18px 18px 4px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <span style={{
                display: 'inline-block',
                animation: 'bounce 1s infinite',
                marginRight: 4
              }}>.</span>
              <span style={{
                display: 'inline-block',
                animation: 'bounce 1s infinite 0.15s',
                marginRight: 4
              }}>.</span>
              <span style={{
                display: 'inline-block',
                animation: 'bounce 1s infinite 0.3s'
              }}>.</span>
            </div>
          )}
        </div>

        {/* Starter Prompts */}
        {messages.length === 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '8px 0'
          }}>
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                onMouseEnter={() => setHoveredChip(idx)}
                onMouseLeave={() => setHoveredChip(null)}
                style={{
                  border: '1px solid #0D1B3E',
                  color: hoveredChip === idx ? 'white' : '#0D1B3E',
                  backgroundColor: hoveredChip === idx ? '#0D1B3E' : 'white',
                  fontSize: 13,
                  padding: '6px 14px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s ease'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#F9FAFB',
          paddingTop: 12,
          paddingBottom: 8,
          display: 'flex',
          gap: 8,
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask me anything about caregivers..."
            style={{
              flex: 1,
              fontSize: 15,
              padding: '12px 20px',
              border: '1px solid #D1D5DB',
              borderRadius: 24,
              outline: 'none',
              fontFamily: '"DM Sans", sans-serif'
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#C9973A',
              border: 'none',
              cursor: loading || !input.trim() ? 'default' : 'pointer',
              opacity: loading || !input.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 18
            }}
          >
            →
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#9CA3AF',
          padding: '8px 0 16px'
        }}>
          This is a demo. Careified AI presents information for agency review — all hiring decisions are made independently. Not a recommendation engine.
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { opacity: 0.5; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}