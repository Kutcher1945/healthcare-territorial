"use client"
import { useState, useRef, useEffect } from "react"
import MapView from "../components/HomePage/MapV"
import { HealthcareService } from "../services/apiService"

export default function GeoAnalysisPage() {
  const [geoMode, setGeoMode] = useState("walkaccess");
  const [mapData, setMapData] = useState(null);
  const mapRef = useRef();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex shadow-2xl gap-2">
        {[
          { id: 'walkaccess', label: 'Пешая доступность' },
          { id: 'deficit', label: 'Дефицит' },
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setGeoMode(btn.id)}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all duration-300 ${
              geoMode === btn.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-500 hover:bg-gray-100 bg-white/90'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="w-full h-full">
        <MapView 
          mode="geo-analysis"
          ref={mapRef}
          geoMode={geoMode}
          onDataUpdate={setMapData}
        />
      </div>
    </div>
  );
}