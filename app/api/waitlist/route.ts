import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, city, province_state, country } = await req.json()

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!role || !['caregiver', 'agency'].includes(role)) {
      return NextResponse.json({ error: 'Role must be caregiver or agency' }, { status: 400 })
    }
    if (!country || !['CA', 'US'].includes(country)) {
      return NextResponse.json({ error: 'Country must be CA or US' }, { status: 400 })
    }

    const timestamp = new Date().toLocaleString('en-CA', {
      timeZone: 'America/Toronto',
      dateStyle: 'full',
      timeStyle: 'long',
    })

    const resend = new Resend(process.env.RESEND_API_KEY)

    try {
      await resend.emails.send({
        from: 'Careified <onboarding@resend.dev>',
        to: 'ocdeployments@gmail.com',
        subject: `New Waitlist Signup — ${role} — ${city}, ${province_state}`,
        html: `
          <p><strong>Name:</strong> ${name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Role:</strong> ${role}</p>
          <p><strong>Location:</strong> ${city}, ${province_state}, ${country}</p>
          <p><strong>Signed up:</strong> ${timestamp}</p>
        `,
      })
    } catch (sendError) {
      console.error('Resend send error:', sendError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}