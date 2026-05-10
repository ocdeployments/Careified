import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getInviteData(token: string) {
  const result = await pool.query(
    `SELECT tm.*, a.name as agency_name 
     FROM agency_team_members tm
     JOIN agencies a ON a.id = tm.agency_id
     WHERE tm.invite_token = $1`,
    [token]
  )
  return result.rows[0] || null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await getInviteData(token)

  if (!invite) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  if (invite.status === 'active') {
    return NextResponse.redirect(new URL('/sign-in?already_joined=true', request.url))
  }

  if (invite.status === 'suspended') {
    return NextResponse.redirect(new URL('/404?reason=suspended', request.url))
  }

  const searchParams = new URL(request.url).searchParams
  const error = searchParams.get('error')

  return NextResponse.next()
}

export default async function JoinAgencyPage({ params, searchParams }: { params: Promise<{ token: string }>, searchParams: Promise<{ error?: string }> }) {
  const { token } = await params
  const error = (await searchParams)?.error

  const invite = await getInviteData(token)

  if (!invite || invite.status === 'suspended') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F7F4F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '400px',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <h1 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '28px',
            color: '#0D1B3E',
            marginBottom: '16px'
          }}>
            {error === 'expired' ? 'Invitation Expired' : 'Invitation Not Found'}
          </h1>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            color: '#64748B',
            marginBottom: '24px'
          }}>
            {error === 'expired' 
              ? 'This invitation link has expired. Contact your agency administrator for a new invitation.'
              : 'This invitation link is invalid or has expired.'}
          </p>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#0D1B3E',
            textDecoration: 'none',
            fontFamily: '"DM Sans", sans-serif'
          }}>
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (invite.status === 'active') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F7F4F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '400px',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <h1 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '28px',
            color: '#0D1B3E',
            marginBottom: '16px'
          }}>
            Already Joined
          </h1>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            color: '#64748B',
            marginBottom: '24px'
          }}>
            You are already a member of {invite.agency_name}.
          </p>
          <Link href="/agency/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#0D1B3E',
            textDecoration: 'none',
            fontFamily: '"DM Sans", sans-serif'
          }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    owner: '#C9973A',
    coordinator: '#0D1B3E',
    viewer: '#64748B'
  }

  const roleColor = roleColors[invite.role] || '#0D1B3E'

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0D1B3E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid #E2E8F0'
      }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '32px',
          color: '#0D1B3E',
          marginBottom: '8px'
        }}>
          You have been Invited
        </h1>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          color: '#64748B',
          marginBottom: '32px'
        }}>
          {invite.first_name} {invite.last_name}, join the team at {invite.agency_name}
        </p>

        <div style={{
          backgroundColor: '#F7F4F0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '12px',
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Agency
            </span>
            <p style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '18px',
              color: '#0D1B3E',
              fontWeight: 600,
              margin: '4px 0 0 0'
            }}>
              {invite.agency_name}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '12px',
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Your Role
              </span>
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '16px',
                color: roleColor,
                fontWeight: 600,
                margin: '4px 0 0 0'
              }}>
                {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
              </p>
            </div>
            <div>
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '12px',
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Your Email
              </span>
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '16px',
                color: '#0D1B3E',
                margin: '4px 0 0 0'
              }}>
                {invite.email}
              </p>
            </div>
          </div>
        </div>

        <Link 
          href={`/sign-up?agency_invite=${token}&email=${encodeURIComponent(invite.email)}`}
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            color: '#0D1B3E',
            borderRadius: '8px',
            textDecoration: 'none',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box'
          }}
        >
          Accept Invitation
        </Link>

        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '14px',
          color: '#94A3B8',
          marginTop: '16px'
        }}>
          Already have an account?{' '}
          <Link href={`/sign-in?agency_invite=${token}&email=${encodeURIComponent(invite.email)}`} style={{ color: '#C9973A', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await getInviteData(token)
  
  return {
    title: invite ? `Join ${invite.agency_name} | Careified` : 'Invalid Invitation | Careified',
  }
}
