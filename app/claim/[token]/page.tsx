// Careified — Caregiver Profile Claim Page
// Public page where caregivers claim their agency-created profile

import { Pool } from 'pg'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

interface ClaimPageProps {
  params: Promise<{ token: string }>
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { token } = await params

  // Query caregiver by token
  const { rows: caregiverRows } = await pool.query(
    `SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.city, 
            c.job_title, c.years_experience, c.profile_status,
            c.claim_token_expires_at, c.claimed_at, c.created_by_agency_id,
            a.name as agency_name
     FROM caregivers c
     LEFT JOIN agencies a ON c.created_by_agency_id = a.id
     WHERE c.claim_token = $1`,
    [token]
  )

  // Token not found
  if (caregiverRows.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Link Not Found</h1>
          <p style={styles.text}>
            This invitation link is invalid or has been removed.
          </p>
          <p style={styles.text}>
            Contact your agency for a new invitation.
          </p>
        </div>
      </div>
    )
  }

  const caregiver = caregiverRows[0]

  // Token expired
  if (new Date(caregiver.claim_token_expires_at) < new Date()) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Invitation Expired</h1>
          <p style={styles.text}>
            This link has expired. Contact your agency for a new one.
          </p>
        </div>
      </div>
    )
  }

  // Already claimed — redirect to sign-in
  if (caregiver.claimed_at || caregiver.profile_status === 'complete' || caregiver.profile_status === 'active') {
    redirect('/sign-in')
  }

  // Show claim page with pre-filled data
  const requiredSections = [
    { key: 'availability', label: 'Availability', required: true },
    { key: 'workstyle', label: 'Working Style', required: true },
    { key: 'compliance', label: 'Compliance', required: true },
    { key: 'references', label: 'References', required: false },
  ]

  const completedSections = []
  if (caregiver.years_experience) completedSections.push('experience')
  if (caregiver.city) completedSections.push('location')
  if (caregiver.job_title) completedSections.push('role')

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#0D1B3E"/>
            <path d="M14 24C14 18.477 18.477 14 24 14C29.523 14 34 18.477 34 24" stroke="#C9973A" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="24" cy="28" r="6" stroke="#C9973A" strokeWidth="3"/>
          </svg>
        </div>

        <h1 style={styles.title}>
          Hi {caregiver.first_name}, {caregiver.agency_name} started your profile
        </h1>

        <div style={styles.prefilledSection}>
          <h3 style={styles.sectionTitle}>What {caregiver.agency_name} filled in:</h3>
          <div style={styles.prefilledList}>
            <div style={styles.prefilledItem}>
              <span style={styles.label}>Name:</span> {caregiver.first_name} {caregiver.last_name}
            </div>
            {caregiver.job_title && (
              <div style={styles.prefilledItem}>
                <span style={styles.label}>Role:</span> {caregiver.job_title}
              </div>
            )}
            {caregiver.years_experience && (
              <div style={styles.prefilledItem}>
                <span style={styles.label}>Experience:</span> {caregiver.years_experience} years
              </div>
            )}
            {caregiver.city && (
              <div style={styles.prefilledItem}>
                <span style={styles.label}>Location:</span> {caregiver.city}
              </div>
            )}
          </div>
        </div>

        <div style={styles.requiredSection}>
          <h3 style={styles.sectionTitle}>Complete these sections to go live:</h3>
          <ul style={styles.checklist}>
            {requiredSections.map(section => (
              <li key={section.key} style={styles.checklistItem}>
                <span style={styles.checkbox}>☐</span>
                <span>{section.label}</span>
                {section.required && <span style={styles.required}>required</span>}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.termsSection}>
          <label style={styles.checkboxLabel}>
            <input type="checkbox" id="terms" style={styles.checkbox} />
            <span style={styles.termsText}>
              I agree to the <a href="/terms" style={styles.link}>Terms of Service</a> and <a href="/privacy" style={styles.link}>Privacy Policy</a>
            </span>
          </label>
        </div>

        <Link 
          href={`/sign-up?role=caregiver&claim_token=${token}&redirect_url=/profile/build`}
          style={styles.cta}
        >
          Create my account and complete profile
        </Link>

        <p style={styles.footer}>
          This invitation expires in 30 days
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F4F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '560px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #E2E8F0',
  },
  logo: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontFamily: '"DM Serif Display", Georgia, serif',
    fontSize: '28px',
    color: '#0D1B3E',
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  text: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '16px',
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: '16px',
  },
  prefilledSection: {
    backgroundColor: '#FDF6EC',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #E8B86D',
  },
  sectionTitle: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0D1B3E',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  prefilledList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  prefilledItem: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '16px',
    color: '#2D3748',
  },
  label: {
    fontWeight: 600,
    color: '#0D1B3E',
    marginRight: '8px',
  },
  requiredSection: {
    marginBottom: '32px',
  },
  checklist: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  checklistItem: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '16px',
    color: '#4A5568',
    padding: '12px 0',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
  },
  required: {
    fontSize: '12px',
    color: '#C9973A',
    fontWeight: 600,
    marginLeft: '8px',
    textTransform: 'uppercase',
  },
  termsSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#F7F9FC',
    borderRadius: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
  },
  termsText: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '14px',
    color: '#4A5568',
    lineHeight: 1.5,
  },
  link: {
    color: '#1E3A8A',
    textDecoration: 'underline',
  },
  cta: {
    display: 'block',
    width: '100%',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
    color: '#0D1B3E',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '16px',
    fontWeight: 600,
    textAlign: 'center',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  footer: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '14px',
    color: '#718096',
    textAlign: 'center',
    marginTop: '24px',
  },
}
