import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, User, Bot } from 'lucide-react'
import AgencyShell from '@/components/shells/AgencyShell'

interface Props {
  params: Promise<{ campaignId: string; callId: string }>
}

export default async function CallTranscriptPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { campaignId, callId } = await params

  const { rows: callRows } = await pool.query(
    `SELECT
      r.*,
      c.title as "campaignTitle",
      c."screeningQuestions",
      a.clerk_user_id as "clerkUserId"
     FROM "AIRecruitCall" r
     JOIN "AIRecruitCampaign" c ON c.id = r."campaignId"
     JOIN agencies a ON a.id = c."agencyId"
     WHERE r.id = $1 AND a.clerk_user_id = $2 LIMIT 1`,
    [callId, userId]
  )
  if (!callRows.length) notFound()
  const call = callRows[0]

  const scoreData = call.scoreBreakdown
    ? (typeof call.scoreBreakdown === 'string'
      ? JSON.parse(call.scoreBreakdown)
      : call.scoreBreakdown)
    : null

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
    return new Date(date).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Toronto'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'rgba(34,197,94,0.3)' }
      case 'calling': return { bg: 'rgba(99,102,241,0.15)', color: '#818CF8', border: 'rgba(99,102,241,0.3)' }
      case 'pending': return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)' }
      case 'failed': return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'rgba(239,68,68,0.3)' }
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

  const statusStyle = getStatusColor(call.status)
  const recStyle = getRecColor(call.recommendation)
  const MUTED = 'rgba(255,255,255,0.55)'

  return (
    <AgencyShell title="Call Transcript" subtitle={call.campaignTitle}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        {/* Back Link */}
        <Link href={`/agency/airecruit/${campaignId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: MUTED, fontSize: '14px', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={16} />
          Back to Campaign
        </Link>

        {/* Call Summary Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px' }}>Candidate</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#F5F0E8' }}>{call.candidateName || maskPhone(call.phoneNumber)}</div>
              </div>
              <span style={{ display: 'inline-block', background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{call.status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px' }}>Duration</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F0E8' }}>{formatDuration(call.duration)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px' }}>Date</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F0E8' }}>{formatDate(call.completedAt || call.createdAt)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px' }}>Score</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#C9973A' }}>{call.rawScore !== null ? `${Math.round(call.rawScore)}%` : '-'}</div>
              </div>
              <span style={{ display: 'inline-block', background: recStyle.bg, color: recStyle.color, border: `1px solid ${recStyle.border}`, borderRadius: '99px', padding: '6px 16px', fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>{call.recommendation || 'Not scored'}</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown Section */}
        {scoreData && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#F5F0E8', marginBottom: '16px' }}>AI Screening Analysis</h2>

            {scoreData.summary && (
              <p style={{ fontSize: '14px', color: '#F5F0E8', lineHeight: 1.6, marginBottom: '20px' }}>{scoreData.summary}</p>
            )}

            {scoreData.flags && scoreData.flags.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertTriangle size={16} color="#EF4444" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>Flags</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {scoreData.flags.map((flag: string, i: number) => (
                    <span key={i} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 500 }}>{flag}</span>
                  ))}
                </div>
              </div>
            )}

            {scoreData.questionScores && scoreData.questionScores.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F5F0E8', marginBottom: '16px' }}>Question-by-Question Analysis</h3>
                {scoreData.questionScores.map((qs: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F0E8', marginBottom: '8px' }}>Q{i + 1}: {qs.question}</div>
                    <div style={{ fontSize: '13px', color: MUTED, fontStyle: 'italic', marginBottom: '12px' }}>"{qs.answer}"</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${qs.score}%`, height: '100%', background: qs.score >= 70 ? '#22C55E' : qs.score >= 40 ? '#CA8A04' : '#EF4444', borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8', minWidth: '40px' }}>{qs.score}%</span>
                    </div>
                    {qs.rationale && <div style={{ fontSize: '12px', color: MUTED, marginTop: '8px' }}>{qs.rationale}</div>}
                  </div>
                ))}
              </div>
            )}

            {scoreData.confidence && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: MUTED }}>AI Confidence</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8' }}>{scoreData.confidence}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${scoreData.confidence}%`, height: '100%', background: '#C9973A', borderRadius: '3px' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcript Section */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#F5F0E8', marginBottom: '16px' }}>Full Transcript</h2>

          {!call.transcript ? (
            <p style={{ fontSize: '14px', color: MUTED }}>Transcript not available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {call.transcript.split('\n').map((line: string, i: number) => {
                const isAI = line.startsWith('AI:')
                const isUser = line.startsWith('User:')
                const content = line.replace(/^(AI:|User:)\s*/, '')

                if (!content.trim()) return null

                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', background: isAI ? '#0D1B3E' : 'rgba(201,151,58,0.15)', color: isAI ? 'white' : '#F5F0E8', border: `1px solid ${isAI ? 'transparent' : 'rgba(201,151,58,0.3)'}`, borderRadius: '12px', padding: '12px 16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isAI ? <Bot size={10} /> : <User size={10} />}
                        {isAI ? 'Alex' : 'Candidate'}
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{content}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: '12px', color: MUTED, textAlign: 'center', lineHeight: 1.5 }}>
          This analysis was generated by AI and is provided for informational purposes only.
          All hiring decisions remain the sole responsibility of the agency.
          Careified does not recommend, endorse, or vouch for any candidate.
        </p>
      </div>
    </AgencyShell>
  )
}
