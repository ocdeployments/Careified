'use client'

import { useState, useEffect } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { MapPin, Car, Bus, AlertCircle } from 'lucide-react'

const FONT_SANS = "'Inter', sans-serif"
const FONT_SERIF = "'Inter', sans-serif"

const RADIUS_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50]

async function lookupZIP(zip: string): Promise<{city: string, state: string} | null> {
  try {
    const clean = zip.replace(/\D/g, '').slice(0, 5)
    if (clean.length < 5) return null
    const res = await fetch(`https://api.zippopotam.us/us/${clean}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.places?.[0]) {
      return {
        city: data.places[0]['place name'],
        state: data.places[0]['state abbreviation'],
      }
    }
    return null
  } catch { return null }
}

export default function Step4Location() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  
  const [lookingUp, setLookingUp] = useState(false)

  const serviceCity = formData.city || ''
  const serviceState = formData.state || ''
  const serviceZip = formData.postalCode || ''
  const travelRadius = formData.travelRadius
  const hasDriversLicense = formData.hasDriversLicense
  const hasVehicle = formData.hasVehicle
  const willingToTransport = formData.willingToTransport
  const willingClientVehicle = formData.willingClientVehicle
  const transitAccessible = formData.transitAccessible

  const handleZipChange = async (zip: string) => {
    saveField('postalCode', zip)
    if (zip.replace(/\D/g, '').length >= 5) {
      setLookingUp(true)
      const result = await lookupZIP(zip)
      if (result) {
        saveField('city', result.city)
        saveField('state', result.state)
      }
      setLookingUp(false)
    }
  }

  const renderToggle = (checked: boolean | undefined, onClick: () => void) => (
    <div onClick={onClick} style={{
      width: 44, height: 24, borderRadius: 999, cursor: 'pointer',
      background: checked ? '#C9973A' : '#E2E8F0', position: 'relative', transition: 'all 0.2s ease'
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', position: 'absolute', top: 3,
        transform: checked ? 'translateX(22px)' : 'translateX(2px)', transition: 'all 0.2s ease',
        marginLeft: 2
      }} />
    </div>
  )

  return (
    <div style={{ fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column', gap: '32px' }}>

      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px 0' }}>Service area</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>Confirm the location you'll be serving from. This is used to show your profile to agencies searching in your area.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0D1B3E', marginBottom: '6px' }}>ZIP / Postal {lookingUp && '...'}</label>
            <input 
              type="text" 
              value={serviceZip} 
              onChange={(e) => handleZipChange(e.target.value)}
              onBlur={(e) => saveField('postalCode', e.target.value)}
              placeholder="e.g. 75034"
              maxLength={10}
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#0D1B3E', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0D1B3E', marginBottom: '6px' }}>City</label>
            <input 
              type="text" 
              value={serviceCity} 
              onBlur={(e) => saveField('city', e.target.value)}
              placeholder="e.g. Frisco"
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#0D1B3E', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0D1B3E', marginBottom: '6px' }}>State</label>
            <input 
              type="text" 
              value={serviceState} 
              onBlur={(e) => saveField('state', e.target.value)}
              placeholder="e.g. TX"
              maxLength={3}
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#0D1B3E', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        
        <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>Your home address is private. Only your city and service radius are shown to agencies.</p>
      </div>

      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px 0' }}>How far will you travel?</h3>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {RADIUS_OPTIONS.map(r => (
            <button 
              key={r} 
              type="button" 
              onClick={() => saveField('travelRadius', r)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                border: travelRadius === r ? '2px solid #C9973A' : '1px solid #E2E8F0',
                background: travelRadius === r ? '#FDF6EC' : 'white',
                color: travelRadius === r ? '#92400E' : '#64748B',
                cursor: 'pointer',
                fontFamily: FONT_SANS
              }}
            >
              {r} mi
            </button>
          ))}
        </div>

        {serviceCity && (
          <div style={{
            marginTop: '16px',
            padding: '14px 18px',
            background: '#F8FAFC',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <MapPin size={16} color="#C9973A" />
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Serving within <strong style={{ color: '#0D1B3E' }}>{travelRadius || 15} miles</strong> of <strong style={{ color: '#0D1B3E' }}>{serviceCity}{serviceState ? `, ${serviceState}` : ''}</strong>
            </span>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px 0' }}>Driving and transport</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Car size={18} color="#64748B" />
              <span style={{ fontSize: '13px', color: '#0D1B3E' }}>I have a valid driver's licence</span>
            </div>
            {renderToggle(hasDriversLicense, () => saveField('hasDriversLicense', !hasDriversLicense))}
          </div>

          {hasDriversLicense && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Car size={18} color="#64748B" />
                  <span style={{ fontSize: '13px', color: '#0D1B3E' }}>I have my own vehicle</span>
                </div>
                {renderToggle(hasVehicle, () => saveField('hasVehicle', !hasVehicle))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Car size={18} color="#64748B" />
                  <span style={{ fontSize: '13px', color: '#0D1B3E' }}>I am willing to drive clients to appointments</span>
                </div>
                {renderToggle(willingToTransport, () => saveField('willingToTransport', !willingToTransport))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Car size={18} color="#64748B" />
                  <span style={{ fontSize: '13px', color: '#0D1B3E' }}>I am willing to use the client's vehicle</span>
                </div>
                {renderToggle(willingClientVehicle, () => saveField('willingClientVehicle', !willingClientVehicle))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bus size={18} color="#64748B" />
              <span style={{ fontSize: '13px', color: '#0D1B3E' }}>I can travel by public transit to clients</span>
            </div>
            {renderToggle(transitAccessible, () => saveField('transitAccessible', !transitAccessible))}
          </div>
        </div>
      </div>

      {!serviceCity && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#FEF3C7' }}>
          <AlertCircle size={14} color="#D97706" />
          <span style={{ fontSize: '12px', color: '#92400E' }}>Add your service city so agencies know where you work</span>
        </div>
      )}
    </div>
  )
}
