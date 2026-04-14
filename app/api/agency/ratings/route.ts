import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'
});

// Demo agency ID
const AGENCY_ID = 'demo-agency-id';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { relationshipId, reliability, punctuality, warmth, dignity, hygiene, skillsMatch, wouldReengage, publicComment } = body;
    
    // Validate
    if (!reliability || !punctuality || !warmth || !dignity || !hygiene || !skillsMatch || wouldReengage === undefined) {
      return NextResponse.json({ error: 'All rating fields required' }, { status: 400 });
    }
    
    // Get relationship to find caregiverId
    const relResult = await pool.query(
      'SELECT "caregiverId" FROM agency_caregiver_relationships WHERE id = $1',
      [relationshipId]
    );
    
    if (relResult.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }
    
    const caregiverId = relResult.rows[0].caregiverId;
    
    // Check if rating already exists
    const existing = await pool.query(
      'SELECT id FROM agency_ratings WHERE "relationshipId" = $1',
      [relationshipId]
    );
    
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Rating already exists for this relationship' }, { status: 400 });
    }
    
    // Create rating
    const ratingResult = await pool.query(`
      INSERT INTO agency_ratings (
        "relationshipId", "agencyId", "caregiverId",
        reliability, punctuality, warmth, dignity, hygiene, "skillsMatch",
        "wouldReengage", "publicComment", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING id
    `, [relationshipId, AGENCY_ID, caregiverId, reliability, punctuality, warmth, dignity, hygiene, skillsMatch, wouldReengage, publicComment]);
    
    // Calculate and update caregiver aggregate score
    const ratingsResult = await pool.query(`
      SELECT reliability, punctuality, warmth, dignity, hygiene, "skillsMatch"
      FROM agency_ratings WHERE "caregiverId" = $1
    `, [caregiverId]);
    
    if (ratingsResult.rows.length > 0) {
      const totalScore = ratingsResult.rows.reduce((sum: number, r: any) => {
        const avg = (r.reliability + r.punctuality + r.warmth + r.dignity + r.hygiene + r.skillsMatch) / 6;
        return sum + avg;
      }, 0);
      
      const aggregateScore = totalScore / ratingsResult.rows.length;
      
      await pool.query(
        'UPDATE caregivers SET "aggregateScore" = $1, "ratingCount" = $2 WHERE id = $3',
        [Math.round(aggregateScore * 10) / 10, ratingsResult.rows.length, caregiverId]
      );
    }
    
    return NextResponse.json({ success: true, ratingId: ratingResult.rows[0].id });
    
  } catch (error) {
    console.error('Rating submission error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
