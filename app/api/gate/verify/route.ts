import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password, redirect: redirectTo } = await req.json()
  const correct = process.env.BETA_PASSWORD

  if (!correct) {
    return NextResponse.json({ error: 'Gate not configured' }, { status: 500 })
  }

  if (password !== correct) {
    return NextResponse.json({ error: 'Invalid' }, { status: 401 })
  }

  const response = NextResponse.json({ redirect: redirectTo || '/' })
  response.cookies.set('beta_access', correct, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return response
}