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
    <div className="h-screen w-full bg-[#eaebee] p-4 flex flex-col overflow-hidden font-sans">
      
      {/* 1. Header Section */}
      <div className="flex-none mb-3">
        {selectedDistrict && (
          <div className="bg-gradient-to-r from-[#3772ff] to-[#2956bf] text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between">
            <span className="font-semibold text-sm">Выбранный район: {selectedDistrict}</span>
            <button
              onClick={() => setSelectedDistrict("")}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs transition-colors"
            >
              Сбросить фильтр
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        
        {/* TOP ROW: Charts (~45% height) */}
        <div className="flex-[0.45] min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left: District Table */}
          <div className="lg:col-span-2 flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex-none px-3 py-2 bg-slate-50 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#1b1b1b] uppercase tracking-wide text-left">Анализ по районам</h2>
            </div>
            <div className="flex-1 min-h-0 relative">
              <DistrictTable
                selectedDistrict={selectedDistrict}
                onDistrictSelect={setSelectedDistrict}
              />
            </div>
          </div>

          {/* Right: Histogram */}
          <div className="flex flex-col h-full bg-white rounded-lg shadow-lg p-2 overflow-hidden">
            <div className="flex-none px-1 py-1">
              <h2 className="text-base font-bold text-[#1b1b1b] uppercase tracking-wide">Обеспеченность врачами</h2>
            </div>
            
            {/* FIXED SECTION: Relative container + Absolute child */}
            <div className="flex-1 min-h-0 relative w-full">
              <div className="absolute inset-0">
                <PersonalHistogram selectedDistrict={selectedDistrict} />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Personnel Table (~55% height) */}
        <div className="flex-[0.55] min-h-0 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex-none flex items-center justify-between px-4 py-2 ">
            <h2 className="text-sm font-semibold">
              Распределение медицинских организаций
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