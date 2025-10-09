"use client"

import React, { useEffect, useState } from "react"

export default function PersonalTable({ selectedDistrict, searchTerm, setSearchTerm }) {
  const [tableData, setTableData] = useState([])
  const [allData, setAllData] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  useEffect(() => {
    async function fetchData() {
      try {
        // формируем url с фильтрацией
        let url = "https://admin.smartalmaty.kz/api/v1/healthcare/healthcare-precinct-service/?limit=10000"
        if (selectedDistrict && selectedDistrict !== "Все районы") {
          url += `&district=${encodeURIComponent(selectedDistrict)}`
        }

        const response = await fetch(url)
        const data_json = await response.json()
        setAllData(data_json.results)
      } catch (error) {
        console.error("Failed to fetch table data", error)
      }
    }

    fetchData()
  }, [selectedDistrict])

  // Filter and sort data
  useEffect(() => {
    if (allData.length === 0) return

    let filteredData = allData

    // Apply search filter
    if (searchTerm.trim()) {
      filteredData = filteredData.filter(item =>
        item.medical_organization_name_rus?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        // Convert to numbers
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    setTableData(filteredData)
  }, [allData, sortConfig, searchTerm])

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
      return <span className="ml-1 text-white/50">⇅</span>
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  } 

    const fixedNum = (item) => {
        if (item == null || item === "") return "-" // fallback if missing
        const num = Number(item)
        if (isNaN(num)) return "-" // fallback if not numeric
        return num.toFixed(0)
    }

    const getBgPed = (value) => {
        if (value == null || isNaN(Number(value)) || value === "") return "bg-gray-100 text-gray-800"
        return value > 900
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
    }
    const getBgTer = (value) => {
        if (value == null || isNaN(Number(value)) || value === "") return "bg-gray-100 text-gray-800"
        return value > 2200
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
    }
    const getBgVop = (value) => {
        if (value == null || isNaN(Number(value)) || value === "") return "bg-gray-100 text-gray-800"
        return value > 1700
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
    }
    const vopNeeded = (value) => {
      if (value == null || isNaN(Number(value)) || value === "") return "-"
      return value < 0 ? 0 : value
    }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию поликлиники..."
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
            Найдено результатов: <span className="font-semibold text-blue-600">{tableData.length}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gradient-to-r from-[#3772ff] to-[#2956bf]">
            <tr>
              <th className="px-4 py-3 text-left text-white font-semibold border-r border-blue-500">Название поликлиники</th>
              <th
                className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('pediatric_service_workload_per_pediatrician')}
              >
                <div className="flex items-center justify-center">
                  На 1 педиатра (норма: 900чел.)
                  <SortIcon columnKey="pediatric_service_workload_per_pediatrician" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('therapeutic_service_workload_per_therapist')}
              >
                <div className="flex items-center justify-center">
                  На 1 терапевта (норма: 2200чел.)
                  <SortIcon columnKey="therapeutic_service_workload_per_therapist" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('gp_service_workload_per_gp')}
              >
                <div className="flex items-center justify-center">
                  На 1 ВОП (норма: 1700чел.)
                  <SortIcon columnKey="gp_service_workload_per_gp" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-white font-semibold border-r border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => handleSort('vop_needed')}
              >
                <div className="flex items-center justify-center">
                  Дефицит ВОП
                  <SortIcon columnKey="vop_needed" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <React.Fragment key={item.id}>
                <tr
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${index % 2 === 0 ? "bg-slate-50" : "bg-white"}`}
                >
                  <td className="px-4 py-3 text-left font-medium text-slate-800 border-b border-slate-200">
                    {item.medical_organization_name_rus}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-800 ${getBgPed(fixedNum((item.pediatric_service_workload_per_pediatrician)))}`}>
                      {fixedNum(item.pediatric_service_workload_per_pediatrician)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800  ${getBgTer(fixedNum((item.therapeutic_service_workload_per_therapist)))} `}>
                      {fixedNum(item.therapeutic_service_workload_per_therapist)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${getBgVop(fixedNum((item.gp_service_workload_per_gp)))}`}>
                      {fixedNum(item.gp_service_workload_per_gp)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 `}>
                      {vopNeeded(item.vop_needed)}
                    </span>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
