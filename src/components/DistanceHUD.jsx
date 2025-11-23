import React, { useEffect, useState } from 'react'
import { ref as dbRef, onValue } from 'firebase/database'
import { db } from '../firebaseClient'

/* Haversine distance between two [lat, lon] points in meters */
function haversine([lat1, lon1], [lat2, lon2]) {
  const toRad = v => (v * Math.PI) / 180
  const R = 6371000 // Earth radius in meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/* Bearing from A to B in degrees */
function bearing([lat1, lon1], [lat2, lon2]) {
  const toRad = v => (v * Math.PI) / 180
  const toDeg = v => (v * 180) / Math.PI
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  const brng = (toDeg(Math.atan2(y, x)) + 360) % 360
  return brng
}

function degToCompass(num) {
  const val = Math.floor((num / 45) + 0.5)
  const arr = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return arr[(val % 8)]
}

/*
  Fixed target coordinates — EDIT THESE TO YOUR TARGET LOCATION
  Format: [latitude, longitude]
  Example: const TARGET = [12.83089, 79.71253] 
*/
const TARGET = [12.83089, 79.71253]

export default function DistanceHUD({ style = {} }) {
  const [gps, setGps] = useState(null)
  const [distanceM, setDistanceM] = useState(null)
  const [bearingDeg, setBearingDeg] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    const gpsRef = dbRef(db, '/GPS')

    // realtime subscription
    const off = onValue(gpsRef, snap => {
      if (!snap.exists()) {
        setGps(null)
        setDistanceM(null)
        setBearingDeg(null)
        setLastUpdate(null)
        return
      }
      const v = snap.val()
      setGps(v)
      setLastUpdate(v.formatted || v.time || new Date().toLocaleString())
    })

    return () => off()
  }, [])

  useEffect(() => {
    if (!gps) {
      setDistanceM(null)
      setBearingDeg(null)
      return
    }
    try {
      const a = [Number(gps.latitude), Number(gps.longitude)]
      const b = TARGET
      const d = haversine(a, b)
      const br = bearing(a, b)
      setDistanceM(d)
      setBearingDeg(br)
    } catch (e) {
      console.error('DistanceHUD compute error', e)
      setDistanceM(null)
      setBearingDeg(null)
    }
  }, [gps])

  const fmtDistance = d => {
    if (d == null) return '—'
    if (d < 1000) return `${Math.round(d)} m`
    return `${(d / 1000).toFixed(2)} km`
  }
  const fmtBearing = bd => (bd == null ? '—' : `${Math.round(bd)}° (${degToCompass(bd)})`)

  return (
    <div
      className="fixed top-28 right-8 z-50"
      style={{ width: 220, ...style }}
      aria-live="polite"
    >
      <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-soft-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Distance to Target</div>
            <div className="text-2xl font-semibold text-indigo-700">{fmtDistance(distanceM)}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700">
          <div><span className="text-xs text-gray-400">Bearing</span><div className="font-medium">{fmtBearing(bearingDeg)}</div></div>
          <div><span className="text-xs text-gray-400">Last update</span><div className="font-medium text-xs">{lastUpdate ?? '—'}</div></div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <div>Target (hard-coded): {TARGET[0].toFixed(5)}, {TARGET[1].toFixed(5)}</div>
        </div>
      </div>
    </div>
  )
}
