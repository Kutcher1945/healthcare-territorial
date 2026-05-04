"use client"

import { useState, useRef } from "react"
import InfraTable from "../components/InfrastructurePage/InfraTableV"
import MapView from "../components/HomePage/MapV"
import MapFilter from "../components/HomePage/MapFilter/MapFilter"
import BuildingRiskPanel from "../components/InfrastructurePage/Modal/BuildingRiskPanel"

export default function InfrastructurePage() {
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [mapData, setMapData] = useState(null)
  const [selectedLayers, setSelectedLayers] = useState(["Все слои"]);
  const mapRef = useRef(null)
  
  return (
    <div className="w-full bg-[#eaebee] p-4 flex flex-col h-screen overflow-hidden gap-4 text-xs md:text-sm">
      <div className="flex flex-row gap-4 h-[400px] shrink-0">
      
        <div className="flex-[2] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative h-full">
          <div className="bg-white p-2.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13px]">Карта ПМСП Алматы</span>
            </div>
          </div>
          <MapView 
            mode="infrastructure"
            ref={mapRef}
            selectedDistrict={selectedDistrict ? [selectedDistrict] : ["Все районы"]}
            selectedLayers={selectedLayers}
            onDataUpdate={setMapData}
          />
        </div>

        {/* <div className="absolute top-4 left-4 z-20 w-64">
          <MapFilter 
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedLayers={selectedLayers}
            setSelectedLayers={setSelectedLayers}
            // ... остальные пропсы (можно пустые заглушки)
          />
        </div> */}

        <div className="w-[500px] h-full overflow-hidden rounded-xl">
          <BuildingRiskPanel 
            onClose={() => {}} 
            onZoomTo={(item) => mapRef.current?.zoomToLocation(item)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-8">
        <InfraTable selectedDistrict={selectedDistrict} />
      </div>
    </div>
  )
}