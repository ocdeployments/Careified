// Careified — Notification Helper Library
// Creates in-app notifications with deduplication

import { pool } from '@/lib/db'

export type NotificationType =
  | 'profile_viewed'
  | 'shortlisted'
  | 'removed_from_shortlist'
  | 'airecruit_scheduled'
  | 'reference_completed'
  | 'employer_verified'
  | 'badge_earned'
  | 'profile_nudge'
  | 'claim_available'

interface CreateNotificationParams {
  caregiverId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

export const NotificationTemplates = {
  profile_viewed: (agencyName: string) => ({
    title: 'Your profile was viewed',
    message: `${agencyName} viewed your profile.`,
    actionUrl: '/profile/strength'
  }),
  shortlisted: (agencyName: string) => ({
    title: 'You were shortlisted',
    message: `${agencyName} added you to their shortlist.`,
    actionUrl: '/profile/strength'
  }),
  removed_from_shortlist: (agencyName: string) => ({
    title: 'Removed from shortlist',
    message: `${agencyName} removed you from their shortlist.`,
    actionUrl: '/profile/strength'
  }),
  airecruit_scheduled: (agencyName: string) => ({
    title: 'Screening call scheduled',
    message: `${agencyName} has scheduled an AI screening call. Check your communication settings.`,
    actionUrl: '/settings/communications'
  }),
  reference_completed: (referenceName: string) => ({
    title: 'Reference verified',
    message: `${referenceName} completed your reference verification. Your trust score has been updated.`,
    actionUrl: '/profile/strength'
  }),
  badge_earned: (badgeName: string) => ({
    title: 'New badge earned',
    message: `You earned the "${badgeName}" badge. It's now visible on your profile.`,
    actionUrl: '/profile/strength'
  }),
  profile_nudge: (completionPct: number, nextStep: string) => ({
    title: 'Complete your profile',
    message: `Your profile is ${completionPct}% complete. ${nextStep} to unlock more visibility.`,
    actionUrl: '/profile/build'
  }),
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const { caregiverId, type, title, message, actionUrl, metadata } = params

  // Deduplication: for profile_viewed, don't create duplicate within 1 hour from same agency
  if (type === 'profile_viewed' && metadata?.agency_id) {
    const existing = await pool.query(
      `SELECT id FROM caregiver_notifications
       WHERE caregiver_id = $1
       AND type = 'profile_viewed'
       AND metadata->>'agency_id' = $2
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [caregiverId, String(metadata.agency_id)]
    )
    if (existing.rows.length > 0) {
      return // Skip insert, return silently
    }
  }

  await pool.query(
    `INSERT INTO caregiver_notifications
     (caregiver_id, type, title, message, action_url, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [caregiverId, type, title, message, actionUrl || null, JSON.stringify(metadata || {})]
  )
}