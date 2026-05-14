import { NextResponse } from 'next/server'

export async function GET() {
  const csv = 'first_name,last_name,email,phone,role,years_experience,city,province_state\nJane,Smith,jane@example.com,6471234567,PSW,3,Toronto,ON'

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="careified-roster-template.csv"',
    },
  })
}