"use client"

// 1. Add ComposedChart and Line to imports
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"
import { useState, useEffect } from "react"

export default function PersonalHistogram({ selectedDistrict }) {
  const [histoData, setHistoData] = useState([])
  const [allData, setAllData] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/count_by_district/")
        const data_json = await response.json()
        setAllData(data_json.results)
        
        if(!selectedDistrict) {
            setHistoData(data_json.results)
        }
      } catch (error) {
        console.error("Failed to fetch histo data", error)
      }
    }
    fetchData()
  })

  useEffect(() => {
    if (allData.length === 0) return
    const filteredData = selectedDistrict
      ? allData.filter(item => item.district === selectedDistrict)
      : allData
    setHistoData(filteredData)
  }, [allData, selectedDistrict])

  const formatMillions = (value) => {
    if (!value && value !== 0) return ""
    // Assuming value is raw number (e.g. 250000), this converts to 0.25
    const inMillions = value / 1_000_000
    return `${inMillions.toFixed(2)} млн`
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* 2. Change BarChart to ComposedChart */}
        <ComposedChart data={histoData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          <XAxis 
            dataKey="district" 
            axisLine={false} 
            tickLine={false} 
            height={60} 
            interval={0} 
            tick={{ fontSize: 10, fill: "#666", angle: -35, textAnchor: "end" }}
          />

          {/* Left Axis: For the Bars (Doctor Counts) */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#64748b" 
            tick={{ fontSize: 11 }} 
          />

          {/* Right Axis: For the Line (Population) */}
          {/* I removed the domain={[0, 0.5]} so it auto-scales to the actual population size */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => formatMillions(v)}
            stroke="#ff0000" // Colored red to match the line
            tick={{ fontSize: 11, fill: "#ff0000" }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
              padding: "8px"
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          {/* Bars linked to Left Axis */}
          <Bar yAxisId="left" dataKey="peds_count" stackId="a" fill="url(#lightBlueGradient)" radius={[2, 2, 0, 0]} name="Педиатров">
            <LabelList dataKey="peds_count" position="center" fill="white" fontSize={10} fontWeight="600" />
          </Bar>
          <Bar yAxisId="left" dataKey="vop_count" stackId="a" fill="url(#blueGradient)" radius={[2, 2, 0, 0]} name="ВОПов">
            <LabelList dataKey="vop_count" position="center" fill="white" fontSize={10} fontWeight="600" />
          </Bar>
          <Bar yAxisId="left" dataKey="therap_count" stackId="a" fill="url(#darkBlueGradient)" radius={[2, 2, 0, 0]} name="Терапевтов">
            <LabelList dataKey="therap_count" position="center" fill="white" fontSize={10} fontWeight="600" />
          </Bar>

          {/* 3. New Line linked to Right Axis */}
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="total_population" 
            stroke="#ff0000" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#ff0000" }}
            name="Население"
          />

          <defs>
            <linearGradient id="lightBlueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c1d3ff" />
              <stop offset="100%" stopColor="#9fb3e8" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3772ff" />
              <stop offset="100%" stopColor="#2956bf" />
            </linearGradient>
            <linearGradient id="darkBlueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2956bf" />
              <stop offset="100%" stopColor="#1d3d8f" />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}