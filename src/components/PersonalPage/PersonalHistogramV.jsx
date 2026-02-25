"use client"

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
  }, [selectedDistrict])

  useEffect(() => {
    if (allData.length === 0) return
    const filteredData = selectedDistrict
      ? allData.filter(item => item.district === selectedDistrict)
      : allData
    setHistoData(filteredData)
  }, [allData, selectedDistrict])

  const formatMillions = (value) => {
    if (!value && value !== 0) return ""
    const inMillions = value / 1_000_000
    return `${inMillions.toFixed(2)}` // Removed "млн" to save space on mobile
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* Adjusted margins for small screens */}
        <ComposedChart data={histoData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          <XAxis 
            dataKey="district" 
            axisLine={false} 
            tickLine={false} 
            height={60} 
            interval={0} 
            tick={{ fontSize: 10, fill: "#666", angle: -35, textAnchor: "end" }}
          />

          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#64748b" 
            tick={{ fontSize: 10 }} 
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatMillions}
            stroke="#ff0000"
            tick={{ fontSize: 10, fill: "#ff0000" }}
            width={30} // restrict width
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
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "0px" }} />

          <Bar yAxisId="left" dataKey="peds_count" stackId="a" fill="url(#lightBlueGradient)" radius={[2, 2, 0, 0]} name="Педиатров">
            <LabelList dataKey="peds_count" position="center" fill="white" fontSize={9} fontWeight="600" />
          </Bar>
          <Bar yAxisId="left" dataKey="vop_count" stackId="a" fill="url(#blueGradient)" radius={[2, 2, 0, 0]} name="ВОПов">
            <LabelList dataKey="vop_count" position="center" fill="white" fontSize={9} fontWeight="600" />
          </Bar>
          <Bar yAxisId="left" dataKey="therap_count" stackId="a" fill="url(#darkBlueGradient)" radius={[2, 2, 0, 0]} name="Терапевтов">
            <LabelList dataKey="therap_count" position="center" fill="white" fontSize={9} fontWeight="600" />
          </Bar>

          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="total_population" 
            stroke="#ff0000" 
            strokeWidth={2}
            dot={{ r: 3, fill: "#ff0000" }}
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