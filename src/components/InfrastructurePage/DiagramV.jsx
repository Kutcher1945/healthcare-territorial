import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useState, useEffect } from "react"
import "../../App.css"

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180
  // Adjust radius based on screen size implicitly by using percentage in Pie component
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null; // Hide small labels

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function Diagram({ selectedDistrict, selectedDecade }) {
  const [data, setData] = useState([])
  const [allBuildingsData, setAllBuildingsData] = useState([])

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
          ownership_right: b.ownership_right,
          year: b.year || null,
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

    let filteredBuildings = selectedDistrict
      ? allBuildingsData.filter(b => b.district === selectedDistrict)
      : allBuildingsData

   if (selectedDecade && selectedDecade !== "Все") {
    if (selectedDecade === "До 1980-х") {
      filteredBuildings = filteredBuildings.filter(b => {
        const year = Number(b.year);
        return year && year < 1980;
      });
    } else {
      const decadeStart = parseInt(selectedDecade, 10);
      const decadeEnd = decadeStart + 9;
      filteredBuildings = filteredBuildings.filter(b => {
        const year = Number(b.year);
        return year >= decadeStart && year <= decadeEnd;
      });
    }
   }

    const ownershipCounts = {
      "Государственные": 0,
      "Смешанные": 0,
      "Частные": 0
    }

    filteredBuildings.forEach(({ ownership_right }) => {
      if (!ownership_right) return

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
    ].filter(item => item.value > 0)

    setData(chartData)
  }, [allBuildingsData, selectedDistrict, selectedDecade])

  return (
    <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg h-full overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
      <div className="mb-2 md:mb-3 flex-none">
        <h3 className="text-xs md:text-sm text-left font-bold text-[#1b1b1b] uppercase tracking-wide text-center">
          Распределение организаций
        </h3>
        {selectedDecade && selectedDecade !== "Все" && (
          <p className="text-[10px] md:text-xs text-gray-500 text-center mt-1">
            {selectedDecade === "До 1980-х"
              ? "Период: до 1980 г."
              : `Период: ${selectedDecade}–${parseInt(selectedDecade) + 9} гг.`}
          </p>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              // Use percentages to adapt to container size
              innerRadius="40%"
              outerRadius="75%"
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
              wrapperStyle={{ fontSize: "10px", fontWeight: "600", paddingTop: "0px" }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}