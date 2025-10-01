"use client"

import { useState } from "react"
import DistrictHistogram from "../components/DistrictHistogramV"
import YearHistogram from "../components/YearHistogramV"
import Diagram from "../components/DiagramV"
import InfraTable from "../components/InfraTableV"

export default function InfrastructurePage() {
  const [selectedDistrict, setSelectedDistrict] = useState("")

  return (
    <div className="h-full bg-[#eaebee] p-6 overflow-y-auto">
      <div>
        {/* Selected District Indicator */}
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="transition-all duration-200 hover:scale-[1.02]">
            <DistrictHistogram
              selectedDistrict={selectedDistrict}
              onDistrictSelect={setSelectedDistrict}
            />
          </div>
          <div className="transition-all duration-200 hover:scale-[1.02]">
            <Diagram selectedDistrict={selectedDistrict} />
          </div>
          <div className="transition-all duration-200 hover:scale-[1.02]">
            <YearHistogram selectedDistrict={selectedDistrict} />
          </div>
        </div>

        {/* Infrastructure Table */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-[#c1d3ff] overflow-hidden">
          <div className="h-[calc(100vh-500px)] min-h-[400px]">
            <InfraTable selectedDistrict={selectedDistrict} />
          </div>
        </div>
      </div>
    </div>
  )
}
