import { pool } from '@/lib/db'
import { getAuditLogs } from '@/lib/security/audit'
import { Shield, Users, TrendingUp, Clock } from 'lucide-react'

async function getStats() {
  const [caregiverCount, agencyCount, recentLogs] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM caregivers'),
    pool.query('SELECT COUNT(*) as count FROM agencies'),
    getAuditLogs(5),
  ])
  
  return {
    caregivers: parseInt(caregiverCount.rows[0]?.count || '0'),
    agencies: parseInt(agencyCount.rows[0]?.count || '0'),
    recentLogs,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <h1 style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: '28px',
        color: '#0D1B3E',
        marginBottom: '8px',
      }}>
        Admin Dashboard
      </h1>
      <p style={{ color: '#64748B', marginBottom: '32px' }}>
        Overview of Careified platform
      </p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#C9A84C/10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#C9A84C" />
            </div>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Total Caregivers</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0D1B3E' }}>{stats.caregivers.toLocaleString()}</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0D1B3E/10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#0D1B3E" />
            </div>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Total Agencies</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0D1B3E' }}>{stats.agencies.toLocaleString()}</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#10B981/10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="#10B981" />
            </div>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>System Status</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#10B981' }}>Operational</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0D1B3E', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} />
          Recent Admin Activity
        </h2>
        
        {stats.recentLogs.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>No recent admin activity</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Action</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Table</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Admin</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLogs.map((log: any) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 0', fontSize: '14px', color: '#0D1B3E' }}>{log.action}</td>
                  <td style={{ padding: '12px 0', fontSize: '14px', color: '#64748B' }}>{log.table || '-'}</td>
                  <td style={{ padding: '12px 0', fontSize: '14px', color: '#64748B' }}>{log.adminId.slice(0, 8)}...</td>
                  <td style={{ padding: '12px 0', fontSize: '14px', color: '#94A3B8' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
