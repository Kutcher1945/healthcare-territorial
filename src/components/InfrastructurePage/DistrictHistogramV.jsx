"use client"

import { BarChart, Bar, XAxis, Tooltip, CartesianGrid, LabelList, ResponsiveContainer, Cell } from "recharts"
import { useState, useEffect } from "react"
import "../../App.css"

export default function DistrictHistogram({ selectedDistrict, onDistrictSelect }) {
  const [histoData, setHistoData] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://admin.smartalmaty.kz/api/v1/healthcare/territorial-division-map/count_by_district/?limit=100",
        )
        const data_json = await response.json()
        setHistoData(data_json)
      } catch (error) {
        console.error("Failed to fetch histo data", error)
      }
    }
    fetchData()
  }, [])

  const CustomTick = ({ x, y, payload }) => {
    const name = payload.value
    const parts = name.split(" ")
    let first = parts[0]
    // Truncate logic
    if (first.length > 7) {
      first = first.slice(0, 7) + "..."
    }
    const second = parts[1] || ""

    return (
      <text x={x} y={y + 10} textAnchor="end" fontSize={10} fill="#666" transform={`rotate(-30, ${x}, ${y})`}>
        <tspan x={x} dy="0">{first}</tspan>
        {second && <tspan x={x} dy="12">{second}</tspan>}
      </text>
    )
  }

  const label = "Количество поликлиник по районам "

  return (
    <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="mb-2 md:mb-3 flex-none">
        <h3 className="text-xs md:text-sm text-left font-bold text-[#1b1b1b] uppercase tracking-wide">{label}</h3>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={histoData}
            margin={{ top: 20, right: 0, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <Tooltip
              cursor={{fill: 'transparent'}}
              contentStyle={{
                backgroundColor: "white",
                border: "2px solid #c1d3ff",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(55, 114, 255, 0.15)",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              onClick={(histoData) => {
                const clickedDistrict = histoData?.payload?.district
                if (!clickedDistrict) return
                if (clickedDistrict === selectedDistrict) {
                  onDistrictSelect("")
                } else {
                  onDistrictSelect(clickedDistrict)
                }
              }}
            >
              {histoData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    !selectedDistrict || entry.district === selectedDistrict
                      ? "url(#blueGradient)"
                      : "#e8e8e8"
                  }
                  style={{ cursor: 'pointer' }}
                />
              ))}

              <LabelList dataKey="count" position="insideTop" fill="#fff" fontSize={10} fontWeight="700" />
            </Bar>
            <XAxis
              dataKey="district"
              axisLine={false}
              tickLine={false}
              height={60}
              interval={0}
              tick={<CustomTick />}
            />
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3772ff" />
                <stop offset="100%" stopColor="#2956bf" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}