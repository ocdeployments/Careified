import { Pool } from 'pg'

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const dynamic = 'force-dynamic'

export default async function IDCardPage({
  params
}: {
  params: Promise<{ caregiverId: string }>
}) {
  const { caregiverId } = await params
  
  // Debug output
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
        {JSON.stringify({ caregiverId, env: !!process.env.DATABASE_URL }, null, 2)}
      </pre>
    </div>
  )
}
