import CommunicationConsents from '@/components/profile/CommunicationConsents'

export default function CommunicationsSettingsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '40px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="/settings" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>
            Settings
          </a>
          <span style={{ color: '#94A3B8', margin: '0 8px' }}>/</span>
          <span style={{ fontSize: '13px', color: '#0D1B3E' }}>Communications</span>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E2E8F0' }}>
          <CommunicationConsents mode="settings" />
        </div>
      </div>
    </div>
  )
}
