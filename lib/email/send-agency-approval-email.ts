import { Resend } from 'resend'

export async function sendAgencyApprovalEmail(params: {
  to: string
  agencyName: string
  contactName: string
}): Promise<{ sent: boolean }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[sendAgencyApprovalEmail] no key')
    return { sent: false }
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'Careified <noreply@careified.vercel.app>',
    to: params.to,
    subject: 'Your Careified account is approved',
    html: `
      <p>Hi ${params.contactName},</p>
      <p>${params.agencyName} has been approved on Careified.</p>
      <p>You now have full access to search caregivers, run AI screening calls, and manage your roster.</p>
      <p><a href="https://careified.vercel.app/agency/dashboard">Go to your dashboard</a></p>
      <p>The Careified Team</p>
    `
  })
  if (error) {
    console.error('[sendAgencyApprovalEmail]', error)
    return { sent: false }
  }
  return { sent: true }
}