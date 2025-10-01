"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"
import { useState, useEffect } from "react"
import "../App.css"

export default function PersonalHistogram({ selectedDistrict }) {
  const [histoData, setHistoData] = useState([])
  const [allData, setAllData] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/count_by_district/")
        const data_json = await response.json()
        const data = data_json.results
        setAllData(data)
      } catch (error) {
        console.error("Failed to fetch histo data", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (allData.length === 0) return

    const filteredData = selectedDistrict
      ? allData.filter(item => item.district === selectedDistrict)
      : allData

    setHistoData(filteredData)
  }, [allData, selectedDistrict])

  const CustomTick = ({ x, y, payload }) => {
    const name = payload.value
    const parts = name.split(" ")
    let first = parts[0]
    if (first.length > 7) {
      first = first.slice(0, 7) + "..."
    }
    const second = parts[1] || ""

    return (
      <text x={x} y={y + 10} textAnchor="middle" fontSize={12} fill="#666">
        <tspan x={x} dy="0">
          {first}
        </tspan>
        {second && (
          <tspan x={x} dy="14">
            {second}
          </tspan>
        )}
      </text>
    )
  }

  const formatMillions = (value) => {
    if (!value && value !== 0) return ""
    // Convert to millions, round to 2 decimals
    const inMillions = value / 1_000_000
    return `${inMillions.toFixed(2)} млн`
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={375}>
        <BarChart data={histoData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="district" 
            // tick={<CustomTick />} 
            axisLine={false} 
            tickLine={false} 
            height={80} 
            interval={0} 
            tick={{ fontSize: 12, fill: "#666", angle: -35, textAnchor: "end" }}
          />
          <YAxis yAxisId="left" orientation="left" stroke="#64748b" />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => formatMillions(v)}
            domain={[0, 0.5]}
            stroke="#64748b"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />

          <Bar yAxisId="left" dataKey="peds_count" stackId="a" fill="url(#lightBlueGradient)" radius={[2, 2, 0, 0]} name="Педиатров">
            <LabelList dataKey="peds_count" position="center" fill="white" fontSize={10} fontWeight="600" />
          </Bar>
          <Bar yAxisId="left" dataKey="vop_count" stackId="a" fill="url(#blueGradient)" radius={[2, 2, 0, 0]} name="ВОПов">
            <LabelList dataKey="vop_count" position="center" fill="white" fontSize={10} fontWeight="600" />
          </Bar>
          <Bar yAxisId="left" dataKey="therap_count" stackId="a" fill="url(#darkBlueGradient)" radius={[2, 2, 0, 0]} name="Терапевтов">
            <LabelList dataKey="therap_count" position="center" fill="white" fontSize={10} fontWeight="600" />
          </Bar>

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
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
