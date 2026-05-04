'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

const ALL_MODULES = ['core','intelligence','airecruit','receptionist','family_portal','white_label']
const MODULE_LABELS: Record<string,string> = {
  core:'Core', intelligence:'Intelligence', airecruit:'AIRecruit',
  receptionist:'Receptionist', family_portal:'Family Portal', white_label:'White Label'
}

interface Agency {
  id: string
  name: string | null
  display_name: string | null
  contact_first_name: string | null
  contact_last_name: string | null
  contact_email: string | null
  contact_phone: string | null
  business_type: string | null
  city: string | null
  state: string | null
  status: string
  plan_tier: string | null
  subscription_status: string | null
  modules_enabled: string[]
  service_areas: string[]
  care_types: string[]
  coordinator_count: number | null
  business_registration: string | null
  insurance_carrier: string | null
  created_at: string
  trial_ends_at: string | null
}

function StatusBadge({ status }: { status: string }) {
  const c =
    status === 'approved' || status === 'active' ? { bg:'#F0FDF4', color:'#16A34A' } :
    status === 'pending' ? { bg:'#FFFBEB', color:'#D97706' } :
    { bg:'#FEF2F2', color:'#DC2626' }
  return <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:999, background:c.bg, color:c.color }}>{status}</span>
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Agency | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch('/api/admin/agencies')
      .then(r => r.json())
      .then(d => { if (d.agencies || d.success) setAgencies(d.agencies || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: string) {
    setUpdating(true)
    await fetch(`/api/admin/agencies/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) })
    setAgencies(a => a.map(ag => ag.id === id ? { ...ag, status } : ag))
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
    setUpdating(false)
  }

  async function updateModules(id: string, modules: string[]) {
    setUpdating(true)
    await fetch(`/api/admin/agencies/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ modules_enabled: modules }) })
    setAgencies(a => a.map(ag => ag.id === id ? { ...ag, modules_enabled: modules } : ag))
    if (selected?.id === id) setSelected(s => s ? { ...s, modules_enabled: modules } : s)
    setUpdating(false)
  }

  const filtered = filter === 'all' ? agencies : agencies.filter(a => a.status === filter)
  const counts = { all: agencies.length, pending: agencies.filter(a => a.status==='pending').length, approved: agencies.filter(a => a.status==='approved'||a.status==='active').length, rejected: agencies.filter(a => a.status==='rejected').length }

  if (loading) return <div style={{ padding:40, color:'#64748B', fontFamily:S }}>Loading...</div>

  return (
    <div style={{ fontFamily:S, color:N, display:'flex', gap:24, height:'calc(100vh - 80px)' }}>

      {/* List panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:N, margin:0 }}>Agencies</h1>
          <div style={{ fontSize:13, color:'#64748B' }}>{filtered.length} shown</div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:16 }}>
          {(['all','pending','approved','rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, border:'none', cursor:'pointer',
              background: filter===f ? N : 'white', color: filter===f ? 'white' : '#64748B',
            }}>
              {f.charAt(0).toUpperCase()+f.slice(1)} {counts[f] > 0 && <span style={{ marginLeft:4, background: filter===f ? 'rgba(255,255,255,0.2)' : '#F1F5F9', borderRadius:999, padding:'1px 6px' }}>{counts[f]}</span>}
            </button>
          ))}
        </div>

        {/* Agency list */}
        <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(a => (
            <div key={a.id} onClick={() => setSelected(a)} style={{
              background:'white', borderRadius:12, padding:'14px 16px', border: selected?.id===a.id ? `2px solid ${G}` : '1px solid #E2E8F0', cursor:'pointer',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:N }}>{a.name || 'Unnamed agency'}</div>
                  <div style={{ fontSize:11, color:'#94A3B8' }}>{a.contact_email} · {a.city || '—'}, {a.state || '—'}</div>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <StatusBadge status={a.status} />
                </div>
              </div>
              <div style={{ display:'flex', gap:4, marginTop:8, flexWrap:'wrap' }}>
                {(a.modules_enabled || ['core']).map(m => (
                  <span key={m} style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background:'#F1F5F9', color:'#475569', fontWeight:600 }}>{MODULE_LABELS[m]||m}</span>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding:40, textAlign:'center', color:'#94A3B8', fontSize:13 }}>No agencies in this category</div>}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div style={{ width:380, background:'white', borderRadius:16, border:'1px solid #E2E8F0', padding:24, overflow:'auto', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:N }}>{selected.name || 'Unnamed'}</div>
              <div style={{ fontSize:11, color:'#94A3B8' }}>ID: {selected.id.slice(0,8)}...</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ fontSize:18, color:'#94A3B8', background:'none', border:'none', cursor:'pointer' }}>×</button>
          </div>

          {/* Contact info */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:10 }}>Contact</div>
            {[
              { label:'Name', value:`${selected.contact_first_name||''} ${selected.contact_last_name||''}`.trim() || '—' },
              { label:'Email', value:selected.contact_email || '—' },
              { label:'Phone', value:selected.contact_phone || '—' },
              { label:'Location', value:selected.city && selected.state ? `${selected.city}, ${selected.state}` : '—' },
              { label:'Type', value:selected.business_type || '—' },
              { label:'Joined', value:new Date(selected.created_at).toLocaleDateString('en-CA') },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:12, color:'#64748B' }}>{r.label}</span>
                <span style={{ fontSize:12, fontWeight:500, color:N }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Status control */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:10 }}>Status</div>
            <div style={{ display:'flex', gap:8 }}>
              {['approved','pending','rejected'].map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updating || selected.status===s} style={{
                  flex:1, padding:'8px', borderRadius:8, fontSize:12, fontWeight:700, border:'none', cursor: selected.status===s ? 'default' : 'pointer',
                  background: selected.status===s ? (s==='approved'?'#16A34A':s==='pending'?'#D97706':'#DC2626') : '#F1F5F9',
                  color: selected.status===s ? 'white' : '#64748B',
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Module control */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:10 }}>Modules</div>
            <div style={{ display:'flex', flexDirection:'column' as const, gap:6 }}>
              {ALL_MODULES.map(m => {
                const active = (selected.modules_enabled || ['core']).includes(m)
                const required = m === 'core'
                return (
                  <div key={m} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, background: active?'#F0FDF4':'#F8FAFC', border:`1px solid ${active?'#BBF7D0':'#E2E8F0'}` }}>
                    <span style={{ fontSize:13, fontWeight:600, color:N }}>{MODULE_LABELS[m]}</span>
                    <button
                      onClick={() => {
                        if (required) return
                        const current = selected.modules_enabled || ['core']
                        const updated = active ? current.filter(x => x!==m) : [...current, m]
                        updateModules(selected.id, updated)
                      }}
                      disabled={required || updating}
                      style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, border:'none', cursor: required?'default':'pointer', background: active?'#16A34A':'#E2E8F0', color: active?'white':'#64748B' }}
                    >{required ? 'Required' : active ? 'Active' : 'Add'}</button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Compliance info */}
          {(selected.business_registration || selected.insurance_carrier) && (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:10 }}>Compliance</div>
              {selected.business_registration && <div style={{ fontSize:12, color:'#475569', marginBottom:4 }}>Reg: {selected.business_registration}</div>}
              {selected.insurance_carrier && <div style={{ fontSize:12, color:'#475569' }}>Insurance: {selected.insurance_carrier}</div>}
            </div>
          )}

          <Link href={`/admin/agencies`} style={{ display:'block', textAlign:'center', marginTop:20, fontSize:12, color:G }}>
            View full profile →
          </Link>
        </div>
      ) : (
        <div style={{ width:380, background:'#F8FAFC', borderRadius:16, border:'1px dashed #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <div style={{ textAlign:'center', color:'#94A3B8' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>←</div>
            <div style={{ fontSize:13 }}>Select an agency to manage</div>
          </div>
        </div>
      )}
    </div>
  )
}
