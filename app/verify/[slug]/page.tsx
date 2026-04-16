import { Pool } from 'pg'
import { notFound } from 'next/navigation'

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const dynamic = 'force-dynamic'

export default async function VerifyPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  
  // Debug: render what we get
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B3E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'monospace',
      padding: '20px',
    }}>
      <pre style={{ fontSize: '14px' }}>
        {JSON.stringify({ slug, env: !!process.env.DATABASE_URL }, null, 2)}
      </pre>
    </div>
  )
}