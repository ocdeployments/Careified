import { getResendClient } from './resend-client'

export async function sendClaimEmail(params: {
  to: string
  firstName: string
  agencyName: string
  token: string
}): Promise<{ sent: boolean; provider: string }> {
  const resend = getResendClient()
  if (!resend) {
    console.warn('[sendClaimEmail] RESEND_API_KEY not set — skipping')
    return { sent: false, provider: 'none' }
  }
  const claimUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://careified.vercel.app'}/claim/${params.token}`

  const { error } = await resend.emails.send({
    from: 'Careified <noreply@careified.vercel.app>',
    to: params.to,
    subject: `${params.agencyName} created a Careified profile for you — claim it now`,
    html: `
      <p>Hi ${params.firstName},</p>
      <p>${params.agencyName} added you to Careified — the reputation platform for professional caregivers.</p>
      <p>We've created a basic profile for you with the information we have on file. Claim it now to:</p>
      <ul>
        <li>Add your own details and photo</li>
        <li>Make your credentials visible to agencies</li>
        <li>Build your portable professional reputation</li>
      </ul>
      <p><a href="${claimUrl}">Claim your profile</a></p>
      <p>This link expires in 30 days.</p>
      <p>The Careified Team</p>
    `,
  })

  if (error) {
    console.error('[sendClaimEmail] Resend error:', error)
    return { sent: false, provider: 'resend' }
  }

  return { sent: true, provider: 'resend' }
}