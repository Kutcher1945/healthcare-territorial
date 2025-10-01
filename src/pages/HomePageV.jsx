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

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Indicators - Positioned at top for better visibility */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-[95%]">
        <Indicators
          totalCount={totalCount}
          totalPopulation={totalPopulation}
          avgVisit={avgVisit}
          avgPerson={avgPerson}
          selectedDistrict={selectedDistrict}
        />
      </div>

      {/* Detail Card - Positioned absolutely on the left */}
      {showDetailCard && (
        <div className="absolute left-0 top-0 z-30 w-80 h-full overflow-y-auto">
          <DetailCard
            buildingData={buildingData}
            showDetailCard={showDetailCard}
            setShowDetailCard={setShowDetailCard}
          />
        </div>
      )}

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
