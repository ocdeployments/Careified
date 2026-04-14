import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'
});

// Demo agency ID - in production this would come from auth
// Use the first agency from the database for demo
let AGENCY_ID = 'demo-agency-id';

async function getAgencyId() {
  try {
    const result = await pool.query('SELECT id FROM agencies LIMIT 1');
    if (result.rows.length > 0) {
      AGENCY_ID = result.rows[0].id;
    }
  } catch (e) {
    console.log('Using default agency ID');
  }
}

// Initialize agency ID on module load
getAgencyId();

export async function GET(request: NextRequest) {
 try {
  const { searchParams } = new URL(request.url);
  const caregiverId = searchParams.get('caregiverId');
 
  if (!caregiverId) {
   return NextResponse.json({ error: 'Missing caregiverId' }, { status: 400 });
  }
 
  // Check if there's a relationship for this caregiver
  const result = await pool.query(`
   SELECT * FROM agency_caregiver_relationships 
   WHERE "caregiverId" = $1
   LIMIT 1
  `, [caregiverId]);
 
  if (result.rows.length === 0) {
   return NextResponse.json({ relationship: null });
  }
 
  const rel = result.rows[0];
  return NextResponse.json({
   relationship: {
    id: rel.id,
    startDate: rel.startDate,
    employmentType: rel.employmentType,
    currentlyEmployed: rel.currentlyEmployed,
    privateNotes: rel.privateNotes,
    payRate: rel.payRate ? parseFloat(rel.payRate) : null,
    payRateType: rel.payRateType,
    totalShifts: rel.totalShifts,
    noShowCount: rel.noShowCount,
   }
  });
 
 } catch (error) {
  console.error('Roster fetch error:', error);
  return NextResponse.json({ error: 'Failed to fetch relationship' }, { status: 500 });
 }
}

export async function POST(request: NextRequest) {
 try {
  const body = await request.json();
  const { caregiverId, startDate, employmentType, payRate, payRateType, privateNotes } = body;
 
  // Check if already on roster
  const existing = await pool.query(`
   SELECT id FROM agency_caregiver_relationships WHERE "caregiverId" = $1
  `, [caregiverId]);
 
  if (existing.rows.length > 0) {
   return NextResponse.json({ error: 'Already on roster' }, { status: 400 });
  }
 
  // Create relationship
  const result = await pool.query(`
   INSERT INTO agency_caregiver_relationships (
    "agencyId", "caregiverId", "startDate", "employmentType", 
    "currentlyEmployed", "payRate", "payRateType", "privateNotes", "createdAt", "updatedAt"
   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
   RETURNING id
  `, [AGENCY_ID, caregiverId, startDate, employmentType, true, payRate, payRateType, privateNotes]);
 
  return NextResponse.json({ success: true, relationshipId: result.rows[0].id });
 
 } catch (error) {
  console.error('Add to roster error:', error);
  return NextResponse.json({ error: 'Failed to add to roster' }, { status: 500 });
 }
}
