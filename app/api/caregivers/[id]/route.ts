import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, phone, title, bio, status FROM caregivers WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 });
    }
    
    const c = result.rows[0];
    return NextResponse.json({
      id: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      phone: c.phone,
      title: c.title,
      bio: c.bio,
      status: c.status
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
