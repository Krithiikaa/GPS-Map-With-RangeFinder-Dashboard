// src/components/MapView.jsx
import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ------------- military SVG icon (data URL) -------------
// small simple military-style pin (green shield-like)
const militarySvg = encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
    <defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='#1f2937'/><stop offset='1' stop-color='#065f46' /></linearGradient></defs>
    <path d='M32 4c-8 0-14 6-14 14 0 12 14 30 14 30s14-18 14-30C46 10 40 4 32 4z' fill='url(#g)' stroke='#08121a' stroke-width='1.5'/>
    <circle cx='32' cy='18' r='4' fill='#fde68a' stroke='#b45309' stroke-width='1'/>
  </svg>
`)
const militaryDataUrl = `data:image/svg+xml;charset=UTF-8,${militarySvg}`

// Fallback to your uploaded image (local path). Developer provided path:
const uploadedFallback = 'sandbox:/mnt/data/0438d31c-8d1c-43e0-ba84-334422a90103.png'

// Create Leaflet icon (SVG preferred)
const markerIcon = new L.Icon({
  iconUrl: militaryDataUrl, // primary: inline SVG
  // fallback: if browser can't render data URL use your local image URL — Leaflet will try primary first
  // Note: some browsers/dev env may not load data URL marker shadow; it's okay.
  iconRetinaUrl: militaryDataUrl,
  // optional: also include uploaded image URL as a second choice by creating another icon if needed
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [36, 48],
  iconAnchor: [18, 46],
  popupAnchor: [0, -40],
  shadowSize: [41, 41],
})

// If you prefer to use uploaded image instead of SVG, you can create:
// const markerIcon = new L.Icon({ iconUrl: uploadedFallback, ... })

// helper component: only moves marker & pans map — DOES NOT remount MapContainer
function GPSMarker({ position }) {
  const markerRef = useRef(null)
  const map = useMap()

  useEffect(() => {
    if (!position) return
    // create marker if not exists, else move
    if (markerRef.current) {
      // smooth animate marker movement (Leaflet's setLatLng + pan)
      markerRef.current.setLatLng(position)
      map.panTo(position, { animate: true, duration: 0.8 })
    }
  }, [position, map])

  // render initial marker (leaflet will reuse it afterwards)
  return position ? <Marker position={position} icon={markerIcon} ref={markerRef} /> : null
}

export default function MapView({ gps }) {
  // DEFAULT CENTER (if gps not available)
  const DEFAULT_CENTER = [12.83080, 79.71240]
  const center = gps ? [Number(gps.latitude), Number(gps.longitude)] : DEFAULT_CENTER

  return (
    <div className="rounded-xl overflow-hidden shadow bg-white" style={{ height: 420 }}>
      {/* IMPORTANT: do not change 'center' frequently; MapContainer is created once */}
      <MapContainer center={DEFAULT_CENTER} zoom={17} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* render marker via child component that will update its position via Leaflet API */}
        {gps && <GPSMarker position={[Number(gps.latitude), Number(gps.longitude)]} />}
      </MapContainer>
    </div>
  )
}
