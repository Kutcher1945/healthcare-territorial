"use client"

import { useEffect, useState } from "react"
import { Filter, ChevronUp, ChevronDown } from "lucide-react";

export default function InfraTable({ selectedDistrict, selectedDecade }) {
  // ... (Keep all your state and useEffect logic exactly as before) ...
  const [merged, setMerged] = useState([])
  const [allData, setAllData] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [filters, setFilters] = useState({ usedPart: [], ownershipRight: [] })
  const [showUsedPartFilter, setShowUsedPartFilter] = useState(false)
  const [showOwnershipFilter, setShowOwnershipFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchData() {
        // ... (Your existing fetch logic) ...
        const [res1, res2, res3, res4] = await Promise.all([
            fetch("https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/?limit=100"),
            fetch("https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?limit=300"),
            fetch("https://admin.smartalmaty.kz/api/v1/healthcare/territorial-division-map/?limit=500"),
            fetch("https://admin.smartalmaty.kz/api/v1/healthcare/clinic-visit-5month/?limit=500"),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();
        const json3 = await res3.json();
        const json4 = await res4.json();

        const arr1 = Array.isArray(json1) ? json1 : json1.results || json1.data || [];
        const arr2 = Array.isArray(json2) ? json2 : json2.results || json2.data || [];
        const arr3 = json3.results || [];
        const arr4 = Array.isArray(json4) ? json4 : json4.results || json4.data || [];

        const lookup = {};
        arr2.forEach((item) => {
            if (item.min) lookup[item.min] = item;
        });

        const idToDistrict = {};
        arr3.forEach((item) => {
            if (item.id) idToDistrict[item.id] = item.district;
        });

        const idToVisit = {};
        arr4.forEach((item) => {
            if (item.id) idToVisit[item.id] = item.visit;
        });

        const mergedData = arr1.map((item) => {
            const match = lookup[item.id] || {};
            return {
            id: item.id,
            name: item.name,
            index: item.index,
            district: idToDistrict[item.id] || null,
            totalPopulation: item.total_population ?? "N/A",
            buildingVolume: match.building_volume_cubic_m_field ?? "N/A",
            totalArea: match.total_area_sq_m_field ?? "N/A",
            usedPart: match.used_part_of_the_building ?? "N/A",
            ownershipRight: match.ownership_right ?? "N/A",
            visit: idToVisit[item.id] ?? "N/A",
            year: match.year ?? null,
            };
        });

        mergedData.sort((a, b) => a.name.localeCompare(b.name));
        setAllData(mergedData);
    }
    fetchData();
  }, []);

  // ... (Keep existing filtering/sorting useEffects and helper functions) ...
  useEffect(() => {
    if (allData.length === 0) return

    let filteredData = selectedDistrict
      ? allData.filter(item => item.district === selectedDistrict)
      : allData

    if (selectedDecade) {
      filteredData = filteredData.filter(item => {
        const year = Number(item.year)
        if (!year) return false

        if (selectedDecade === "До 1980-х") return year < 1980

        const decadeStart = parseInt(selectedDecade)
        const decadeEnd = decadeStart + 9
        return year >= decadeStart && year <= decadeEnd
      })
    }

    if (searchTerm.trim()) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filters.usedPart.length > 0) {
      filteredData = filteredData.filter(item => filters.usedPart.includes(item.usedPart))
    }

    if (filters.ownershipRight.length > 0) {
      filteredData = filteredData.filter(item => filters.ownershipRight.includes(item.ownershipRight))
    }

    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (
          ['index', 'buildingVolume', 'totalArea', 'totalPopulation', 'visit'].includes(sortConfig.key)
        ) {
          aVal = aVal === "N/A" ? -1 : Number(aVal);
          bVal = bVal === "N/A" ? -1 : Number(bVal);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setMerged(filteredData)
  }, [allData, selectedDistrict, sortConfig, filters, searchTerm, selectedDecade])

  const getFilterOptions = (key) => {
    let baseData = selectedDistrict
      ? allData.filter(item => item.district === selectedDistrict)
      : allData

    if (key !== 'usedPart' && filters.usedPart.length > 0) {
      baseData = baseData.filter(item => filters.usedPart.includes(item.usedPart))
    }
    if (key !== 'ownershipRight' && filters.ownershipRight.length > 0) {
      baseData = baseData.filter(item => filters.ownershipRight.includes(item.ownershipRight))
    }

    const counts = {}
    baseData.forEach(item => {
      const value = item[key]
      if (value && value !== "N/A") {
        counts[value] = (counts[value] || 0) + 1
      }
    })

    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  }

  const toggleFilter = (filterType, value) => {
    setFilters(prev => {
      const currentFilters = prev[filterType]
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value]
      return { ...prev, [filterType]: newFilters }
    })
  }

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' })
      } else if (sortConfig.direction === 'desc') {
        setSortConfig({ key: null, direction: null })
      }
    } else {
      setSortConfig({ key, direction: 'asc' })
    }
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1"><ChevronUp className="w-3 h-3 text-gray-400"/></span>
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600"/> : <ChevronDown className="w-3 h-3 text-blue-600"/>}
      </span>
    )
  }

  const getBgIndex = (value) => {
    if (value >= 0.8) return "bg-green-100 text-green-800"
    else if (value >= 0.6 && value < 0.8) return "bg-yellow-100 text-yellow-800"
    else return "bg-red-100 text-red-800"
  }

  const formatNumber = (num) => {
    if (isNaN(num)) return "";
    return Number(num).toLocaleString("en-US").replace(/,/g, " ");
  };

  return (
    // FIX: h-full here is crucial. It tells the table to fill the 500px/600px we set in parent.
    <div className="h-full flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-3 md:p-4 border-b border-gray-200">
        {/* ... Search input code same as before ... */}
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 md:pl-10 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-xs md:text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 
         FIX: overflow-auto here creates the internal scrollbar 
         because the parent has a fixed height now.
      */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="min-w-full border-collapse text-xs md:text-sm">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left font-semibold whitespace-nowrap">Название</th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer whitespace-nowrap" onClick={() => handleSort('index')}>
                <div className="flex items-center justify-center">Индекс <SortIcon columnKey="index" /></div>
              </th>
              {/* ... Rest of headers same as before ... */}
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer whitespace-nowrap" onClick={() => handleSort('buildingVolume')}>
                <div className="flex items-center justify-center">Объем (м³)<SortIcon columnKey="buildingVolume" /></div>
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer whitespace-nowrap" onClick={() => handleSort('totalArea')}>
                <div className="flex items-center justify-center">Площадь (м²)<SortIcon columnKey="totalArea" /></div>
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer whitespace-nowrap" onClick={() => handleSort('totalPopulation')}>
                <div className="flex items-center justify-center">Население <SortIcon columnKey="totalPopulation" /></div>
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer whitespace-nowrap" onClick={() => handleSort('visit')}>
                <div className="flex items-center justify-center">Посещения <SortIcon columnKey="visit" /></div>
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold relative whitespace-nowrap">
                <div className="flex items-center justify-center">
                  Часть здания
                  <button onClick={() => setShowUsedPartFilter(!showUsedPartFilter)} className="ml-1 md:ml-2 hover:bg-gray-100 rounded p-1">
                    <Filter className="w-3 h-3 md:w-4 md:h-4 text-gray-500"/>
                  </button>
                </div>
                {showUsedPartFilter && (
                  <div className="absolute top-full right-0 mt-1 bg-white shadow-xl border rounded-lg p-2 z-50 min-w-[200px] max-h-[200px] overflow-y-auto text-left">
                    {getFilterOptions('usedPart').map(({ value, count }) => (
                      <label key={value} className="flex items-center gap-2 py-1 hover:bg-blue-50 cursor-pointer text-xs">
                        <input type="checkbox" checked={filters.usedPart.includes(value)} onChange={() => toggleFilter('usedPart', value)} className="rounded" />
                        <span className="flex-1 truncate">{value}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 rounded">{count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold relative whitespace-nowrap">
                <div className="flex items-center justify-center">
                  Собственность
                  <button onClick={() => setShowOwnershipFilter(!showOwnershipFilter)} className="ml-1 md:ml-2 hover:bg-gray-100 rounded p-1">
                    <Filter className="w-3 h-3 md:w-4 md:h-4 text-gray-500"/>
                  </button>
                </div>
                {showOwnershipFilter && (
                  <div className="absolute top-full right-0 mt-1 bg-white shadow-xl border rounded-lg p-2 z-50 min-w-[200px] max-h-[200px] overflow-y-auto text-left">
                    {getFilterOptions('ownershipRight').map(({ value, count }) => (
                      <label key={value} className="flex items-center gap-2 py-1 hover:bg-blue-50 cursor-pointer text-xs">
                        <input type="checkbox" checked={filters.ownershipRight.includes(value)} onChange={() => toggleFilter('ownershipRight', value)} className="rounded" />
                        <span className="flex-1 truncate">{value}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 rounded">{count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {merged.map((item, index) => (
              <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                <td className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-slate-800 border-b border-slate-200 min-w-[150px]">
                  {item.name}
                </td>
                <td className="px-3 py-2 md:px-4 md:py-3 text-center border-b border-slate-200">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 ${getBgIndex(Number(item.index).toFixed(2))}`}>
                    {Number(item.index).toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200 whitespace-nowrap">
                  {item.buildingVolume !== "N/A" ? item.buildingVolume : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200 whitespace-nowrap">
                  {item.totalArea !== "N/A" ? item.totalArea : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200 whitespace-nowrap">
                  {formatNumber(item.totalPopulation)}
                </td>
                <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200 whitespace-nowrap">
                  {formatNumber(item.visit)}
                </td>
                <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200 whitespace-nowrap">
                    {item.usedPart}
                </td>
                <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-purple-100 text-purple-800 truncate max-w-[150px]">
                    {item.ownershipRight}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}