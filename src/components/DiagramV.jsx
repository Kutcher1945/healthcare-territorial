import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useState, useEffect } from "react"
import "../App.css"

// Custom label function to show percentage
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function Diagram({ selectedDistrict }) {
  const [data, setData] = useState([])
  const [allBuildingsData, setAllBuildingsData] = useState([])

  // Fetch all buildings with district info
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

        // Create mapping: min -> district
        const minToDistrict = {}
        results.forEach(item => {
          if (item.id) {
            minToDistrict[item.id] = item.district
          }
        })

        // Add district to buildings
        const enrichedBuildings = buildings.map(b => ({
          ...b,
          district: minToDistrict[b.min] || null,
          ownership_right: b.ownership_right
        }))

        setAllBuildingsData(enrichedBuildings)
      } catch (error) {
        console.error("Failed to fetch buildings data", error)
      }
    }
    fetchData()
  }, [])

  // Process data based on selected district
  useEffect(() => {
    if (allBuildingsData.length === 0) return

    const filteredBuildings = selectedDistrict
      ? allBuildingsData.filter(b => b.district === selectedDistrict)
      : allBuildingsData

    // Count by ownership type
    const ownershipCounts = {
      "Государственные": 0,
      "Смешанные": 0,
      "Частные": 0
    }

    filteredBuildings.forEach(({ ownership_right }) => {
      if (!ownership_right) return

      // Map ownership types to categories
      if (ownership_right.includes("балансе") || ownership_right.includes("Коммунальная")) {
        ownershipCounts["Государственные"]++
      } else if (ownership_right.includes("Арендуемое") || ownership_right.includes("аренд")) {
        ownershipCounts["Смешанные"]++
      } else {
        ownershipCounts["Частные"]++
      }
    })

    const chartData = [
      { name: "Государственные", value: ownershipCounts["Государственные"], color: "#3772ff" },
      { name: "Смешанные", value: ownershipCounts["Смешанные"], color: "#eab308" },
      { name: "Частные", value: ownershipCounts["Частные"], color: "#22c55e" },
    ].filter(item => item.value > 0) // Only show categories with data

    setData(chartData)
  }, [allBuildingsData, selectedDistrict])
  return (
    <div className="histogram-container bg-white rounded-lg p-4 shadow-lg border-2 border-[#c1d3ff] h-[380px] flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-[#1b1b1b] uppercase tracking-wide text-center">Распределение медицинских организаций</h3>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, "Доля"]}
              contentStyle={{
                backgroundColor: "white",
                border: "2px solid #c1d3ff",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(55, 114, 255, 0.15)",
                fontSize: "12px",
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '8px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
