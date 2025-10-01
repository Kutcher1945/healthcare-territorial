"use client"

import { useState } from "react"
import DistrictTable from "../components/DistrictTableV"
import PersonalHistogram from "../components/PersonalHistogramV"
import PersonalTable from "../components/PersonalPage/PersonalTable"
import PersonalTablePatient from "../components/PersonalPage/PersonalTablePatient"

export default function PersonalPage() {
  const [activeTable, setActiveTable] = useState("doctor")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 transition-all duration-200 hover:scale-[1.01]">
            <div className="px-2 py-2">
              <h2 className="text-lg font-bold text-[#1b1b1b] uppercase tracking-wide">Анализ по районам</h2>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-2 border-[#c1d3ff] overflow-hidden">
              <div className="h-[400px]">
                <DistrictTable
                  selectedDistrict={selectedDistrict}
                  onDistrictSelect={setSelectedDistrict}
                />
              </div>
            </div>
          </div>

          <div className="transition-all duration-200 hover:scale-[1.01]">
            <div className="px-2 py-2">
              <h2 className="text-lg font-bold text-[#1b1b1b] uppercase tracking-wide">Обеспеченность врачами</h2>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-2 border-[#c1d3ff] p-2">
              <PersonalHistogram selectedDistrict={selectedDistrict} />
            </div>
          </div>
        </div>

        {/* Personnel Details Table */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-[#c1d3ff] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3772ff] to-[#2956bf]">
            <h2 className="text-base font-bold text-white uppercase tracking-wide">
              Нагрузка на врачей в поликлиниках (сравнение с нормативом)
            </h2>
            {/* Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTable("doctor")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTable === "doctor"
                    ? "bg-white text-[#3772ff] shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Врачи
              </button>
              <button
                onClick={() => setActiveTable("patient")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTable === "patient"
                    ? "bg-white text-[#3772ff] shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Пациенты
              </button>
            </div>
          </div>
          <div className="h-[500px]">
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
