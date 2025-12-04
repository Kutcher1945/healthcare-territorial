"use client"
import { useState } from "react"
import DeathMoTable from "../components/RecomendationsPage/DeathMoTable.jsx"
import MapViewRecomendations from "../components/RecomendationsPage/MapViewRecomendations"

export default function RecomendationPage() {
  const [moData, setMoData] = useState(null)
  
  const [showDetailCard, setShowDetailCard] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPopulation, setTotalPopulation] = useState(0)
  const [avgVisit, setAvgVisit] = useState(0)
  const [avgPerson, setAvgPerson] = useState(0)
  const [selectedDistrict, setSelectedDistrict] = useState(["Все районы"])
  
  return (

    <div className="w-full min-h-screen bg-gradient-to-br from-[#f5f6fa] to-[#eaebee] flex flex-col p-4 sm:p-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        <div className="w-full h-[500px] lg:h-[85vh] rounded-xl overflow-hidden shadow-lg sticky top-4">
          <MapViewRecomendations
            setMoData={setMoData}
            setShowDetailCard={setShowDetailCard}
            showDetailCard={showDetailCard}
            selectedDistrict={selectedDistrict}
            setTotalCount={setTotalCount}
            setTotalPopulation={setTotalPopulation}
            setAvgVisit={setAvgVisit}
            setAvgPerson={setAvgPerson}
          />
        </div>

        <div className="w-full h-fit max-h-[500px] lg:max-h-[85vh] rounded-xl shadow-lg flex flex-col">
          <DeathMoTable moData={moData}/>
        </div>
      </div>
    </div>
  )
}