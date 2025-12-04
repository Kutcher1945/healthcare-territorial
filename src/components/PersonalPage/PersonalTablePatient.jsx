"use client"

import React, { useEffect, useState } from "react"

export default function PersonalTablePatient({ selectedDistrict, searchTerm, setSearchTerm }) {
  const [tableData, setTableData] = useState([])
  const [allData, setAllData] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  useEffect(() => {
    async function fetchData() {
      try {
        // формируем url с фильтрацией
        let url = "https://admin.smartalmaty.kz/api/v1/healthcare/healthcare-precinct-service/?limit=10000"
        if (selectedDistrict && selectedDistrict.selectedDistrict !== "Все районы") {
          // если selectedDistrict объект, достанем поле name
          const districtName =
            typeof selectedDistrict === "string"
              ? selectedDistrict
              : selectedDistrict.selectedDistrict

          if (districtName) {
            url += `&district=${encodeURIComponent(districtName)}`
          }
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

    const getBg = (value) => {
        const num = Number(value)
        if (value == null || value === "" || isNaN(num)) {
            return "bg-gray-100 text-gray-800"
        }
        if (num === 2) {
            return "bg-green-100 text-green-800"
        }
        if (num > 2) {
            return "bg-yellow-100 text-yellow-800"
        }
        if (num < 2) {
            return "bg-red-100 text-red-800"
        }
    }
    const getBgVop = (value) => {
        const num = Number(value)
        if (value == null || value === "" || isNaN(num)) {
            return "bg-gray-100 text-gray-800"
        }
        if (num === 3) {
            return "bg-green-100 text-green-800"
        }
        if (num > 3) {
            return "bg-yellow-100 text-yellow-800"
        }
        if (num < 3) {
            return "bg-red-100 text-red-800"
        }
    }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию поликлиники..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
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
          <thead className="sticky top-0 bg-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Название поликлиники</th>
              <th
                className="px-4 py-3 text-center font-semibold cursor-pointer transition-colors"
                onClick={() => handleSort('pediatric_service_nurse_to_doctor_ratio')}
              >
                <div className="flex items-center justify-center">
                  Медсестры (педиатрия)
                  <SortIcon columnKey="pediatric_service_nurse_to_doctor_ratio" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center font-semibold cursor-pointer transition-colors"
                onClick={() => handleSort('therapeutic_service_nurse_to_doctor_ratio')}
              >
                <div className="flex items-center justify-center">
                  Медсестры (терапия)
                  <SortIcon columnKey="therapeutic_service_nurse_to_doctor_ratio" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center font-semibold cursor-pointer transition-colors"
                onClick={() => handleSort('gp_service_nurse_to_doctor_ratio')}
              >
                <div className="flex items-center justify-center">
                  Медсестры (ВОП)
                  <SortIcon columnKey="gp_service_nurse_to_doctor_ratio" />
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-800 ${getBg(fixedNum((item.pediatric_service_nurse_to_doctor_ratio)))}`}>
                      {fixedNum(item.pediatric_service_nurse_to_doctor_ratio)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800  ${getBg(fixedNum((item.therapeutic_service_nurse_to_doctor_ratio)))} `}>
                      {fixedNum(item.therapeutic_service_nurse_to_doctor_ratio)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${getBgVop(fixedNum((item.gp_service_nurse_to_doctor_ratio)))}`}>
                      {fixedNum(item.gp_service_nurse_to_doctor_ratio)}
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
