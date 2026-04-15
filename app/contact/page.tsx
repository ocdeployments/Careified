'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', type: 'general', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0' }}>
      <section style={{ padding: '140px 20px 80px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'start' }}>
          
          {/* Left - Info */}
          <div>
            <h1 style={{ 
              fontSize: 'clamp(32px, 4vw, 48px)', 
              fontWeight: 900, 
              color: '#0D1B3E', 
              marginBottom: '24px'
            }}>
              Get in <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Touch</span>
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#64748B', 
              marginBottom: '40px',
              lineHeight: 1.6
            }}>
              Have a question or need help? Fill out the form and we'll get back 
              to you within 24 hours.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '12px', 
                  background: '#FDF6EC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  📧
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '2px' }}>Email</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#0D1B3E' }}>support@careified.com</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '12px', 
                  background: '#FDF6EC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  ⏰
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '2px' }}>Hours</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#0D1B3E' }}>Mon-Fri, 9am-6pm EST</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right - Form */}
          <div style={{ 
            padding: '40px', 
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0D1B3E', marginBottom: '8px' }}>
                  Message Sent!
                </h2>
                <p style={{ fontSize: '16px', color: '#64748B' }}>
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0D1B3E', marginBottom: '8px' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px',
                      border: '2px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="Sarah Johnson"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0D1B3E', marginBottom: '8px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px',
                      border: '2px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="sarah@example.com"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0D1B3E', marginBottom: '8px' }}>
                    Inquiry Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px',
                      border: '2px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="agency">I'm an Agency</option>
                    <option value="caregiver">I'm a Caregiver</option>
                    <option value="family">I'm a Family</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0D1B3E', marginBottom: '8px' }}>
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px',
                      border: '2px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    placeholder="How can we help you?"
                  />
                </div>
                
                <button
                  type="submit"
                  style={{ 
                    padding: '16px',
                    background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                    color: '#0D1B3E',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(201, 151, 58, 0.4)'
                  }}
                >
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
