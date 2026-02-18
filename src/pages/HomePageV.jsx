"use client"

import { useState } from "react"
import Map from "../components/HomePage/MapV"
import MapFilter from "../components/HomePage/MapFilter"
import DetailedInfoRight from "../components/HomePage/DetailedInfoRight"

export default function HomePage() {
  const [buildingData, setBuildingData] = useState([])
  const [showDetailCard, setShowDetailCard] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPopulation, setTotalPopulation] = useState(0)
  const [avgVisit, setAvgVisit] = useState(0)
  const [avgPerson, setAvgPerson] = useState(0)
  const [selectedDistrict, setSelectedDistrict] = useState(["Все районы"])
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false)

  const handleBackdropClick = () => {
    if (showDetailCard && buildingData?.id && window.innerWidth < 768) {
      setShowDetailCard(false)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {showDetailCard && buildingData?.id && (
        <div
          className="md:hidden absolute inset-0 bg-black/20 z-20 transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      )}

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

      <div className="absolute top-[40px] left-4 z-20 w-80">
        <MapFilter
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          districtDropdownOpen={districtDropdownOpen}
          setDistrictDropdownOpen={setDistrictDropdownOpen}
          totalCount={totalCount}
          totalPopulation={totalPopulation}
          avgVisit={avgVisit}
          avgPerson={avgPerson}
        />
      </div>
      <div className="absolute top-[40px] right-4 z-20 w-80">
        <DetailedInfoRight
          buildingData={buildingData}
        />
      </div>
    </div>
  )
}
