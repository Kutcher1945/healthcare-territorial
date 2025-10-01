import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, ResponsiveContainer, Cell,
} from "recharts";
import { useState, useEffect } from "react";
import '../App.css';

export default function YearHistogram() {
    const [histoData, setHistoData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
              const response = await fetch("https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/count_by_year/?limit=100");
              const data_json = await response.json();

              // ✅ group by decade
              const decadeMap = {};
              data_json.forEach(({ year, count }) => {
                const decade = Math.floor(year / 10) * 10; // e.g. 1937 → 1930
                if (!decadeMap[decade]) {
                  decadeMap[decade] = 0;
                }
                decadeMap[decade] += count;
              });

              // ✅ convert to array for recharts
              const groupedData = Object.entries(decadeMap).map(([decade, total]) => ({
                decade: `${decade}s`, // label like "1930s"
                count: total,
              }));

              setHistoData(groupedData);
            } catch (error) {
                console.error("Failed to fetch histo data", error);
            }
        }
        fetchData();
    }, []);

    const [selectedDistrict, setSelectedDistrict] = useState("Все районы");

    const label = "Годы постройки зданий"

    return (
        <div className={`histogram-container h-[300px] pb-7 pt-2 bg-gray-100 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray/20 cursor-pointer`}>
            <h1 className="text-center text-lg font-bold text-blue-800 mb-2">{label}</h1>
            
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histoData}>
                    <Tooltip />
                    <Bar 
                        dataKey="count" 
                        onClick={(histoData) => {
                            const clickedDistrict = histoData?.payload?.district;
                            if (!clickedDistrict) return;

                            if (clickedDistrict === selectedDistrict) {
                                setSelectedDistrict(""); // Unselect if same
                            } else {
                                setSelectedDistrict(clickedDistrict); // Select new
                            }
                        }}
                    >
                        {histoData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    !selectedDistrict || entry.district === selectedDistrict || selectedDistrict === "Все районы"
                                    ? 
                                    "#70b0e8ff"
                                    : "#aeadc5ff"      
                                }
                            />
                        ))}
                    
                        <LabelList dataKey="count" position="top"/>
                    </Bar>
                    <XAxis
                        dataKey="decade"
                        axisLine={false}
                        tickLine={false}
                        height={50}
                        interval={0} 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
  );
}