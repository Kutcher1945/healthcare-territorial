"use client"

import { useState } from "react"
import DistrictTable from "../components/PersonalPage/DistrictTableV"
import PersonalHistogram from "../components/PersonalPage/PersonalHistogramV"
import PersonalTable from "../components/PersonalPage/PersonalTable"
import PersonalTablePatient from "../components/PersonalPage/PersonalTablePatient"

export default function PersonalPage() {
  const [activeTable, setActiveTable] = useState("doctor")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    // FIX: overflow-y-auto on mobile, overflow-hidden on desktop
    <div className="h-screen w-full bg-[#eaebee] p-2 md:p-4 flex flex-col gap-4 overflow-y-auto lg:overflow-hidden font-sans">
      
      {/* 1. Header Section */}
      <div className="flex-none">
        {selectedDistrict && (
          <div className="bg-gradient-to-r from-[#3772ff] to-[#2956bf] text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between">
            <span className="font-semibold text-sm mr-2 truncate">Район: {selectedDistrict}</span>
            <button
              onClick={() => setSelectedDistrict("")}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs transition-colors whitespace-nowrap"
            >
              Сбросить
            </button>
          </div>
        )}
      </div>

      {/* 
         2. Main Content Area 
         - Mobile: flex-col with normal flow
         - Desktop: flex-col with flex-1 to fill screen
      */}
      <div className="flex-col gap-4 flex lg:flex-1 lg:min-h-0">
        
        {/* 
           TOP ROW: Charts 
           - Mobile: grid-cols-1, auto height (children will have fixed height)
           - Desktop: flex-[0.45] means 45% height
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0 lg:flex-[0.45] lg:min-h-0">
          
          {/* Left: District Table */}
          {/* Mobile height: h-80. Desktop height: h-full */}
          <div className="h-80 md:h-96 lg:h-full lg:col-span-2 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex-none px-3 py-2 bg-slate-50 border-b border-slate-100">
              <h2 className="text-sm md:text-base font-bold text-[#1b1b1b] uppercase tracking-wide text-left">Анализ по районам</h2>
            </div>
            <div className="flex-1 min-h-0 relative">
              <DistrictTable
                selectedDistrict={selectedDistrict}
                onDistrictSelect={setSelectedDistrict}
              />
            </div>
          </div>

          {/* Right: Histogram */}
          <div className="h-64 md:h-80 lg:h-full flex flex-col bg-white rounded-lg shadow-lg p-2 overflow-hidden">
            <div className="flex-none px-1 py-1">
              <h2 className="text-sm md:text-base font-bold text-[#1b1b1b] uppercase tracking-wide">Обеспеченность врачами</h2>
            </div>
            <div className="flex-1 min-h-0 relative w-full">
              <div className="absolute inset-0">
                <PersonalHistogram selectedDistrict={selectedDistrict} />
              </div>
            </div>
          </div>
        </div>

        {/* 
           BOTTOM ROW: Personnel Table 
           - Mobile: Fixed height (e.g., 600px) so it scrolls internally.
           - Desktop: flex-[0.55] means 55% height.
        */}
        <div className="h-[500px] md:h-[600px] lg:h-auto lg:flex-[0.55] lg:min-h-0 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex-none flex flex-wrap items-center justify-between px-3 py-2 md:px-4 md:py-2 gap-2">
            <h2 className="text-sm font-semibold truncate">
              Распределение организаций
            </h2>
            <div className="flex gap-2 flex-none">
              <button
                onClick={() => setActiveTable("doctor")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTable === "doctor"
                    ? "bg-white border border-blue-300 shadow-sm"
                    : "bg-blue-500 text-white border border-blue-300 hover:bg-white hover:text-black"
                }`}
              >
                Врачи
              </button>
              <button
                onClick={() => setActiveTable("patient")}
                className={`px-3 py-1 rounded-md text-xs transition-all ${
                  activeTable === "patient"
                    ? "bg-white border border-blue-300 shadow-sm"
                    : "bg-blue-500 text-white border border-blue-300 hover:bg-white hover:text-black"
                }`}
              >
                Медсестры
              </button>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 relative">
            {activeTable === "doctor" ? (
              <PersonalTable selectedDistrict={selectedDistrict} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            ) : (
              <PersonalTablePatient selectedDistrict={selectedDistrict} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}