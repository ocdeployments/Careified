'use client'

interface DemoAgency {
  id: string
  name: string
  created_at: string
  caregiver_count: number
}

interface DemoAgenciesListProps {
  agencies: DemoAgency[]
}

export default function DemoAgenciesList({ agencies }: DemoAgenciesListProps) {
  if (!agencies || agencies.length === 0) return null

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0D1B3E' }}>Demo Accounts</span>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>{agencies.length} demo agency</span>
      </div>
      {agencies.map((a) => (
        <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B3E' }}>{a.name}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Created {new Date(a.created_at).toLocaleDateString('en-CA')}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#64748B' }}>{a.caregiver_count} caregivers</span>
            <form action={`/api/admin/demo/wipe/${a.id}`} method="POST" onSubmit={(e) => { if (!confirm('Are you sure? This cannot be undone.')) e.preventDefault() }}>
              <button type="submit" style={{ fontSize: 11, padding: '4px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>Wipe</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}