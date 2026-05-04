'use client'

import { useEffect, useRef } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

// Canadian city coordinates (default fallback locations)
const CITY_COORDS: Record<string, [number, number]> = {
  'Toronto': [43.6532, -79.3832],
  'Vancouver': [49.2827, -123.1207],
  'Montreal': [45.5017, -73.5673],
  'Calgary': [51.0447, -114.0719],
  'Ottawa': [45.4215, -75.6972],
  'Mississauga': [43.5890, -79.6441],
  'Brampton': [43.6892, -79.6601],
  'Markham': [43.8561, -79.3370],
  'Richmond Hill': [43.9002, -79.4329],
  'Vaughan': [43.8203, -79.5386],
  'Oakville': [43.4550, -79.6824],
  'Downtown': [43.6532, -79.3832],
  'North York': [43.7687, -79.3363],
  'Scarborough': [43.7722, -79.2569],
  'Etobicoke': [43.6774, -79.5945],
}

interface TravelRadiusMapProps {
  city: string
  initialRadius?: number
}

export function TravelRadiusMap({ city, initialRadius = 20 }: TravelRadiusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const circleRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const { saveField } = useProfileSave()

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically import Leaflet (client-side only)
    import('leaflet').then((L) => {
      import('react-leaflet').then(() => {
        // Fix Leaflet icon path issues
        delete (L as any).Default.prototype._getIconURL
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        // Get coordinates for the city (default to Toronto if not found)
        const coords = CITY_COORDS[city] || CITY_COORDS['Toronto'] || [43.6532, -79.3832]

        // Create map
        const map = L.map(mapRef.current!).setView(coords, 11)
        mapInstanceRef.current = map

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        // Add marker at city location
        const marker = L.marker(coords, { draggable: true }).addTo(map)
        markerRef.current = marker

        // Add travel radius circle
        const radiusMeters = (initialRadius || 20) * 1000
        const circle = L.circle(coords, {
          radius: radiusMeters,
          color: '#C9973A',
          fillColor: '#C9973A',
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(map)
        circleRef.current = circle

        // Update radius on marker drag
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          const newRadius = circle.getRadius()
          saveField('serviceAreas', [city])
          // Could also save coordinates here if needed
        })

        // Ensure map renders correctly
        setTimeout(() => map.invalidateSize(), 100)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update circle radius when initialRadius changes
  useEffect(() => {
    if (circleRef.current && initialRadius) {
      const coords = circleRef.current.getLatLng()
      circleRef.current.setRadius(initialRadius * 1000)
    }
  }, [initialRadius])

  const handleRadiusChange = (km: number) => {
    if (circleRef.current) {
      circleRef.current.setRadius(km * 1000)
    }
    saveField('travelRadius', km)
  }

  return (
    <div>
      <div ref={mapRef} style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Radius:</label>
        <select
          value={initialRadius}
          onChange={(e) => handleRadiusChange(parseInt(e.target.value) || 20)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            fontSize: '14px',
            outline: 'none',
          }}
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
          <option value={30}>30 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
        </select>
      </div>
    </div>
  )
}

// Need to import Leaflet CSS
import 'leaflet/dist/leaflet.css'