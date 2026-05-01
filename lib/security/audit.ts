import { pool } from '@/lib/db'

export interface AuditLogParams {
  adminId: string
  action: string
  recordId?: string
  table?: string
  previousValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
}

/**
 * Log an admin action to the AuditLog table.
 * This should be called by all admin API routes.
 */
export async function logAdminAction({
  adminId,
  action,
  recordId,
  table,
  previousValue,
  newValue,
}: AuditLogParams): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO "AuditLog"
        (id, "adminId", action, "recordId", table, "previousValue", "newValue", "createdAt")
       VALUES
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
      [
        adminId,
        action,
        recordId || null,
        table || null,
        previousValue ? JSON.stringify(previousValue) : null,
        newValue ? JSON.stringify(newValue) : null,
      ]
    )
  } catch (error) {
    // Log to console but don't fail the main operation
    console.error('AUDIT_LOG_ERROR:', error)
  }
}

/**
 * Get recent audit logs (for admin dashboard)
 */
export async function getAuditLogs(limit = 50): Promise<AuditLogParams[]> {
  const { rows } = await pool.query(
    `SELECT "adminId", action, "recordId", table, "previousValue", "newValue", "createdAt"
     FROM "AuditLog"
     ORDER BY "createdAt" DESC
     LIMIT $1`,
    [limit]
  )
  return rows
}
