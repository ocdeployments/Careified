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

  const statusStyle = getStatusColor(call.status)
  const recStyle = getRecColor(call.recommendation)

  return (
    <AgencyShell title="Call Transcript" subtitle={call.campaignTitle}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        {/* Back Link */}
        <Link
          href={`/agency/airecruit/${campaignId}`}
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
          Back to Campaign
        </Link>

        {/* Call Summary Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Candidate</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#0D1B3E' }}>
                  {call.candidateName || maskPhone(call.phoneNumber)}
                </div>
              </div>
              <span style={{
                display: 'inline-block',
                background: statusStyle.bg,
                color: statusStyle.color,
                borderRadius: '99px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {call.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Duration</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0D1B3E' }}>
                  {formatDuration(call.duration)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Date</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0D1B3E' }}>
                  {call.completedAt ? formatDate(call.completedAt) : '-'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Score</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#C9A84C' }}>
                  {call.rawScore !== null ? `${Math.round(call.rawScore)}%` : '-'}
                </div>
              </div>
              <span style={{
                display: 'inline-block',
                background: recStyle.bg,
                color: recStyle.color,
                borderRadius: '99px',
                padding: '6px 16px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {call.recommendation || 'Not scored'}
              </span>
            </div>
          </div>
        </div>

        {/* Score Breakdown Section */}
        {scoreData && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '20px',
              color: '#0D1B3E',
              marginBottom: '16px'
            }}>
              AI Screening Analysis
            </h2>

            {scoreData.summary && (
              <p style={{ fontSize: '14px', color: '#1E293B', lineHeight: 1.6, marginBottom: '20px' }}>
                {scoreData.summary}
              </p>
            )}

            {scoreData.flags && scoreData.flags.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertTriangle size={16} color="#DC2626" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626' }}>Flags</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {scoreData.flags.map((flag: string, i: number) => (
                    <span key={i} style={{
                      background: '#FEE2E2',
                      color: '#DC2626',
                      borderRadius: '99px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {scoreData.questionScores && scoreData.questionScores.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0D1B3E', marginBottom: '16px' }}>
                  Question-by-Question Analysis
                </h3>
                {scoreData.questionScores.map((qs: any, i: number) => (
                  <div key={i} style={{
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>
                      Q{i + 1}: {qs.question}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic', marginBottom: '12px' }}>
                      "{qs.answer}"
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${qs.score}%`,
                          height: '100%',
                          background: qs.score >= 70 ? '#16A34A' : qs.score >= 40 ? '#CA8A04' : '#DC2626',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E', minWidth: '40px' }}>
                        {qs.score}%
                      </span>
                    </div>
                    {qs.rationale && (
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
                        {qs.rationale}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {scoreData.confidence && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>AI Confidence</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E' }}>{scoreData.confidence}%</span>
                </div>
                <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${scoreData.confidence}%`,
                    height: '100%',
                    background: '#C9A84C',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcript Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '20px',
            color: '#0D1B3E',
            marginBottom: '16px'
          }}>
            Full Transcript
          </h2>

          {!call.transcript ? (
            <p style={{ fontSize: '14px', color: '#64748B' }}>Transcript not available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {call.transcript.split('\n').map((line: string, i: number) => {
                const isAI = line.startsWith('AI:')
                const isUser = line.startsWith('User:')
                const content = line.replace(/^(AI:|User:)\s*/, '')

                if (!content.trim()) return null

                return (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      background: isAI ? '#0D1B3E' : 'rgba(201, 168, 76, 0.1)',
                      color: isAI ? 'white' : '#0D1B3E',
                      borderRadius: '12px',
                      padding: '12px 16px'
                    }}>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px',
                        opacity: 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isAI ? <Bot size={10} /> : <User size={10} />}
                        {isAI ? 'Alex' : 'Candidate'}
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
                        {content}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p style={{
          fontSize: '12px',
          color: '#94A3B8',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          This analysis was generated by AI and is provided for informational purposes only.
          All hiring decisions remain the sole responsibility of the agency.
          Careified does not recommend, endorse, or vouch for any candidate.
        </p>
      </div>
    </AgencyShell>
  )
}
