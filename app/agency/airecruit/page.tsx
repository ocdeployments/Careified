import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Phone, ArrowRight } from 'lucide-react'
import AgencyShell from '@/components/shells/AgencyShell'

export default async function AIRecruitPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { rows: agencyRows } = await pool.query(
    `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
    [userId]
  )
  if (!agencyRows.length) redirect('/agency/pending-approval')
  const agencyId = agencyRows[0].id

  const { rows: campaigns } = await pool.query(
    `SELECT 
      id, title, status, "totalCandidates",
      "callsCompleted", "callsPending", "callsFailed",
      "createdAt"
     FROM "AIRecruitCampaign"
     WHERE "agencyId" = $1
     ORDER BY "createdAt" DESC`,
    [agencyId]
  )

  const totalCalls = campaigns.reduce((sum, c) => sum + (c.callsCompleted || 0), 0)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#DBEAFE', color: '#1D4ED8' }
      case 'completed': return { bg: '#DCFCE7', color: '#16A34A' }
      default: return { bg: '#F1F5F9', color: '#64748B' }
    }
  }

  return (
    <AgencyShell title="AIRecruit" subtitle="AI-Powered Hiring">
      {/* Hero Band */}
      <div style={{
        background: '#0D1B3E',
        padding: '48px 24px',
        marginBottom: '32px'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* Left side */}
          <div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid #C9A84C',
              borderRadius: '99pxpx',
              padding: '4px 12px',
              fontSize: '11px',
              color: '#C9A84C',
              fontWeight: 600,
              letterSpacing: '0.1em',
              marginBottom: '16px'
            }}>
              BETA
            </div>
            <h1 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'white',
              marginBottom: '12px'
            }}>
              AIRecruit
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.6
            }}>
              Screen caregiver candidates automatically with AI voice interviews
            </p>
          </div>

          {/* Right side - stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '4px'
              }}>
                {campaigns.length}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Total Campaigns
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '4px'
              }}>
                {totalCalls}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Calls Made
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table Section */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px 48px'
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '24px',
            color: '#0D1B3E'
          }}>
            Your Campaigns
          </h2>
          <Link
            href="/agency/airecruit/new"
            style={{
              background: '#C9A84C',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            New Campaign
          </Link>
        </div>

        {campaigns.length === 0 ? (
          /* Empty State */
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '64px 32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(201, 168, 76, 0.1)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Phone size={32} color="#C9A84C" />
            </div>
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '20px',
              color: '#0D1B3E',
              marginBottom: '8px'
            }}>
              No campaigns yet
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              marginBottom: '24px'
            }}>
              Create your first campaign to start screening candidates
            </p>
            <Link
              href="/agency/airecruit/new"
              style={{
                display: 'inline-block',
                background: '#C9A84C',
                color: 'white',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          /* Campaigns Table */
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{
                    padding: '14px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Campaign
                  </th>
                  <th style={{
                    padding: '14px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '14px 20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Candidates
                  </th>
                  <th style={{
                    padding: '14px 20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Completed
                  </th>
                  <th style={{
                    padding: '14px 20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Pending
                  </th>
                  <th style={{
                    padding: '14px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Created
                  </th>
                  <th style={{
                    padding: '14px 20px',
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const statusStyle = getStatusColor(campaign.status)
                  return (
                    <tr key={campaign.id} style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: 'white'
                    }}>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1E293B'
                      }}>
                        {campaign.title}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
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
                          {campaign.status}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#1E293B',
                        textAlign: 'center'
                      }}>
                        {campaign.totalCandidates || 0}
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#1E293B',
                        textAlign: 'center'
                      }}>
                        {campaign.callsCompleted || 0}
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#1E293B',
                        textAlign: 'center'
                      }}>
                        {campaign.callsPending || 0}
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#64748B'
                      }}>
                        {formatDate(campaign.createdAt)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <Link
                          href={`/agency/airecruit/${campaign.id}`}
                          style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#C9A84C',
                            textDecoration: 'none',
                            border: '1px solid #C9A84C',
                            borderRadius: '6px'
                          }}
                        >
                          View Results
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div style={{
        background: '#F5F3EE',
        padding: '64px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '32px',
            color: '#0D1B3E',
            marginBottom: '48px'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            alignItems: 'start'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#0D1B3E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                1
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0D1B3E',
                marginBottom: '8px'
              }}>
                Select candidates
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                From your Careified shortlist
              </p>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
              <ArrowRight size={20} color="#C9A84C" />
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#0D1B3E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                2
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0D1B3E',
                marginBottom: '8px'
              }}>
                AIRecruit calls
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                Each candidate automatically
              </p>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
              <ArrowRight size={20} color="#C9A84C" />
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#0D1B3E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                3
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0D1B3E',
                marginBottom: '8px'
              }}>
                AI interviews
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                Conducts structured screening
              </p>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
              <ArrowRight size={20} color="#C9A84C" />
            </div>

            {/* Step 4 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#0D1B3E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                4
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0D1B3E',
                marginBottom: '8px'
              }}>
                You receive results
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                Scores, transcripts, next steps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#0D1B3E',
            marginBottom: '12px'
          }}>
            Ready to automate your hiring?
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#0D1B3E',
            opacity: 0.8,
            marginBottom: '24px'
          }}>
            Create a campaign to start screening candidates with AI voice interviews.
          </p>
          <Link
            href="/agency/airecruit/new"
            style={{
              display: 'inline-block',
              background: '#0D1B3E',
              color: 'white',
              borderRadius: '99px',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Create Campaign
          </Link>
        </div>
      </div>
    </AgencyShell>
  )
}
