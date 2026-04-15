import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:nFvV7KEqXSX9unj8X7BPdGlIZokqWqi6@187.124.227.63:5432/careified'
});

export async function POST(request: NextRequest) {
 let client;
 try {
  client = await pool.connect();
  
  const body = await request.json();
  
  const { agencyName, businessType, licenseNumber, contactFirstName, contactLastName, contactEmail, contactPhone, streetAddress, city, state, postalCode, acceptedTerms } = body;
  
  // Basic validation
  if (!agencyName || agencyName.length < 2) {
   return NextResponse.json({ error: 'Agency name must be at least 2 characters' }, { status: 400 });
  }
  if (!contactFirstName || !contactLastName) {
   return NextResponse.json({ error: 'First and last name required' }, { status: 400 });
  }
  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
   return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }
  if (!contactPhone) {
   return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }
  if (!streetAddress || !city || !state || !postalCode) {
   return NextResponse.json({ error: 'Full address required' }, { status: 400 });
  }
  if (!acceptedTerms) {
   return NextResponse.json({ error: 'You must accept terms to continue' }, { status: 400 });
  }
  
  // Check if email already exists
  const existing = await client.query('SELECT id FROM users WHERE email = $1', [contactEmail.toLowerCase()]);
  
  if (existing.rows.length > 0) {
   return NextResponse.json({ error: 'This email is already registered. Sign in instead?' }, { status: 400 });
  }
  
  // Begin transaction
  await client.query('BEGIN');
  
  // Create user first
  const userResult = await client.query(
   'INSERT INTO users (email, role, "passwordHash", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
   [contactEmail.toLowerCase(), 'AGENCY', 'demo_' + Date.now()]
  );
  const userId = userResult.rows[0].id;
  
  // Create agency
  const agencyResult = await client.query(
   `INSERT INTO agencies (
     "userId", name, "businessType", "licenseNumber", 
     "contactFirstName", "contactLastName", "contactEmail", "contactPhone",
     address, city, state, "postalCode", country, status,
     "createdAt", "updatedAt"
   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) RETURNING id`,
   [userId, agencyName, businessType || null, licenseNumber || null,
    contactFirstName, contactLastName, contactEmail.toLowerCase(), contactPhone,
    streetAddress, city, state, postalCode, 'US', 'pending']
  );
  
  await client.query('COMMIT');
  
  return NextResponse.json({ success: true, agencyId: agencyResult.rows[0].id });
 
 } catch (error: any) {
  if (client) {
    try { await client.query('ROLLBACK'); } catch(e) {}
  }
  console.error('Agency signup error:', error);
  return NextResponse.json({ error: error.message || 'Signup failed. Please try again.' }, { status: 500 });
 } finally {
  if (client) client.release();
 }
}
