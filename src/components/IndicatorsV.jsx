import { Stethoscope, Building2, Activity, Users, User, Heart, Shield, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function Indicators({ totalCount, totalPopulation, avgVisit, avgPerson, selectedDistrict }) {
  const formatAvgPerson = (value) => Math.ceil(value * 100) / 100;
  const [VopData, setVopData] = useState([]);

  const formatPopulation = (value) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} млн`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)} тыс`;
    return value.toString();
  };

  const calcDeficitVop = (vopdata) => {
    const sum = (vopdata.peds_count*800)+(vopdata.vop_count*1700)+(vopdata.therap_count*2200);
    const diff = vopdata.total_population - sum;
    const fin = Math.ceil(diff/1700);
    return fin;
  }

  console.log(selectedDistrict)

    useEffect(() => {
        async function fetchData() {
            const districtFilter = selectedDistrict !== "Все районы" ? `district=${selectedDistrict}` : ""
            try {
                const response = await fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/count_by_district/?${districtFilter}`);
                const data_json = await response.json();
                const data = data_json.totals;
                setVopData(data);
            } catch (error) {
                console.error("Failed to fetch histo data", error);
            }
        }
        fetchData();
    }, [selectedDistrict]);

    const indicators = [
        { title: "Ср. посещении на человека", value: formatAvgPerson(avgPerson), icon: Activity, iconColor: "text-[#3772ff]", bgColor: "bg-[#ebf1ff]", borderColor: "border-[#c1d3ff]" },
        { title: "Всего поликлиник", value: totalCount, icon: Building2, iconColor: "text-[#3772ff]", bgColor: "bg-[#ebf1ff]", borderColor: "border-[#c1d3ff]" },
        { title: "Ср. посещении на поликлинику", value: formatAvgPerson(avgVisit), icon: Stethoscope, iconColor: "text-[#3772ff]", bgColor: "bg-[#ebf1ff]", borderColor: "border-[#c1d3ff]" },
        { title: "Обслуживаемое население", value: formatPopulation(totalPopulation), icon: Users, iconColor: "text-[#3772ff]", bgColor: "bg-[#ebf1ff]", borderColor: "border-[#c1d3ff]" },
        { title: "Дефицит ВОП", value: calcDeficitVop(VopData), icon: User, iconColor: "text-[#3772ff]", bgColor: "bg-[#ebf1ff]", borderColor: "border-[#c1d3ff]" },
    ];

  return (
    <div className="flex gap-2 md:gap-2.5 flex-wrap justify-center px-2 md:px-0">
      {indicators.map((ind, idx) => {
        const Icon = ind.icon;
        return (
          <div
            key={idx}
            className="group relative rounded-lg bg-white/95 backdrop-blur-md border-2 border-[#c1d3ff] hover:border-[#3772ff] p-2 md:p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 w-fit min-w-[130px] sm:min-w-[140px] md:min-w-[150px]"
          >
            {/* Icon + Title row */}
            <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5">
              <div className={`p-1 md:p-1.5 rounded-md ${ind.bgColor} border-2 ${ind.borderColor} transition-transform group-hover:scale-110 duration-200 shadow-sm flex-shrink-0`}>
                <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${ind.iconColor}`} />
              </div>
              <p className="text-[10px] md:text-[11px] font-bold text-[#283353] uppercase tracking-wide leading-tight flex-1">
                {ind.title}
              </p>
            </div>

            {/* Value */}
            <p className="text-lg md:text-xl font-extrabold text-[#1b1b1b] ml-0.5 md:ml-1">
              {ind.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
