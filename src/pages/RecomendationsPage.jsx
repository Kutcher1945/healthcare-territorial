"use client"
import { useState } from "react"
import DeathMoTable from "../components/RecomendationsPage/DeathMoTable"
import MapViewRecomendations from "../components/RecomendationsPage/MapViewRecomendations"

export default function RecomendationPage() {
  const [moData, setMoData] = useState(null)
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#f5f6fa] to-[#eaebee] flex flex-col p-2 sm:p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
        
        {/* MAP CONTAINER */}
        {/* Mobile: 400px height. Desktop: 85vh */}
        <div className="w-full h-[400px] lg:h-[85vh] rounded-xl overflow-hidden shadow-lg sticky top-4 z-0">
          <MapViewRecomendations
            setMoData={setMoData}
            moData={moData}
          />
        </div>

        {/* TABLE CONTAINER */}
        {/* 
           FIX: changed h-fit to h-[500px]. 
           This gives the table a concrete height on mobile, forcing the 
           internal scrollbar to appear so you can reach the bottom rows.
        */}
        <div className="w-full h-[500px] lg:h-[85vh] rounded-xl shadow-lg flex flex-col overflow-hidden z-10">
          <DeathMoTable 
            moData={moData}
            setMoData={setMoData}
          />
        </div>
      </div>
    </div>
  )
}