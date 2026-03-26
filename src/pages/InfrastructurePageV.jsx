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
    <div className="w-full bg-[#eaebee] p-2 md:p-4 flex flex-col h-screen overflow-y-auto lg:overflow-hidden gap-4">
      <div className="flex-none">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0 lg:h-[35%]">
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
      </div>

      <div className="flex-none h-[500px] md:h-[600px] lg:h-auto lg:flex-1 lg:min-h-0 bg-white rounded-lg shadow-lg overflow-hidden">
        <InfraTable selectedDistrict={selectedDistrict} selectedDecade={selectedDecade}/>
      </div>
    </div>
  )
}