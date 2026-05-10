'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

const CA_PROVINCES = ['Alberta','British Columbia','Manitoba','New Brunswick',
  'Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island',
  'Quebec','Saskatchewan','Northwest Territories','Nunavut','Yukon']

const CARE_TYPES = ['Home care','Live-in care','Palliative/Hospice','Dementia care',
  'Pediatric care','Acquired disability','Mental health support','Post-surgical recovery',
  'Respite care','Overnight care']

const CA_CITIES = ['Toronto','Vancouver','Montreal','Calgary','Edmonton','Ottawa',
  'Mississauga','Brampton','Hamilton','London','Markham','Vaughan','Kitchener',
  'Windsor','Richmond Hill','Oakville','Burlington','Saskatoon','Regina','Halifax']

const CURRENT_TOOLS = ['AlayaCare','ClearCare','WellSky','HHAeXchange',
  'Hireology','Google Sheets','Paper-based','Other']

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #E2E8F0', fontSize: 14, color: N,
  outline: 'none', boxSizing: 'border-box', fontFamily: S, background: 'white',
}

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      cursor: 'pointer', fontFamily: S,
      border: active ? `2px solid ${G}` : '1.5px solid #E2E8F0',
      background: active ? '#FDF6EC' : 'white',
      color: active ? '#92400E' : '#64748B',
    }}>{label}</button>
  )
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 28, marginBottom: 20 }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: N, margin: '0 0 4px' }}>{title}</h2>
      {desc && <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px' }}>{desc}</p>}
      {!desc && <div style={{ marginBottom: 20 }} />}
      {children}
    </div>
  )
}

interface TeamMember {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  status: string
  invited_at: string
}

export default function AgencySettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agency, setAgency] = useState<any>(null)
  const [team, setTeam] = useState<TeamMember[]>([])
  const [inviting, setInviting] = useState(false)
  const [inviteForm, setInviteForm] = useState({ first_name: '', last_name: '', email: '', role: 'coordinator' })

  useEffect(() => {
    fetch('/api/agency/settings')
      .then(r => r.json())
      .then(d => { setAgency(d.agency); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/agency/team')
      .then(r => r.json())
      .then(d => { if (d.success) setTeam(d.members || []) })
      .catch(() => {})
  }, [])

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    try {
      const res = await fetch('/api/agency/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      toast.success('Invitation sent')
      setInviteForm({ first_name: '', last_name: '', email: '', role: 'coordinator' })
      const r = await fetch('/api/agency/team')
      const td = await r.json()
      if (td.success) setTeam(td.members || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite')
    } finally {
      setInviting(false)
    }
  }

  async function remove(memberId: string, name: string) {
    if (!confirm(`Remove ${name} from team?`)) return
    try {
      const res = await fetch('/api/agency/team/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      if (!res.ok) throw new Error()
      setTeam(t => t.filter(m => m.id !== memberId))
      toast.success(`${name} removed`)
    } catch {
      toast.error('Failed to remove')
    }
  }

  async function save(fields: Record<string, any>) {
    setSaving(true)
    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      setAgency(d.agency)
      toast.success('Saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 40, fontFamily: S, color: '#64748B' }}>Loading...</div>
  if (!agency) return <div style={{ padding: 40, fontFamily: S, color: '#64748B' }}>Agency not found</div>

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S, padding: '32px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, margin: '0 0 4px' }}>Agency Settings</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 28px' }}>Changes take effect immediately.</p>

        {/* Identity */}
        <Section title="Identity" desc="How your agency appears to caregivers and on the platform.">
          {[
            { label: 'Legal agency name', key: 'name', placeholder: 'ABC Home Care Inc.' },
            { label: 'Display name (shown to caregivers)', key: 'display_name', placeholder: 'Same as legal name' },
            { label: 'Tagline', key: 'tagline', placeholder: 'Caring for seniors across the GTA since 2010' },
            { label: 'Website URL', key: 'website_url', placeholder: 'https://youragency.ca' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>{f.label}</label>
              <input
                style={inp}
                defaultValue={agency[f.key] || ''}
                placeholder={f.placeholder}
                onBlur={e => save({ [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>Brand colour</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" defaultValue={agency.brand_color || '#0D1B3E'}
                onBlur={e => save({ brand_color: e.target.value })}
                style={{ width: 44, height: 44, borderRadius: 8, border: '1.5px solid #E2E8F0', cursor: 'pointer', padding: 2 }} />
              <span style={{ fontSize: 12, color: '#64748B' }}>Used in caregiver communications and AIRecruit calls</span>
            </div>
          </div>
        </Section>

        {/* Operations */}
        <Section title="Operations" desc="Where you operate and what services you offer.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>City</label>
              <input style={inp} defaultValue={agency.city || ''} onBlur={e => save({ city: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>Province</label>
              <select style={inp} defaultValue={agency.state || ''} onBlur={e => save({ state: e.target.value })}>
                <option value="">Select...</option>
                {CA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 8 }}>
              Service areas
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400, marginLeft: 8 }}>Only caregivers in these areas will appear in your search</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CA_CITIES.map(c => (
                <Chip key={c} label={c}
                  active={(agency.service_areas || []).includes(c)}
                  onClick={() => {
                    const updated = toggle(agency.service_areas || [], c)
                    setAgency((a: any) => ({ ...a, service_areas: updated }))
                    save({ service_areas: updated })
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 8 }}>Care types offered</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CARE_TYPES.map(t => (
                <Chip key={t} label={t}
                  active={(agency.care_types || []).includes(t)}
                  onClick={() => {
                    const updated = toggle(agency.care_types || [], t)
                    setAgency((a: any) => ({ ...a, care_types: updated }))
                    save({ care_types: updated })
                  }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Team */}
        <Section title="Team & tools" desc="Helps us tailor AIRecruit and workflow features.">
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>Number of care coordinators</label>
            <select style={{ ...inp, maxWidth: 200 }} defaultValue={agency.coordinator_count || ''}
              onBlur={e => save({ coordinator_count: e.target.value ? parseInt(e.target.value) : null })}>
              <option value="">Select...</option>
              {['1','2','3','4','5','6','7','8','9','10'].map(n => <option key={n} value={n}>{n}</option>)}
              <option value="11">10+</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 8 }}>Scheduling / ATS software</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CURRENT_TOOLS.map(t => (
                <Chip key={t} label={t}
                  active={(agency.current_tools || []).includes(t)}
                  onClick={() => {
                    const updated = toggle(agency.current_tools || [], t)
                    setAgency((a: any) => ({ ...a, current_tools: updated }))
                    save({ current_tools: updated })
                  }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Compliance */}
        <Section title="Compliance" desc="Required before placing caregivers. Reviewed by Careified admin.">
          {[
            { label: 'Business registration number', key: 'business_registration', placeholder: 'Ontario Business #123456789' },
            { label: 'Professional license number', key: 'license_number', placeholder: '' },
            { label: 'Liability insurance carrier', key: 'insurance_carrier', placeholder: 'e.g. Intact Insurance' },
            { label: 'Insurance policy number', key: 'insurance_policy', placeholder: '' },
            { label: 'Background check provider', key: 'background_check_provider', placeholder: 'e.g. Certn, Sterling, in-house' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>{f.label}</label>
              <input style={inp} defaultValue={agency[f.key] || ''} placeholder={f.placeholder}
                onBlur={e => save({ [f.key]: e.target.value })} />
            </div>
          ))}
        </Section>

        {/* Billing */}
        <Section title="Billing" desc="Subscription and payment management.">
          <div style={{ padding: '20px', background: '#FDF6EC', borderRadius: 12, border: '1px solid #E8B86D' }}>
            <p style={{ fontSize: 14, color: '#0D1B3E', marginBottom: 12, fontWeight: 500 }}>
              Billing and subscription management coming June 2026.
            </p>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
              During beta: all features included free.
            </p>
            <p style={{ fontSize: 13, color: '#64748B' }}>
              Questions? Contact <a href="mailto:hello@careified.ca" style={{ color: '#C9973A' }}>hello@careified.ca</a>
            </p>
          </div>
        </Section>

        {saving && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, background: N, color: 'white', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            Saving...
          </div>
        )}
      </div>
    </div>
  )
}
