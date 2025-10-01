"use client"

import React, { useEffect, useState } from "react"

export default function PersonalTable() {
  const [tableData, setTableData] = useState([])
  const [tableDataDetail, setTableDataDetail] = useState([])
  const [rowClicked, setRowCLicked] = useState(false)
  const [vopId, setVopId] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://admin.smartalmaty.kz/api/v1/healthcare/vop-with-medical-org/?limit=3000")
        const data_json = await response.json()
        const data = data_json.results
        setTableData(data)
      } catch (error) {
        console.error("Failed to fetch table data", error)
      }
    }
    fetchData()
  }, [])

  const handleClick = async (itemID) => {
    console.log(itemID)
    setRowCLicked(!rowClicked)
    setVopId(itemID)
    try {
      const response = await fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/vop-with-medical-org/${itemID}/`)
      const data = await response.json()
      setTableDataDetail(data.medical_organizations || [])
    } catch (error) {
      console.error("Error fetching medical organizations:", error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600">
            <tr>
              <th className="px-4 py-3 text-left text-white font-semibold border-r border-blue-500">Name</th>
              <th className="px-4 py-3 text-center text-white font-semibold">Количество name</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <React.Fragment key={item.id}>
                <tr
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${index % 2 === 0 ? "bg-slate-50" : "bg-white"}`}
                  onClick={() => handleClick(item.id)}
                >
                  <td className="px-4 py-3 text-left font-medium text-slate-800 border-b border-slate-200">
                    {item.employee_name}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 border-b border-slate-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.medical_organizations.length}
                    </span>
                  </td>
                </tr>
                {vopId === item.id && (
                  <tr>
                    <td colSpan="2" className="p-0">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border-l-4 border-blue-400">
                        <table className="w-full text-sm border border-slate-300 rounded-lg overflow-hidden">
                          <thead className="bg-gradient-to-r from-slate-600 to-slate-700">
                            <tr>
                              <th className="px-3 py-2 text-left text-white font-medium">Clinic name</th>
                              <th className="px-3 py-2 text-left text-white font-medium">Clinic district</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableDataDetail.map((itemDetail, detailIndex) => (
                              <tr
                                key={itemDetail.id || detailIndex}
                                className={`${detailIndex % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50`}
                              >
                                <td className="px-3 py-2 border-b border-slate-200 text-slate-700">
                                  {itemDetail.name}
                                </td>
                                <td className="px-3 py-2 border-b border-slate-200 text-slate-700">
                                  {itemDetail.district}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
