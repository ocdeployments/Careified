// Careified — Notification Service
// Handles email/webhook notifications for platform events

export interface NotificationPayload {
  type: 'review_submitted' | 'badge_earned' | 'dispute_received' | 'dispute_resolved'
  recipientEmail: string
  recipientName?: string
  data: Record<string, unknown>
}

export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  const { type, recipientEmail, recipientName, data } = payload

  // In production, integrate with email provider (Resend, SendGrid, etc.)
  // For now, log the notification
  console.log(`[NOTIFICATION] ${type} to ${recipientEmail}${recipientName ? ` (${recipientName})` : ''}:`, data)

  // Example webhook notification (for external integrations)
  if (process.env.NOTIFICATION_WEBHOOK_URL) {
    try {
      await fetch(process.env.NOTIFICATION_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, recipientEmail, recipientName, data, timestamp: new Date().toISOString() }),
      })
    } catch (e) {
      console.error('Webhook notification failed:', e)
    }
  }

  return true
}

export async function notifyReviewSubmitted(caregiverEmail: string, caregiverName: string, agencyName: string): Promise<boolean> {
  return sendNotification({
    type: 'review_submitted',
    recipientEmail: caregiverEmail,
    recipientName: caregiverName,
    data: {
      message: 'A new placement review has been submitted',
      agency: agencyName,
      actionUrl: '/profile/strength',
    },
  })
}

export async function notifyBadgeEarned(caregiverEmail: string, caregiverName: string, badgeLabel: string): Promise<boolean> {
  return sendNotification({
    type: 'badge_earned',
    recipientEmail: caregiverEmail,
    recipientName: caregiverName,
    data: {
      message: `You earned a new badge: ${badgeLabel}`,
      badge: badgeLabel,
      actionUrl: '/profile/strength',
    },
  })
}