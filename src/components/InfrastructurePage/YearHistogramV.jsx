"use client"

import { BarChart, Bar, XAxis, Tooltip, CartesianGrid, LabelList, ResponsiveContainer, Cell } from "recharts"
import { useState, useEffect } from "react"
import "../../App.css"

export default function YearHistogram({ selectedDistrict, onDecadeSelect  }) {
  const [histoData, setHistoData] = useState([])
  const [allBuildingsData, setAllBuildingsData] = useState([])
  const [selectedDecade, setSelectedDecade] = useState("")
  const label = "Годы постройки зданий"

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://admin.smartalmaty.kz/api/v1/healthcare/territorial-division-map/?limit=500",
        )
        const data_json = await response.json()
        const results = data_json.results || []

        const buildingsResponse = await fetch(
          "https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?limit=100",
        )
        const buildingsData = await buildingsResponse.json()
        const buildings = buildingsData.results || buildingsData || []

        const minToDistrict = {}
        results.forEach(item => {
          if (item.id) {
            minToDistrict[item.id] = item.district
          }
        })

        const enrichedBuildings = buildings.map(b => ({
          ...b,
          district: minToDistrict[b.min] || null,
          year: b.year
        }))

        setAllBuildingsData(enrichedBuildings)
      } catch (error) {
        console.error("Failed to fetch buildings data", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (allBuildingsData.length === 0) return

    const filteredBuildings = selectedDistrict
      ? allBuildingsData.filter(b => b.district === selectedDistrict)
      : allBuildingsData

    const decadeMap = {}

    filteredBuildings.forEach(({ year }) => {
      if (!year) return

      if (year < 1980) {
        if (!decadeMap["pre1980"]) {
          decadeMap["pre1980"] = 0
        }
        decadeMap["pre1980"] += 1
      } else {
        const decade = Math.floor(year / 10) * 10
        if (!decadeMap[decade]) {
          decadeMap[decade] = 0
        }
        decadeMap[decade] += 1
      }
    })

    const groupedData = Object.entries(decadeMap).map(([decade, total]) => ({
      decade: decade === "pre1980" ? "До 1980-х" : `${decade}s`,
      count: total,
    }))

    groupedData.sort((a, b) => {
      if (a.decade === "До 1980-х") return -1
      if (b.decade === "До 1980-х") return 1
      return parseInt(a.decade) - parseInt(b.decade)
    })

    setHistoData(groupedData)
  }, [allBuildingsData, selectedDistrict])

  const handleBarClick = (barData) => {
    const clickedDecade = barData?.payload?.decade
    if (!clickedDecade) return
    const newDecade = clickedDecade === selectedDecade ? "" : clickedDecade
    setSelectedDecade(newDecade)
    if (onDecadeSelect) {
      onDecadeSelect(newDecade) 
    }
  }

  return (
    <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
      
      <div className="mb-2 md:mb-3 flex-none">
        <h3 className="text-xs md:text-sm text-left font-bold text-[#1b1b1b] uppercase tracking-wide flex items-center gap-2">
          {label}
        </h3>
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
              onClick={handleBarClick}
            >
              {histoData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    !selectedDecade || entry.decade === selectedDecade
                      ? "url(#yearBlueGradient)"
                      : "#e8e8e8"
                  }
                  style={{ cursor: 'pointer' }}
                />
              ))}
              <LabelList dataKey="count" position="insideTop" fill="#fff" fontSize={10} fontWeight="700" />
            </Bar>
            <XAxis
              dataKey="decade"
              axisLine={false}
              tickLine={false}
              height={50}
              interval={0}
              angle={-25}
              textAnchor="end"
              style={{ fontSize: '10px', fill: '#283353' }}
            />
            <defs>
              <linearGradient id="yearBlueGradient" x1="0" y1="0" x2="0" y2="1">
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