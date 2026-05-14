import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { put, del } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    let userId: string | null | undefined
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (e: any) {
      if (e?.message?.includes('NEXT_REDIRECT') || e?.code === 'NEXT_REDIRECT') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
      }
      console.error('Auth error:', e)
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    // Verify role is caregiver
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const role = user.publicMetadata?.role as string

      if (role !== 'caregiver') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    // Get file from form data
    const formData = await request.formData()
    const file = formData.get('photo') as File | null

    // Validation 1: File must exist
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validation 2: File type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.' },
        { status: 400 }
      )
    }

    // Validation 3: File size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Get caregiver from DB
    const caregiverResult = await pool.query(
      'SELECT id, photo_url FROM caregivers WHERE clerk_id = $1 LIMIT 1',
      [userId]
    )

    if (caregiverResult.rows.length === 0) {
      return NextResponse.json({ error: 'Caregiver profile not found' }, { status: 404 })
    }

    const caregiverId = caregiverResult.rows[0].id
    const existingPhotoUrl = caregiverResult.rows[0].photo_url

    // Delete old photo if it exists and is a Vercel Blob URL
    if (existingPhotoUrl && (existingPhotoUrl.includes('blob.vercel-storage.com') || existingPhotoUrl.includes('public.blob.vercel-storage.com'))) {
      try {
        await del(existingPhotoUrl)
        console.log('Deleted old photo:', existingPhotoUrl)
      } catch (delError) {
        console.warn('Failed to delete old photo:', delError)
        // Continue anyway - don't fail upload over old cleanup
      }
    }

    // Generate filename
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const filename = `caregiver-${caregiverId}-${Date.now()}.${ext}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type
    })

    // Update caregivers table
    await pool.query(
      'UPDATE caregivers SET photo_url = $1, updated_at = NOW() WHERE id = $2',
      [blob.url, caregiverId]
    )

    return NextResponse.json({
      photo_url: blob.url,
      message: 'Photo uploaded successfully'
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Auth check
    let userId: string | null | undefined
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (e: any) {
      if (e?.message?.includes('NEXT_REDIRECT') || e?.code === 'NEXT_REDIRECT') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
      }
      console.error('Auth error:', e)
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    // Verify role is caregiver
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const role = user.publicMetadata?.role as string

      if (role !== 'caregiver') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    // Get caregiver photo_url from DB
    const caregiverResult = await pool.query(
      'SELECT id, photo_url FROM caregivers WHERE clerk_id = $1 LIMIT 1',
      [userId]
    )

    if (caregiverResult.rows.length === 0) {
      return NextResponse.json({ error: 'Caregiver profile not found' }, { status: 404 })
    }

    const caregiverId = caregiverResult.rows[0].id
    const photoUrl = caregiverResult.rows[0].photo_url

    // Check if photo exists
    if (!photoUrl) {
      return NextResponse.json({ error: 'No photo to delete' }, { status: 404 })
    }

    // Delete from Vercel Blob if it's a blob URL
    if (photoUrl.includes('blob.vercel-storage.com') || photoUrl.includes('public.blob.vercel-storage.com')) {
      try {
        await del(photoUrl)
      } catch (delError) {
        console.warn('Failed to delete photo from blob:', delError)
      }
    }

    // Update DB to remove photo_url
    await pool.query(
      'UPDATE caregivers SET photo_url = NULL, updated_at = NOW() WHERE id = $1',
      [caregiverId]
    )

    return NextResponse.json({ message: 'Photo removed' })

  } catch (error) {
    console.error('Photo delete error:', error)
    return NextResponse.json({ error: 'Delete failed. Please try again.' }, { status: 500 })
  }
}