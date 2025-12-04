"use client"
import { useState } from "react"
import DeathMoTable from "../components/RecomendationsPage/DeathMoTable.jsx"
import MapViewRecomendations from "../components/RecomendationsPage/MapViewRecomendations"

export default function RecomendationPage() {
  // Change initial state to null
  const [moData, setMoData] = useState(null)
  
  const [showDetailCard, setShowDetailCard] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPopulation, setTotalPopulation] = useState(0)
  const [avgVisit, setAvgVisit] = useState(0)
  const [avgPerson, setAvgPerson] = useState(0)
  const [selectedDistrict, setSelectedDistrict] = useState(["Все районы"])
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#f5f6fa] to-[#eaebee] flex flex-col">
      <div className="px-4 sm:px-6 pt-2 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center relative z-20">
        <div className="grid grid-cols-2 gap-8">
          <div className="h-screen rounded-lg overflow-hidden shadow-lg">
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
          <div className="rounded-lg overflow-hidden shadow-lg">
            <DeathMoTable moData={moData}/>
          </div>
        </div>
      </div>
    </div>
  )
}