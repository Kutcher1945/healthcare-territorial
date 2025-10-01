import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, ResponsiveContainer, Cell,
} from "recharts";
import { useState, useEffect } from "react";
import '../App.css';


export default function DistrictHistogram() {
    const [histoData, setHistoData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
              const response = await fetch("https://admin.smartalmaty.kz/api/v1/healthcare/territorial-division-map/count_by_district/?limit=100");
              const data_json = await response.json();
            //   const data = data_json;
              setHistoData(data_json);
            } catch (error) {
                console.error("Failed to fetch histo data", error);
            }
        }
        fetchData();
    }, []);

    const [selectedDistrict, setSelectedDistrict] = useState("Все районы");
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

    const label = "Количество поликлиник и населения по районам"

    return (
        <div className={`histogram-container h-[300px] pb-7 pt-2 bg-gray-100 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray/20 cursor-pointer`}>
            <h1 className="text-center text-lg font-bold text-green-800 mb-2">{label}</h1>
            
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
                                    "#51ab7fff"
                                    : "#aeadc5ff"      
                                }
                            />
                        ))}
                    
                        <LabelList dataKey="count" position="top"/>
                    </Bar>
                    <XAxis
                        dataKey="district"
                        axisLine={false}
                        tickLine={false}
                        height={50}
                        tick={<CustomTick />}
                        interval={0} 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
  );
}