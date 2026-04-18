import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Use shared pool from lib/db.ts - NO hardcoded credentials
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false }
})

async function handleSearch(request: NextRequest) {
  try {
    let f: Record<string, any> = {}
    
    // Support both GET (query params) and POST (body)
    if (request.method === 'POST') {
      const body = await request.json()
      f = body.filters || body
    } else {
      const { searchParams } = new URL(request.url)
      searchParams.forEach((value, key) => {
        if (value) f[key] = value
      })
    }
    
    // Get filter parameters
    const city = f.city
    const state = f.state
    const specializations = f.specializations
    const availabilityStatus = f.availabilityStatus
    const minScore = f.minScore
    const credentials = f.credentials
    const placementTypes = f.placementTypes
    const languages = f.languages
    const minExperience = f.minExperience
    const searchQuery = f.q || f.searchQuery

    // Build WHERE clause
    let whereConditions = ["status = 'approved'"]
    const queryParams: any[] = []
    let paramCount = 1

    if (city) {
      whereConditions.push(`LOWER(city) = LOWER($${paramCount})`)
      queryParams.push(city)
      paramCount++
    }

    if (state) {
      whereConditions.push(`LOWER(state) = LOWER($${paramCount})`)
      queryParams.push(state)
      paramCount++
    }

    if (specializations) {
      const specArray = specializations.split(',').map((s: string) => s.trim())
      whereConditions.push(`specializations && $${paramCount}::text[]`)
      queryParams.push(specArray)
      paramCount++
    }

    if (availabilityStatus) {
      whereConditions.push(`availability_status = $${paramCount}`)
      queryParams.push(availabilityStatus)
      paramCount++
    }

    if (minScore) {
      whereConditions.push(`aggregate_score >= $${paramCount}`)
      queryParams.push(parseFloat(minScore))
      paramCount++
    }

    if (credentials) {
      const credArray = credentials.split(',').map((c: string) => c.trim())
      whereConditions.push(`credentials && $${paramCount}::text[]`)
      queryParams.push(credArray)
      paramCount++
    }

    if (placementTypes) {
      const typeArray = placementTypes.split(',').map((t: string) => t.trim())
      whereConditions.push(`placement_types && $${paramCount}::text[]`)
      queryParams.push(typeArray)
      paramCount++
    }

    if (languages) {
      const langArray = languages.split(',').map((l: string) => l.trim())
      whereConditions.push(`languages && $${paramCount}::text[]`)
      queryParams.push(langArray)
      paramCount++
    }

    if (minExperience) {
      whereConditions.push(`years_experience >= $${paramCount}`)
      queryParams.push(parseInt(minExperience))
      paramCount++
    }

    if (searchQuery) {
      whereConditions.push(`(
        LOWER(first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(last_name) LIKE LOWER($${paramCount}) OR 
        LOWER(job_title) LIKE LOWER($${paramCount})
      )`)
      queryParams.push(`%${searchQuery}%`)
      paramCount++
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    const query = `
      SELECT 
        id, first_name, last_name, job_title, photo_url,
        city, state, bio, specializations, credentials,
        placement_types, languages, availability_status,
        years_experience, aggregate_score, rating_count,
        hourly_rate, hourly_rate_max
      FROM caregivers
      ${whereClause}
      ORDER BY aggregate_score DESC, created_at DESC
      LIMIT 50
    `

    const result = await pool.query(query, queryParams)

    return NextResponse.json({
      success: true,
      caregivers: result.rows,
      count: result.rows.length
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search caregivers', caregivers: [], count: 0 },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleSearch(request)
}

export async function POST(request: NextRequest) {
  return handleSearch(request)
}
