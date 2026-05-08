import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phoneNumber, phoneVerified, ageConfirmed } = body

    // Find or create caregiver record
    let caregiver = await pool.query(
      'SELECT id FROM caregivers WHERE user_id = $1',
      [userId]
    )

    if (caregiver.rows.length === 0) {
      // Create new caregiver record
      const newCaregiver = await pool.query(
        `INSERT INTO caregivers (user_id, first_name, last_name, phone, phone_verified, age_confirmed, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'incomplete', NOW(), NOW()) RETURNING id`,
        [userId, firstName, lastName, phoneNumber, phoneVerified, ageConfirmed]
      )

      return NextResponse.json({ success: true, caregiverId: newCaregiver.rows[0].id })
    } else {
      // Update existing caregiver
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      if (firstName !== undefined) {
        updates.push(`first_name = $${paramIndex++}`)
        values.push(firstName)
      }
      if (lastName !== undefined) {
        updates.push(`last_name = $${paramIndex++}`)
        values.push(lastName)
      }
      if (phoneNumber !== undefined) {
        updates.push(`phone = $${paramIndex++}`)
        values.push(phoneNumber)
      }
      if (phoneVerified !== undefined) {
        updates.push(`phone_verified = $${paramIndex++}`)
        values.push(phoneVerified)
      }
      if (ageConfirmed !== undefined) {
        updates.push(`age_confirmed = $${paramIndex++}`)
        values.push(ageConfirmed)
      }

      if (updates.length > 0) {
        values.push(userId)
        await pool.query(
          `UPDATE caregivers SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = $${paramIndex}`,
          values
        )
      }

      return NextResponse.json({ success: true })
    }

  } catch (error) {
    console.error('Caregiver update error:', error)
    return NextResponse.json({ error: 'Failed to update caregiver' }, { status: 500 })
  }
}