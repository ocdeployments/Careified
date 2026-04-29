import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, FileText } from 'lucide-react'
import AgencyShell from '@/components/shells/AgencyShell'

interface Props {
  params: Promise<{ campaignId: string }>
}

export default async function CampaignDetailPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { campaignId } = await params

  const { rows: campaignRows } = await pool.query(
    `SELECT c.*, a.id as "agencyId"
     FROM "AIRecruitCampaign" c
     JOIN agencies a ON a.id = c."agencyId"
     WHERE c.id = $1 AND a.clerk_user_id = $2 LIMIT 1`,
    [campaignId, userId]
  )
  if (!campaignRows.length) notFound()
  const campaign = campaignRows[0]

  const { rows: calls } = await pool.query(
    `SELECT 
      id, "phoneNumber", "candidateName", status,
      "callStatus", "rawScore", recommendation,
      duration, "completedAt", "callbackRequestedAt",
      "callbackNotes", "createdAt"
     FROM "AIRecruitCall"
     WHERE "campaignId" = $1
     ORDER BY 
       CASE recommendation 
         WHEN 'advance' THEN 1 
         WHEN 'review' THEN 2 
         WHEN 'pass' THEN 3 
         ELSE 4 
       END,
       "rawScore" DESC NULLS LAST`,
    [campaign.id]
  )

  const maskPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 11) {
      return `+${digits[0]} (${digits.slice(1, 4)}) ***-**${digits.slice(-2)}`
    }
    return phone
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#DCFCE7', color: '#16A34A' }
      case 'calling': return { bg: '#DBEAFE', color: '#1D4ED8' }
      case 'pending': return { bg: '#F1F5F9', color: '#64748B' }
      case 'failed': return { bg: '#FEE2E2', color: '#DC2626' }
      case 'suppressed': return { bg: '#FED7AA', color: '#EA580C' }
      case 'opted_out': return { bg: '#FEE2E2', color: '#DC2626' }
      case 'queued_compliance': return { bg: '#FEF9C3', color: '#CA8A04' }
      default: return { bg: '#F1F5F9', color: '#64748B' }
    }
  }

  const getRecColor = (rec: string | null) => {
    switch (rec) {
      case 'advance': return { bg: '#DCFCE7', color: '#16A34A' }
      case 'review': return { bg: '#FEF9C3', color: '#CA8A04' }
      case 'pass': return { bg: '#FEE2E2', color: '#DC2626' }
      default: return { bg: '#F1F5F9', color: '#64748B' }
    }
  }

  const advanceCount = calls.filter(c => c.recommendation === 'advance').length
  const reviewCount = calls.filter(c => c.recommendation === 'review').length
  const passCount = calls.filter(c => c.recommendation === 'pass').length
  const completionRate = campaign.totalCandidates > 0
    ? Math.round((campaign.callsCompleted / campaign.totalCandidates) * 100)
    : 0

  return (
    <AgencyShell title={campaign.title} subtitle="AIRecruit Campaign">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        {/* Back Link */}
        <Link
          href="/agency/airecruit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748B',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={16} />
          All Campaigns
        </Link>

        {/* Campaign Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>
              {campaign.totalCandidates || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Candidates
            </div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#16A34A', marginBottom: '4px' }}>
              {campaign.callsCompleted || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Calls Completed
            </div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#CA8A04', marginBottom: '4px' }}>
              {campaign.callsPending || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Calls Pending
            </div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#C9A84C', marginBottom: '4px' }}>
              {completionRate}%
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completion Rate
            </div>
          </div>
        </div>

        {/* Recommendation Summary Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#DCFCE7',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#16A34A', marginBottom: '4px' }}>
              {advanceCount}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>
              Advance
            </div>
          </div>
          <div style={{
            background: '#FEF9C3',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#CA8A04', marginBottom: '4px' }}>
              {reviewCount}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#CA8A04' }}>
              Review
            </div>
          </div>
          <div style={{
            background: '#FEE2E2',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', marginBottom: '4px' }}>
              {passCount}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>
              Pass
            </div>
          </div>
        </div>

        {/* Calls Table */}
        {calls.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '48px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#64748B' }}>
              No calls found for this campaign
            </p>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Candidate</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Score</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Recommendation</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Duration</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Called At</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Callback</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => {
                  const statusStyle = getStatusColor(call.status)
                  const recStyle = getRecColor(call.recommendation)
                  return (
                    <tr key={call.id} style={{ borderBottom: '1px solid #F1F5F9', background: 'white' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>
                        {call.candidateName || maskPhone(call.phoneNumber)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-block', background: statusStyle.bg, color: statusStyle.color, borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                          {call.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1E293B', textAlign: 'center' }}>
                        {call.rawScore !== null ? `${Math.round(call.rawScore)}%` : 'Pending'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-block', background: recStyle.bg, color: recStyle.color, borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                          {call.recommendation || 'Not scored'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1E293B', textAlign: 'center' }}>
                        {formatDuration(call.duration)}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748B' }}>
                        {new Date(call.completedAt || call.createdAt).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Toronto' })}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748B' }}>
                        {call.callbackRequestedAt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} color="#C9A84C" />
                            {formatDate(call.callbackRequestedAt)}
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {call.status === 'completed' && (
                          <Link
                            href={`/agency/airecruit/${campaign.id}/${call.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#C9A84C',
                              textDecoration: 'none',
                              border: '1px solid #C9A84C',
                              borderRadius: '6px'
                            }}
                          >
                            <FileText size={14} />
                            View Transcript
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AgencyShell>
  )
}
