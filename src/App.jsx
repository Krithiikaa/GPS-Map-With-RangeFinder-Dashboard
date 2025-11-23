// src/App.jsx
import React, { useState, useEffect } from 'react'
import SensorWatcher from './components/SensorWatcher'
import AuthBar from './components/AuthBar'
import MapView from './components/MapView'
import GpsCards from './components/GpsCards'
import DistanceHUD from './components/DistanceHUD'
import { ref as dbRef, onValue, get } from 'firebase/database'
import { db } from './firebaseClient'

export default function App() {
  const [gpsMeta, setGpsMeta] = useState(null)

  useEffect(() => {
    const nodeRef = dbRef(db, '/GPS')

    // seed once
    get(nodeRef).then(snap => {
      if (snap.exists()) setGpsMeta(snap.val())
    }).catch(() => {})

    // realtime
    const off = onValue(nodeRef, snap => {
      if (snap.exists()) setGpsMeta(snap.val())
    })

    return () => off()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-montserrat font-semibold text-indigo-800">
              Military Surveillance Dashboard
            </h1>
            <p className="text-sm text-gray-600 font-poppins">
              Live ToF + GPS tracking from Firebase Realtime Database
            </p>
          </div>
          <AuthBar />
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold font-montserrat mb-2">GPS Live Tracking</h2>
              {/* MapView receives gpsMeta object but will NOT re-create the map */}
              <MapView gps={gpsMeta} />
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-soft-lg">
              <h2 className="text-lg font-semibold mb-4 font-montserrat">GPS Info</h2>
              <GpsCards meta={gpsMeta} />
            </div>
          </div>

          <div className="space-y-6">
            <SensorWatcher warnThreshold={80} dangerThreshold={120} />
            <div className="p-6 bg-white rounded-2xl shadow-soft-lg">
              <h2 className="text-lg font-semibold mb-2 font-montserrat">Controls & Info</h2>
              <ul className="text-sm text-gray-700 space-y-2 font-poppins">
                <li>• Live updates via Firebase Realtime Database</li>
                <li>• Interactive chart with transitions</li>
                <li>• CSV export + Browser notifications</li>
                <li>• Live GPS + Satellite / Terrain Map</li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      {/* DistanceHUD overlays on top-right; uses fixed TARGET inside component */}
      <DistanceHUD />
    </div>
  )
}
