import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  if (!resend) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  let body: { name?: string; email?: string; subject?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, subject, message } = body

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'Careified <onboarding@resend.dev>',
      to: 'support@careified.com',
      subject: `[Contact] ${subject} — from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CONTACT_API]', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}