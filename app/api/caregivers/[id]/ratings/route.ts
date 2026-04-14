import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caregiverId } = await params;
    
    const result = await pool.query(`
      SELECT 
        r.id,
        a.name as "agencyName",
        r.reliability,
        r.punctuality,
        r.warmth,
        r.dignity,
        r.hygiene,
        r."skillsMatch",
        r."wouldReengage",
        r."publicComment",
        r."createdAt"
      FROM agency_ratings r
      JOIN agencies a ON r."agencyId" = a.id
      WHERE r."caregiverId" = $1
      ORDER BY r."createdAt" DESC
    `, [caregiverId]);
    
    return NextResponse.json({ ratings: result.rows });
    
  } catch (error) {
    console.error('Ratings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings', ratings: [] }, { status: 500 });
  }
}
