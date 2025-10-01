"use client"

import { useEffect, useState } from "react"

export default function InfraTable({ selectedDistrict }) {
  const [merged, setMerged] = useState([])
  const [allData, setAllData] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [filters, setFilters] = useState({ usedPart: [], ownershipRight: [] })
  const [showUsedPartFilter, setShowUsedPartFilter] = useState(false)
  const [showOwnershipFilter, setShowOwnershipFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchData() {
      const [res1, res2, res3] = await Promise.all([
        fetch("https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/?limit=100"),
        fetch("https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?limit=300"),
        fetch("https://admin.smartalmaty.kz/api/v1/healthcare/territorial-division-map/?limit=500"),
      ])

      const json1 = await res1.json()
      const json2 = await res2.json()
      const json3 = await res3.json()

      // Normalize responses
      const arr1 = Array.isArray(json1) ? json1 : json1.results || json1.data || []
      const arr2 = Array.isArray(json2) ? json2 : json2.results || json2.data || []
      const arr3 = json3.results || []

      // Create lookup for API2 (min → object)
      const lookup = {}
      arr2.forEach((item) => {
        if (item.min) {
          lookup[item.min] = item
        }
      })

      // Create mapping: id -> district
      const idToDistrict = {}
      arr3.forEach(item => {
        if (item.id) {
          idToDistrict[item.id] = item.district
        }
      })

      // Build merged data from API1
      const mergedData = arr1.map((item) => {
        const match = lookup[item.id] || {}
        return {
          id: item.id,
          name: item.name,
          index: item.index,
          district: idToDistrict[item.id] || null,
          buildingVolume: match.building_volume_cubic_m_field ?? "N/A",
          totalArea: match.total_area_sq_m_field ?? "N/A",
          usedPart: match.used_part_of_the_building ?? "N/A",
          ownershipRight: match.ownership_right ?? "N/A",
        }
      })

      // ✅ Sort alphabetically by name
      mergedData.sort((a, b) => a.name.localeCompare(b.name))

      setAllData(mergedData)
    }
    fetchData()
  }, [])

  // Filter and sort data based on selected district, filters, search, and sort config
  useEffect(() => {
    if (allData.length === 0) return

    let filteredData = selectedDistrict
      ? allData.filter(item => item.district === selectedDistrict)
      : allData

    // Apply search filter
    if (searchTerm.trim()) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply usedPart filter
    if (filters.usedPart.length > 0) {
      filteredData = filteredData.filter(item => filters.usedPart.includes(item.usedPart))
    }

    // Apply ownershipRight filter
    if (filters.ownershipRight.length > 0) {
      filteredData = filteredData.filter(item => filters.ownershipRight.includes(item.ownershipRight))
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        // Convert to numbers for numeric columns
        if (sortConfig.key === 'index') {
          aVal = Number(aVal)
          bVal = Number(bVal)
        } else if (sortConfig.key === 'buildingVolume' || sortConfig.key === 'totalArea') {
          aVal = aVal === "N/A" ? -1 : Number(aVal)
          bVal = bVal === "N/A" ? -1 : Number(bVal)
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    setMerged(filteredData)
  }, [allData, selectedDistrict, sortConfig, filters, searchTerm])

  // Get unique values with counts for filters, considering other active filters
  const getFilterOptions = (key) => {
    let baseData = selectedDistrict
      ? allData.filter(item => item.district === selectedDistrict)
      : allData

    // Apply other filters (not the current one being displayed)
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
        setSortConfig({ key: null, direction: null }) // Reset to default
      }
    } else {
      setSortConfig({ key, direction: 'asc' })
    }
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-white/50">⇅</span>
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const getBgIndex = (value) => {
    if (value >= 0.8) {
      return "bg-green-100 text-green-800"
    } else if (value >= 0.6 && value < 0.8) {
      return "bg-yellow-100 text-yellow-800"
    } else {
      return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
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
        {searchTerm && (
          <div className="mt-2 text-xs text-gray-600">
            Найдено результатов: <span className="font-semibold text-blue-600">{merged.length}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600">
            <tr>
              <th className="px-4 py-3 text-left text-white font-semibold border-r border-blue-500">Название</th>
              <th
                className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('buildingVolume')}
              >
                <div className="flex items-center justify-center">
                  Объем здания, м³
                  <SortIcon columnKey="buildingVolume" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('totalArea')}
              >
                <div className="flex items-center justify-center">
                  Общая площадь, м²
                  <SortIcon columnKey="totalArea" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 relative">
                <div className="flex items-center justify-center">
                  Используемая часть здания
                  <button
                    onClick={() => setShowUsedPartFilter(!showUsedPartFilter)}
                    className="ml-2 hover:bg-white/20 rounded px-2 py-1 transition-colors"
                  >
                    🔽
                  </button>
                </div>
                {showUsedPartFilter && (
                  <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-3 z-50 min-w-[250px] max-h-[300px] overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Фильтр</div>
                    {getFilterOptions('usedPart').map(({ value, count }) => (
                      <label key={value} className="flex items-center gap-2 py-1 hover:bg-blue-50 cursor-pointer text-sm text-gray-800">
                        <input
                          type="checkbox"
                          checked={filters.usedPart.includes(value)}
                          onChange={() => toggleFilter('usedPart', value)}
                          className="rounded"
                        />
                        <span className="flex-1">{value}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </th>
              <th className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 relative">
                <div className="flex items-center justify-center">
                  Право собственности
                  <button
                    onClick={() => setShowOwnershipFilter(!showOwnershipFilter)}
                    className="ml-2 hover:bg-white/20 rounded px-2 py-1 transition-colors"
                  >
                    🔽
                  </button>
                </div>
                {showOwnershipFilter && (
                  <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-3 z-50 min-w-[250px] max-h-[300px] overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Фильтр</div>
                    {getFilterOptions('ownershipRight').map(({ value, count }) => (
                      <label key={value} className="flex items-center gap-2 py-1 hover:bg-blue-50 cursor-pointer text-sm text-gray-800">
                        <input
                          type="checkbox"
                          checked={filters.ownershipRight.includes(value)}
                          onChange={() => toggleFilter('ownershipRight', value)}
                          className="rounded"
                        />
                        <span className="flex-1">{value}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </th>
              <th
                className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('index')}
              >
                <div className="flex items-center justify-center">
                  Индекс
                  <SortIcon columnKey="index" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {merged.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-slate-50" : "bg-white"}`}
              >
                <td className="px-4 py-3 text-left font-medium text-slate-800 border-b border-slate-200">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                  {item.buildingVolume !== "N/A" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {item.buildingVolume}
                    </span>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                  {item.totalArea !== "N/A" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      {item.totalArea}
                    </span>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">{item.usedPart}</td>
                <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {item.ownershipRight}
                  </span>
                </td>
                <td className={`px-4 py-3 text-center text-slate-700 border-b border-slate-200`}>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800  ${getBgIndex(Number(item.index).toFixed(2))}`}>
                    {Number(item.index).toFixed(2)}
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
