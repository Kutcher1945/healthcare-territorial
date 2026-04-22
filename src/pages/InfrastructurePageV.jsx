"use client"

import { useState, useRef } from "react"
// import DistrictHistogram from "../components/InfrastructurePage/DistrictHistogramV"
// import YearHistogram from "../components/InfrastructurePage/YearHistogramV"
// import Diagram from "../components/InfrastructurePage/DiagramV"
import InfraTable from "../components/InfrastructurePage/InfraTableV"
import MapView from "../components/HomePage/MapV"
import BuildingRiskPanel from "../components/InfrastructurePage/Modal/BuildingRiskPanel"

export default function InfrastructurePage() {
  const [selectedDistrict, setSelectedDistrict] = useState("")
  // const [selectedDecade, setSelectedDecade] = useState("")
  const [mapData, setMapData] = useState(null)
  const mapRef = useRef(null)
  
  return (
    // <div className="w-full bg-[#eaebee] p-2 md:p-4 flex flex-col h-screen overflow-y-auto lg:overflow-hidden gap-4">
    // <div className="w-full bg-[#eaebee] p-4 flex flex-col h-screen overflow-hidden gap-4">
    <div className="w-full bg-[#eaebee] p-4 flex flex-col h-screen overflow-hidden gap-4 text-xs md:text-sm">
      {/* <div className="flex-none">
        {selectedDistrict && (
          <div className="bg-gradient-to-r from-[#3772ff] to-[#2956bf] text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between text-sm md:text-base">
            <span className="font-semibold truncate mr-2">Район: {selectedDistrict}</span>
            <button
              onClick={() => setSelectedDistrict("")}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs md:text-sm transition-colors whitespace-nowrap"
            >
              Сбросить
            </button>
          </div>
        )}
      </div> */}

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0 lg:h-[35%]">
        <div className="h-80 md:h-[350px] lg:h-full w-full">
          <DistrictHistogram
            selectedDistrict={selectedDistrict}
            onDistrictSelect={setSelectedDistrict}
          />
        </div>
        <div className="h-80 md:h-[350px] lg:h-full w-full">
          <Diagram selectedDistrict={selectedDistrict} selectedDecade={selectedDecade}/>
        </div>
        <div className="h-80 md:h-[350px] lg:h-full w-full md:col-span-2 lg:col-span-1">
          <YearHistogram selectedDistrict={selectedDistrict} onDecadeSelect={setSelectedDecade} />
        </div>
      </div> */}

      <div className="flex flex-row gap-4 h-[400px] shrink-0">
        
        {/* Карта ПМСП Алматы */}
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
            selectedLayers={["Все слои"]}
            onDataUpdate={setMapData}
          />
        </div>

        {/* Панель скрытого риска */}
        <div className="w-[500px] h-full overflow-hidden rounded-xl">
          {/* Добавляем h-full, чтобы панель знала свою высоту */}
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