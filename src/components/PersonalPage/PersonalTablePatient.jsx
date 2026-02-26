"use client"

import React, { useEffect, useState } from "react"
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function PersonalTablePatient({ selectedDistrict, searchTerm, setSearchTerm }) {
  const [tableData, setTableData] = useState([])
  const [allData, setAllData] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  useEffect(() => {
    async function fetchData() {
      try {
        let url = "https://admin.smartalmaty.kz/api/v1/healthcare/healthcare-precinct-service/?limit=10000"
        
        if (selectedDistrict && selectedDistrict !== "Все районы") {
           const districtName = typeof selectedDistrict === 'object' 
             ? selectedDistrict.selectedDistrict 
             : selectedDistrict;
           
           if (districtName && districtName !== "Все районы") {
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

  useEffect(() => {
    if (allData.length === 0) return

    let filteredData = allData

    if (searchTerm.trim()) {
      filteredData = filteredData.filter(item =>
        item.medical_organization_name_rus?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

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
      return <span className="ml-1 text-gray-300">⇅</span>
    }
    return (
      <span className="ml-1 text-blue-600">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  } 

    const fixedNum = (item) => {
        if (item == null || item === "") return "-"
        const num = Number(item)
        if (isNaN(num)) return "-"
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

  const handleExport = () => {
    if (tableData.length === 0) return;
    const excelData = tableData.map(row => ({
      "Название поликлиники": row.medical_organization_name_rus,
      "Медсестры (педиатрия)": row.pediatric_service_nurse_to_doctor_ratio ? Number(row.pediatric_service_nurse_to_doctor_ratio) : "-",
      "Медсестры (терапия)": row.therapeutic_service_nurse_to_doctor_ratio ? Number(row.therapeutic_service_nurse_to_doctor_ratio) : "-",
      "Медсестры (ВОП)": row.gp_service_nurse_to_doctor_ratio ? Number(row.gp_service_nurse_to_doctor_ratio) : "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const wscols = [
        { wch: 50 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Медсестры");

    const fileName = `personal_data_patient_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 md:p-4 border-b border-gray-200 flex items-center gap-2 md:gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск по названию поликлиники..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 md:pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs md:text-sm"
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

        <button
          onClick={handleExport}
          disabled={tableData.length === 0}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 md:px-4 rounded-lg shadow-sm transition-colors text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Экспорт (Excel)</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="min-w-full border-collapse text-xs md:text-sm">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left font-semibold bg-white whitespace-nowrap">Название поликлиники</th>
              <th
                className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold bg-white cursor-pointer transition-colors whitespace-nowrap"
                onClick={() => handleSort('pediatric_service_nurse_to_doctor_ratio')}
              >
                <div className="flex items-center justify-center">
                  Медсестры (педиатрия)
                  <SortIcon columnKey="pediatric_service_nurse_to_doctor_ratio" />
                </div>
              </th>
              <th
                className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold bg-white cursor-pointer transition-colors whitespace-nowrap"
                onClick={() => handleSort('therapeutic_service_nurse_to_doctor_ratio')}
              >
                <div className="flex items-center justify-center">
                  Медсестры (терапия)
                  <SortIcon columnKey="therapeutic_service_nurse_to_doctor_ratio" />
                </div>
              </th>
              <th
                className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold bg-white cursor-pointer transition-colors whitespace-nowrap"
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
                  <td className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-slate-800 border-b border-slate-200 min-w-[150px]">
                    {item.medical_organization_name_rus}
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium text-blue-800 ${getBg(fixedNum((item.pediatric_service_nurse_to_doctor_ratio)))}`}>
                      {fixedNum(item.pediatric_service_nurse_to_doctor_ratio)}
                    </span>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-100 text-blue-800  ${getBg(fixedNum((item.therapeutic_service_nurse_to_doctor_ratio)))} `}>
                      {fixedNum(item.therapeutic_service_nurse_to_doctor_ratio)}
                    </span>
                  </td>
                  <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-100 text-blue-800 ${getBgVop(fixedNum((item.gp_service_nurse_to_doctor_ratio)))}`}>
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