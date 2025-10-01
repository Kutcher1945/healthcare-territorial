import DistrictFilter from "../components/DistrictFilter";
import { useState, } from "react";
import Map from '../components/Map';
import DetailCard from '../components/DetailCard';
import Indicators from '../components/Indicators';

export default function HomePage({selectedDistrict}) {
    const [buildingData, setBuildingData] = useState([]);
    const [showDetailCard, setShowDetailCard] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPopulation, setTotalPopulation] = useState(0);
    const [avgVisit, setAvgVisit] = useState(0);
    const [avgPerson, setAvgPerson] = useState(0);

    return (
        <div className="flex flex-col h-screen">

            {/* Indicator cards */}
            <div className="pt-6">
                <Indicators 
                    totalCount={totalCount}
                    totalPopulation={totalPopulation}
                    avgVisit={avgVisit}
                    avgPerson={avgPerson}
                />
            </div>

            {/* Map Component */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="col-span-2 h-full">
                <div className="h-screen rounded-lg overflow-hidden shadow">
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
                <div className="h-full">
                    <DetailCard buildingData={buildingData} showDetailCard={showDetailCard} setShowDetailCard={setShowDetailCard}/>
                </div>
            </div>
        </div>
    )
}
