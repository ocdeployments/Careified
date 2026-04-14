import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'
});

export async function POST(request: NextRequest) {
 try {
  const body = await request.json();
  const { relationshipId, shiftDate, startTime, endTime, hoursWorked, status, notes } = body;
 
  // Create shift
  const shiftResult = await pool.query(`
   INSERT INTO caregiver_shifts (
    "relationshipId", "shiftDate", "startTime", "endTime", 
    "hoursWorked", status, notes, "createdAt"
   ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
   RETURNING id
  `, [relationshipId, shiftDate, startTime, endTime, hoursWorked, status, notes]);
 
  // Update relationship stats
  const updateData: any = {
   totalShifts: 1,
  };
 
  if (status === 'no_show') {
   updateData.noShowCount = 1;
  }
 
  // Build the update query dynamically
  const setClauses: string[] = [];
  const params: any[] = [relationshipId];
  let paramIndex = 2;
 
  setClauses.push(`"totalShifts" = "totalShifts" + $${paramIndex++}`);
  params.push(1);
  
  if (status === 'no_show') {
   setClauses.push(`"noShowCount" = "noShowCount" + $${paramIndex++}`);
   params.push(1);
  }
  
  setClauses.push(`"lastShiftDate" = $${paramIndex++}`);
  params.push(shiftDate);
  
  setClauses.push(`"updatedAt" = NOW()`);
 
  await pool.query(`
   UPDATE agency_caregiver_relationships 
   SET ${setClauses.join(', ')}
   WHERE id = $1
  `, params);
 
  return NextResponse.json({ success: true, shiftId: shiftResult.rows[0].id });
 
 } catch (error) {
  console.error('Shift log error:', error);
  return NextResponse.json({ error: 'Failed to log shift' }, { status: 500 });
 }
}
