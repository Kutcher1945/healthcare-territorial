"use client"

import { useState, useRef } from "react"
import Map from "../components/HomePage/MapV"
import MapFilter from "../components/HomePage/MapFilter/MapFilter"
import DetailedInfoRight from "../components/HomePage/DetailCard/DetailedInfoRight"
import DistrictSummaryModal from "../components/HomePage/Modal/DistrictSummaryModal"
import BuildingAgeModal from "../components/HomePage/Modal/BuildingAgeModal"
import CriticalLoadPanel from "../components/HomePage/MapLegend/CriticalLoadPanel"
import {MapLayersManager} from "../utils/mapLayers"

export default function HomePage() {
  const [buildingData, setBuildingData] = useState([])
  const [showDetailCard, setShowDetailCard] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPopulation, setTotalPopulation] = useState(0)
  const [avgVisit, setAvgVisit] = useState(0)
  const [avgPerson, setAvgPerson] = useState(0)
  const [selectedDistrict, setSelectedDistrict] = useState(["Все районы"])
  const [selectedVisits, setSelectedVisits] = useState(["Все посещения"])
  const [selectedLayers, setSelectedLayers] = useState(["Все слои"])
  const [selectedAffiliations, setSelectedAffiliations] = useState(["Все принадлежности"])
  const [activeModal, setActiveModal] = useState(null);
  const [mapData, setMapData] = useState(null);
  const mapRef = useRef(null);

  const handleBackdropClick = () => {
    if (showDetailCard && buildingData?.id && window.innerWidth < 768) {
      setShowDetailCard(false)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="h-full w-full">
        <Map
          setBuildingData={setBuildingData}
          setShowDetailCard={setShowDetailCard}
          showDetailCard={showDetailCard}
          selectedDistrict={selectedDistrict}
          selectedLayers={selectedLayers}
          selectedVisits={selectedVisits}
          selectedAffiliations={selectedAffiliations}
          setTotalCount={setTotalCount}
          setTotalPopulation={setTotalPopulation}
          setAvgVisit={setAvgVisit}
          setAvgPerson={setAvgPerson}

          ref={mapRef}
          onDataUpdate={setMapData}
        />
      </div>

      <div className="absolute top-[20px] left-4 z-20 w-[220px] md:w-[280px]">
        <MapFilter
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedVisits={selectedVisits}
          setSelectedVisits={setSelectedVisits}
          selectedLayers={selectedLayers}
          setSelectedLayers={setSelectedLayers}
          selectedAffiliations={selectedAffiliations}
          setSelectedAffiliations={setSelectedAffiliations}

          totalCount={totalCount}
          totalPopulation={totalPopulation}
          avgVisit={avgVisit}
          avgPerson={avgPerson}

          activeModal={activeModal}
          setActiveModal={setActiveModal}
        />

        <div className="absolute left-[102%] top-0"> 
          {activeModal === 'summary' && (
            <DistrictSummaryModal onClose={() => setActiveModal(null)} />
          )}
          {activeModal === 'age' && (
            <BuildingAgeModal onClose={() => setActiveModal(null)} />
          )}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-30">
        <CriticalLoadPanel 
          data={mapData?.pmsp} 
          onZoomTo={(item) => {
            if (mapRef.current) {
              mapRef.current.zoomToLocation(item);
            }
          }} 
        />
      </div>
    </div>
  )
}
