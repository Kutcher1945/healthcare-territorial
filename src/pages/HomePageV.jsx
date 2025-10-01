"use client"

import { useState } from "react"
import Map from "../components/MapV"
import DetailCard from "../components/DetailCardV"
import Indicators from "../components/IndicatorsV"

export default function HomePage({ selectedDistrict }) {
  const [buildingData, setBuildingData] = useState([])
  const [showDetailCard, setShowDetailCard] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPopulation, setTotalPopulation] = useState(0)
  const [avgVisit, setAvgVisit] = useState(0)
  const [avgPerson, setAvgPerson] = useState(0)

  // Handle click outside sidebar to close (mobile only)
  const handleBackdropClick = () => {
    if (showDetailCard && buildingData?.id && window.innerWidth < 768) {
      setShowDetailCard(false)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Indicators - Bottom right, stacked above legend on both mobile and desktop */}
      <div className="absolute bottom-[280px] right-3 md:right-4 z-40">
        <Indicators
          totalCount={totalCount}
          totalPopulation={totalPopulation}
          avgVisit={avgVisit}
          avgPerson={avgPerson}
          selectedDistrict={selectedDistrict}
        />
      </div>

      {/* Backdrop overlay - click to close (mobile only) */}
      {showDetailCard && buildingData?.id && (
        <div
          className="md:hidden absolute inset-0 bg-black/20 z-20 transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      )}

      {/* Detail Card - Desktop: always visible, Mobile: drawer style */}
      <div
        className={`absolute left-0 top-0 z-30 h-full transition-transform duration-300 ease-in-out ${
          showDetailCard || !buildingData?.id ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'
        }`}
      >
        <div className="relative h-full w-80 md:w-96">
          <div className="h-full overflow-y-auto">
            <DetailCard
              buildingData={buildingData}
              showDetailCard={showDetailCard}
              setShowDetailCard={setShowDetailCard}
            />
          </div>

          {/* Arrow toggle button - mobile only */}
          {buildingData?.id && (
            <button
              onClick={() => setShowDetailCard(!showDetailCard)}
              className="md:hidden absolute top-1/2 -right-10 -translate-y-1/2 bg-white/95 backdrop-blur-md border-2 border-[#c1d3ff] hover:border-[#3772ff] rounded-r-lg shadow-lg p-2 transition-all duration-200 hover:bg-[#ebf1ff] group"
              aria-label={showDetailCard ? "Скрыть панель" : "Показать панель"}
            >
              <svg
                className={`w-5 h-5 text-[#3772ff] transition-transform duration-300 ${
                  showDetailCard ? '' : 'rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Map - Full screen */}
      <div className="h-full w-full">
        <Map
          setBuildingData={setBuildingData}
          setShowDetailCard={setShowDetailCard}
          showDetailCard={showDetailCard}
          selectedDistrict={selectedDistrict}
          setTotalCount={setTotalCount}
          setTotalPopulation={setTotalPopulation}
          setAvgVisit={setAvgVisit}
          setAvgPerson={setAvgPerson}
        />
      </div>
    </div>
  )
}
