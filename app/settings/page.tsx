import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/settings')

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '40px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: '#0D1B3E', marginBottom: '16px' }}>
          Settings
        </h1>
        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.6 }}>
          Account settings will be available at launch.
        </p>
        <div style={{ marginTop: '24px', padding: '20px', background: '#FDF6EC', borderRadius: '12px', border: '1px solid #C9973A' }}>
          <p style={{ fontSize: '14px', color: '#0D1B3E', fontWeight: 500 }}>
            In the meantime, you can manage your:
          </p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px', color: '#64748B', fontSize: '14px', lineHeight: 1.8 }}>
            <li><a href="/settings/communications" style={{ color: '#1E3A8A', textDecoration: 'none' }}>Communication preferences</a></li>
            <li><a href="/settings/data-rights" style={{ color: '#1E3A8A', textDecoration: 'none' }}>Data rights (export & deletion)</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}