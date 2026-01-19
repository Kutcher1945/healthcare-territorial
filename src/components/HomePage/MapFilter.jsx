import { useEffect, useState } from "react";
import MapFilterIndicators from "./MapFilterIndicator";
import DetailedInfo from "./DetailedInfo";

export default function MapFilter({
  setSelectedDistrict,
  setDistrictDropdownOpen,
  districtDropdownOpen,
  selectedDistrict,
  enginNodes,
  setEnginNodes, 
  buildingData,
  totalCount,
  totalPopulation, 
  avgVisit, 
  avgPerson
}) {
  const [filtersHidden, setFiltersHidden] = useState(false);

  const allDistricts = [
    "Все районы", "Алатауский", "Алмалинский", "Ауэзовский",
    "Бостандыкский", "Жетысуский", "Медеуский", "Наурызбайский", "Турксибский",
  ];

  useEffect(() => {
    if (!selectedDistrict || selectedDistrict.length === 0) {
      setSelectedDistrict(["Все районы"]);
    }
  }, [selectedDistrict, setSelectedDistrict]);

  const handleDistrictChange = (city) => {
    if (city === "Все районы") {
      setSelectedDistrict(["Все районы"]);
    } else {
      setSelectedDistrict((prev) => {
        let updated = prev.includes(city)
          ? prev.filter((c) => c !== city)
          : [...prev.filter((c) => c !== "Все районы"), city];
        return updated.length === 0 ? ["Все районы"] : updated;
      });
    }
  };

  const labelWithArrow = (children) => (
    <span className="flex items-center space-x-1">
      <span className="text-gray-400">|</span>
      <span>{children}</span>
    </span>
  );

 return (
  <div className="relative">
    {/* 
       ROOT CONTAINER: 
       - max-h-[95vh]: Limits height to screen size.
       - flex flex-col: Establishes vertical stacking.
    */}
    <div className="flex flex-col w-full bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden max-h-[calc(100dvh-20px)]">
      
      {/* --- 1. GLOBAL HEADER (Fixed) --- */}
      <div className="flex-none bg-white/95 backdrop-blur-sm border-b z-20">
        <div className="flex items-center justify-between px-4 pt-3 pb-2 font-semibold text-base">
          <span>Фильтры</span>
          <button
            onClick={() => setFiltersHidden(!filtersHidden)}
            className="text-gray-600 hover:text-gray-900 transition-transform p-1"
            title={filtersHidden ? "Показать фильтры" : "Скрыть фильтры"}
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ${
                filtersHidden ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* District Selector */}
        <div className="px-4 pb-3">
          <div className="relative">
            <div
              onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
              className="flex items-center justify-between px-3 py-2 border rounded-md text-sm text-left cursor-pointer hover:bg-gray-50"
            >
              <span className="flex-1 truncate">
                {selectedDistrict.length > 0
                  ? selectedDistrict.join(", ")
                  : "Выберите район"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  districtDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {districtDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-30 max-h-44 overflow-y-auto">
                <div className="p-2 space-y-1 text-xs">
                  {allDistricts.map((district) => (
                    <label
                      key={district}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistrict.includes(district)}
                        onChange={() => handleDistrictChange(district)}
                        className="form-checkbox scale-90"
                      />
                      {labelWithArrow(district)}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 
         --- 2. CONTENT WRAPPER (Collapsible) --- 
         This wrapper handles the hide/show animation.
         Inside, it's a Flex Column itself.
      */}
      <div
        className={`flex flex-col min-h-0 transition-all duration-500 ease-in-out ${
          filtersHidden ? "max-h-0 opacity-0 overflow-hidden" : "max-h-screen opacity-100"
        }`}
      >
        
        {/* A. INDICATORS (FIXED / NON-SCROLLABLE) */}
        {/* flex-none ensures this div stays its natural height and doesn't shrink/grow */}
        <div className="flex-none bg-white z-10 shadow-sm relative">
            <MapFilterIndicators
                totalCount={totalCount}
                totalPopulation={totalPopulation}
                avgVisit={avgVisit}
                avgPerson={avgPerson}
                selectedDistrict={selectedDistrict}
            />
        </div>
        
        {/* B. DETAILED INFO (SCROLLABLE) */}
        {/* flex-1 ensures this takes all remaining space. overflow-y-auto puts the scrollbar HERE. */}
        {/* <div className="flex-1 overflow-y-auto">
            {buildingData?.id && (
                <DetailedInfo buildingData={buildingData}/>
            )}
        </div> */}

      </div>
      
    </div>
  </div>
  );
}