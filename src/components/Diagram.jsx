import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend
} from "recharts";

import { useState, useEffect } from "react";

const COLORS = [
  "#70b0e8ff",
  "#51ab7fff",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#52BE80",
  "#E74C3C",
  "#5DADE2",
];

export default function Diagram() {
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/count_by_used_part_of_the_building/?limit=100");
        const data_json = await response.json();
        setPieData(data_json);
      } catch (error) {
        console.error("Failed to fetch table data", error);
      }
    }
    fetchData();
  }, []);

  const label = "Used part of the building";

  return (
    <div className={`histogram-container h-[300px] p-2 pb-7 bg-gray-100 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray/20 cursor-pointer`}>
      <h1 className="text-center text-lg font-bold text-black mb-2">{label}</h1>
      <div style={{ width: "100%", height: "100%" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="count"
              nameKey="used_part_of_the_building"
              cx="50%"
              cy="45%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString()} />
            {/* <Legend /> */}
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                marginTop: "-20px",
                fontSize: "12px",   // change size
                color: "#333",      // change text color
              }}
              formatter={(value) => (
                <span style={{ fontSize: "14px", color: "#1f2937", fontWeight: "500" }}>
                  {value}
                </span>
              )}
/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
