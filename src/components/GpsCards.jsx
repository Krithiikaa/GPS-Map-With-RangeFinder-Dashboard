import React from 'react'

/**
 * GpsCards.jsx
 * Simple responsive info cards for GPS metadata.
 * Place in: frontend/src/components/GpsCards.jsx
 *
 * Props:
 *  - meta: object containing { latitude, longitude, altitude_m, speed_kmph, satellites, formatted, time }
 */

export default function GpsCards({ meta }) {
  if (!meta) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-soft-lg">
        <h3 className="text-lg font-semibold mb-3">GPS Info</h3>
        <div className="text-sm text-gray-500">No GPS data yet</div>
      </div>
    )
  }

  const formatNumber = (v, digits = 5) => (v === undefined || v === null ? '—' : Number(v).toFixed(digits))
  const formatSmall = (v, digits = 2) => (v === undefined || v === null ? '—' : Number(v).toFixed(digits))

  return (
    <div className="p-6 bg-white rounded-2xl shadow-soft-lg">
      <h3 className="text-lg font-semibold mb-4">GPS Info</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-400">Latitude</div>
          <div className="text-lg font-semibold mt-1 font-montserrat">{formatNumber(meta.latitude, 5)}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-400">Longitude</div>
          <div className="text-lg font-semibold mt-1 font-montserrat">{formatNumber(meta.longitude, 5)}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-400">Altitude (m)</div>
          <div className="text-lg font-semibold mt-1">{formatSmall(meta.altitude_m, 1)}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-400">Speed (km/h)</div>
          <div className="text-lg font-semibold mt-1">{meta.speed_kmph ? formatSmall(meta.speed_kmph, 2) : '—'}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-400">Satellites</div>
          <div className="text-lg font-semibold mt-1">{meta.satellites ?? '—'}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-400">Timestamp</div>
          <div className="text-sm mt-1 text-gray-700">{meta.formatted ?? meta.time ?? '—'}</div>
        </div>
      </div>
    </div>
  )
}
