// lib/audit/log.ts
import { Pool } from 'pg'

export type AuditActorType = 'caregiver' | 'agency' | 'admin' | 'system'

export type AuditEvent = {
  actorType: AuditActorType
  actorId: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Write an audit log entry. Non-blocking — errors are logged but never thrown.
 */
export async function logAudit(pool: Pool, event: AuditEvent): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_log (
        actor_type, actor_id, action, resource_type, resource_id,
        metadata, ip_address, user_agent
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        event.actorType,
        event.actorId,
        event.action,
        event.resourceType || null,
        event.resourceId || null,
        JSON.stringify(event.metadata || {}),
        event.ipAddress || null,
        event.userAgent || null,
      ]
    )
  } catch (err) {
    console.error('audit_log write failed (non-fatal):', err)
  }
}
