"use client"

import { useState } from "react"
import DistrictHistogram from "../components/InfrastructurePage/DistrictHistogramV"
import YearHistogram from "../components/InfrastructurePage/YearHistogramV"
import Diagram from "../components/InfrastructurePage/DiagramV"
import InfraTable from "../components/InfrastructurePage/InfraTableV"

export default function InfrastructurePage() {
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedDecade, setSelectedDecade] = useState("")
  
  return (
    // CHANGE 1: h-screen, overflow-hidden, and flex-col to manage vertical space
    <div className="h-screen w-full bg-[#eaebee] p-4 flex flex-col overflow-hidden">
      
      {/* Header / Filter Section - flex-none (don't shrink or grow) */}
      <div className="flex-none">
        {selectedDistrict && (
          <div className="mb-4 bg-gradient-to-r from-[#3772ff] to-[#2956bf] text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between">
            <span className="font-semibold">Выбранный район: {selectedDistrict}</span>
            <button
              onClick={() => setSelectedDistrict("")}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
            >
              Сбросить фильтр
            </button>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      {/* CHANGE 2: 
          - flex-none or shrink-0 to prevent squashing.
          - h-[350px] or h-[40%] to define fixed height for charts. 
          - min-h values ensure it doesn't break on very small screens.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 shrink-0 h-[35%] min-h-[300px]">
        {/* Removed hover scales that might cause overflow clipping issues in fixed layout */}
        <div className="h-full">
          <DistrictHistogram
            selectedDistrict={selectedDistrict}
            onDistrictSelect={setSelectedDistrict}
          />
        </div>
        <div className="h-full">
          <Diagram selectedDistrict={selectedDistrict} selectedDecade={selectedDecade}/>
        </div>
        <div className="h-full">
          <YearHistogram selectedDistrict={selectedDistrict} onDecadeSelect={setSelectedDecade} />
        </div>
      </div>

      {/* Infrastructure Table */}
      {/* CHANGE 3: flex-1 takes ALL remaining height. min-h-0 is crucial for scrollable children in flex. */}
      <div className="flex-1 min-h-0 bg-white rounded-lg shadow-lg overflow-hidden">
        <InfraTable selectedDistrict={selectedDistrict} selectedDecade={selectedDecade}/>
      </div>
    </div>
  )
}