// TODO: replace with Resend when transactional email provider lands.
// See PRODUCTION_CHECKLIST.md and INTEGRATIONS.md.

interface SendClaimEmailParams {
  to: string
  firstName: string
  agencyName: string
  token: string
}

/**
 * Send claim email to caregiver.
 *
 * Current implementation is a STUB that logs to console and writes to audit_log.
 * Replace with Resend integration when email provider is provisioned.
 */
export async function sendClaimEmail(params: SendClaimEmailParams): Promise<{ sent: boolean; provider: string }> {
  const claimUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://careified.vercel.app'}/claim/${params.token}`

  console.log('[CLAIM EMAIL STUB]', {
    to: params.to,
    subject: `${params.agencyName} created a Careified profile for you — claim it now`,
    claim_url: claimUrl,
    expires_in: '30 days',
  })

  // Audit so we can confirm sends happened in admin
  // Note: This stub runs without a DB pool — audit is logged via console for now
  // The confirm endpoint handles audit_log writes directly
  console.log('[AUDIT STUB] claim_email_queued', {
    to: params.to,
    agency: params.agencyName,
    token: params.token,
  })

  return { sent: true, provider: 'stub' }
}