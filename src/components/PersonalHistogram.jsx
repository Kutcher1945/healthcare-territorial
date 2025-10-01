import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { useState, useEffect } from 'react';
import '../App.css';


export default function PersonalHistogram() { 
  const [histoData, setHistoData] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/count_by_district/");
        const data_json = await response.json();
        const data = data_json.results;
        setHistoData(data);
      } catch (error) {
        console.error("Failed to fetch histo data", error);
      }
    }
    fetchData();
  }, []);

  const CustomTick = ({ x, y, payload }) => {
    const name = payload.value;
    const parts = name.split(" ");
    let first = parts[0];
    if (first.length > 7) {
        first = first.slice(0, 7) + "...";
    }
    const second = parts[1] || "";

    return (
      <text x={x} y={y + 10} textAnchor="middle" fontSize={12} fill="#666">
          <tspan x={x} dy="0">{first}</tspan>
          {second && <tspan x={x} dy="14">{second}</tspan>}
      </text>
    );
  };

  const formatMillions = (value) => {
    if (!value && value !== 0) return "";
    // Convert to millions, round to 2 decimals
    const inMillions = value / 1_000_000;
    return `${inMillions.toFixed(2)} млн`;
  };


  return (
    <div style={{ width: "100%", height: 400 }} className="histogram-container">
      <h2 className="text-xl font-semibold mb-4">Обеспеченность врачами</h2>
      <ResponsiveContainer>
        <BarChart data={histoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="district" tick={<CustomTick />} axisLine={false} tickLine={false} height={50} interval={0}/>
          <YAxis yAxisId="left" orientation="left" />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => formatMillions(v)}
            domain={[0, 0.5]}
          />
          <Tooltip />
          <Legend />

          {/* Bars */}
          <Bar yAxisId="left" dataKey="peds_count" stackId="a" fill="#ff6600">
            <LabelList dataKey="peds_count" position="top" />
          </Bar>
          <Bar yAxisId="left" dataKey="vop_count" stackId="a" fill="#3399ff">
            <LabelList dataKey="vop_count" position="top" />
          </Bar>
          <Bar yAxisId="left" dataKey="therap_count" stackId="a" fill="#003399" />

          {/* Line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total_population"
            stroke="#800080"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey="total_population"
              position="top"
              fill="#000000ff"
              formatter={formatMillions}
            />
          </Line>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
