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
      case 'completed': return { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'rgba(34,197,94,0.3)' }
      case 'calling': return { bg: 'rgba(99,102,241,0.15)', color: '#818CF8', border: 'rgba(99,102,241,0.3)' }
      case 'pending': return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)' }
      case 'failed': return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'rgba(239,68,68,0.3)' }
      case 'suppressed': return { bg: 'rgba(234,88,12,0.15)', color: '#EA580C', border: 'rgba(234,88,12,0.3)' }
      case 'opted_out': return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'rgba(239,68,68,0.3)' }
      case 'queued_compliance': return { bg: 'rgba(202,138,4,0.15)', color: '#CA8A04', border: 'rgba(202,138,4,0.3)' }
      default: return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)' }
    }
  }

  const getRecColor = (rec: string | null) => {
    switch (rec) {
      case 'advance': return { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'rgba(34,197,94,0.3)' }
      case 'review': return { bg: 'rgba(202,138,4,0.15)', color: '#CA8A04', border: 'rgba(202,138,4,0.3)' }
      case 'pass': return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'rgba(239,68,68,0.3)' }
      default: return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)' }
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
        <Link href="/agency/airecruit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '14px', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={16} />
          All Campaigns
        </Link>

        {/* Campaign Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#F5F0E8', marginBottom: '4px' }}>{campaign.totalCandidates || 0}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Candidates</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#22C55E', marginBottom: '4px' }}>{campaign.callsCompleted || 0}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calls Completed</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#CA8A04', marginBottom: '4px' }}>{campaign.callsPending || 0}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calls Pending</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#C9973A', marginBottom: '4px' }}>{completionRate}%</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion Rate</div>
          </div>
        </div>

        {/* Recommendation Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(34,197,94,0.15)', borderRadius: '8px', padding: '16px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#22C55E', marginBottom: '4px' }}>{advanceCount}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#22C55E' }}>Advance</div>
          </div>
          <div style={{ background: 'rgba(202,138,4,0.15)', borderRadius: '8px', padding: '16px', textAlign: 'center', border: '1px solid rgba(202,138,4,0.3)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#CA8A04', marginBottom: '4px' }}>{reviewCount}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#CA8A04' }}>Review</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.15)', borderRadius: '8px', padding: '16px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#EF4444', marginBottom: '4px' }}>{passCount}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444' }}>Pass</div>
          </div>
        </div>

        {/* Calls Table */}
        {calls.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>No calls found for this campaign</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Candidate', 'Status', 'Score', 'Recommendation', 'Duration', 'Called At', 'Callback', 'Action'].map((h, i) => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: i === 2 || i === 4 ? 'center' : i === 7 ? 'right' : 'left', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => {
                  const statusStyle = getStatusColor(call.status)
                  const recStyle = getRecColor(call.recommendation)
                  return (
                    <tr key={call.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500, color: '#F5F0E8' }}>{call.candidateName || maskPhone(call.phoneNumber)}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-block', background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{call.status}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#F5F0E8', textAlign: 'center' }}>{call.rawScore !== null ? `${Math.round(call.rawScore)}%` : 'Pending'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-block', background: recStyle.bg, color: recStyle.color, border: `1px solid ${recStyle.border}`, borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{call.recommendation || 'Not scored'}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#F5F0E8', textAlign: 'center' }}>{formatDuration(call.duration)}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>{new Date(call.completedAt || call.createdAt).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Toronto' })}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
                        {call.callbackRequestedAt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} color="#C9973A" />
                            {formatDate(call.callbackRequestedAt)}
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {call.status === 'completed' && (
                          <Link href={`/agency/airecruit/${campaign.id}/${call.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 500, color: '#C9973A', textDecoration: 'none', border: '1px solid rgba(201,151,58,0.4)', borderRadius: '6px' }}>
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
