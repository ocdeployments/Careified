import { MetadataRoute } from 'next'
import { pool } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://careified.ca'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/for-caregivers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-agencies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-families`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic: caregiver profiles (locale-scoped to CA only for now)
  try {
    const { rows: caregivers } = await pool.query(
      `SELECT id, verify_slug, updated_at 
       FROM caregivers 
       WHERE status = 'complete' 
       AND locale = 'CA'
       AND verify_slug IS NOT NULL
       LIMIT 1000`
    )

    const caregiverPages = caregivers.map((cg) => ({
      url: `${baseUrl}/verify/${cg.verify_slug}`,
      lastModified: new Date(cg.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    return [...staticPages, ...caregiverPages]
  } catch {
    // If DB fails, return static pages only
    return staticPages
  }
}
