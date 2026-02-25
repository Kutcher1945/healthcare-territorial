"use client"

import { useEffect, useState } from "react"

const calcDeficitVop = (vopdata) => {
  const sum = vopdata.peds_count * 900 + vopdata.vop_count * 1700 + vopdata.therap_count * 2200
  const diff = vopdata.total_population - sum
  const fin = (diff / 1700)
  return Math.ceil(Number(fin))
}

export default function DistrictTable({ selectedDistrict, onDistrictSelect }) {
  const [tableData, setTableData] = useState([])
  const [tableDataTotals, setTableDataTotals] = useState({})
  const [vopData, setVopData] = useState([])
  const [totalDeficit, setTotalDeficit] = useState(0)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }) 

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://admin.smartalmaty.kz/api/v1/healthcare/clinic-visit-5month/count_by_district",
        )
        const data_json = await response.json()
        setTableData(data_json.results)
        setTableDataTotals(data_json.totals)

        const vopResponse = await fetch(
          "https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/count_by_district/",
        )
        const vopJson = await vopResponse.json()
        setVopData(vopJson.results)

        const total = vopJson.results.reduce((acc, item) => acc + calcDeficitVop(item), 0)
        setTotalDeficit(total)
      } catch (error) {
        console.error("Failed to fetch data", error)
      }
    }
    fetchData()
  }, [])

  const vopLookup = Object.fromEntries(vopData.map((d) => [d.district, d]))

  const handleAvg = (it) => {
    const visitone = it.per_1_person_sum/it.clinic_count
    return visitone.toFixed(2)
  }

  const handleTotalAvg = (it) => {
    const total = it.per_1_person_sum/it.clinic_count
    return total.toFixed(2)
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
      return <span className="ml-1 text-gray-300">⇅</span>
    }
    return (
      <span className="ml-1 text-blue-600">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const sortedTableData = [...tableData].sort((a, b) => {
    if (!sortConfig.key) return 0
    let aVal, bVal
    switch (sortConfig.key) {
      case 'clinic_count': aVal = a.clinic_count; bVal = b.clinic_count; break
      case 'population': aVal = a.total_population_sum; bVal = b.total_population_sum; break
      case 'visits': aVal = a.visit_sum; bVal = b.visit_sum; break
      case 'per_person': aVal = Number(handleAvg(a)); bVal = Number(handleAvg(b)); break
      case 'deficit':
        const vopInfoA = vopLookup[a.district]; const vopInfoB = vopLookup[b.district]
        aVal = vopInfoA ? calcDeficitVop(vopInfoA) : 0; bVal = vopInfoB ? calcDeficitVop(vopInfoB) : 0
        break
      default: return 0
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-auto custom-scrollbar">
        {/* text-xs md:text-sm makes the font adaptive */}
        <table className="min-w-full border-collapse text-xs md:text-sm">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left font-semibold whitespace-nowrap">Район</th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer transition-colors whitespace-nowrap" onClick={() => handleSort('clinic_count')}>
                <div className="flex items-center justify-center">Кол-во МО<SortIcon columnKey="clinic_count" /></div>
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer transition-colors whitespace-nowrap" onClick={() => handleSort('population')}>
                <div className="flex items-center justify-center">Население<SortIcon columnKey="population" /></div>
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer transition-colors whitespace-nowrap" onClick={() => handleSort('visits')}>
                <div className="flex items-center justify-center">Посещаемость<SortIcon columnKey="visits" /></div>
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer transition-colors whitespace-nowrap" onClick={() => handleSort('per_person')}>
                <div className="flex items-center justify-center">На 1 чел<SortIcon columnKey="per_person" /></div>
              </th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold cursor-pointer transition-colors whitespace-nowrap" onClick={() => handleSort('deficit')}>
                <div className="flex items-center justify-center">Дефицит ВОП<SortIcon columnKey="deficit" /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTableData.map((item, index) => {
              const vopInfo = vopLookup[item.district]
              const deficit = vopInfo ? calcDeficitVop(vopInfo) : 0
              const isSelected = selectedDistrict === item.district

              return (
                <tr
                  key={item.district}
                  onClick={() => onDistrictSelect(isSelected ? "" : item.district)}
                  className={`transition-colors cursor-pointer ${
                    isSelected ? "bg-blue-100 hover:bg-blue-200" : index % 2 === 0 ? "bg-slate-50 hover:bg-blue-50" : "bg-white hover:bg-blue-50"
                  }`}
                >
                  <td className="px-3 py-2 md:px-4 md:py-3 text-left font-medium text-slate-800 border-b border-slate-200 whitespace-nowrap">{item.district}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200">{item.clinic_count}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200">{item.total_population_sum.toLocaleString()}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200">{item.visit_sum.toLocaleString()}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-700 border-b border-slate-200">{handleAvg(item)}</td>
                  <td className={`px-3 py-2 md:px-4 md:py-3 text-center font-semibold border-b border-slate-200 ${deficit > 0 ? "text-red-600" : "text-green-600"}`}>
                    {deficit.toLocaleString()}
                  </td>
                </tr>
              )
            })}

            <tr className="sticky bottom-0 font-semibold bg-gradient-to-r from-slate-100 to-slate-200 border-t-2 border-slate-300 z-10 shadow-inner">
              <td className="px-3 py-2 md:px-4 md:py-3 text-left text-slate-800">Всего</td>
              <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-800">{tableDataTotals.clinic_count}</td>
              <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-800">{tableDataTotals.population_sum?.toLocaleString()}</td>
              <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-800">{tableDataTotals.visit_sum?.toLocaleString()}</td>
              <td className="px-3 py-2 md:px-4 md:py-3 text-center text-slate-800">{handleTotalAvg(tableDataTotals)}</td>
              <td className={`px-3 py-2 md:px-4 md:py-3 text-center font-bold ${totalDeficit > 0 ? "text-red-600" : "text-green-600"}`}>
                {totalDeficit.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}