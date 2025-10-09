import { Stethoscope, Building2, Activity, Users, User, Heart, Shield, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function Indicators({ totalCount, totalPopulation, avgVisit, avgPerson, selectedDistrict }) {
  const formatAvgPerson = (value) => Math.ceil(value * 100) / 100;
  const [VopData, setVopData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

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

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <>
      {/* Desktop - Full cards stacked vertically */}
      <div className="hidden md:flex flex-col gap-2.5">
        {indicators.map((ind, idx) => {
          const Icon = ind.icon;
          return (
            <div
              key={idx}
              className="group relative rounded-lg bg-white/95 backdrop-blur-md border-2 border-[#c1d3ff] hover:border-[#3772ff] p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-md ${ind.bgColor} border-2 ${ind.borderColor} transition-transform group-hover:scale-110 duration-200 shadow-sm flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${ind.iconColor}`} />
                </div>
                <p className="text-[10px] font-bold text-[#283353] uppercase tracking-tight leading-tight flex-1">
                  {ind.title}
                </p>
              </div>
              <p className="text-xl font-extrabold text-[#1b1b1b] ml-1">
                {ind.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile - Circular FAB buttons stacked vertically */}
      <div className="md:hidden flex flex-col gap-2">
        {indicators.map((ind, idx) => {
          const Icon = ind.icon;
          const isExpanded = expandedIndex === idx;

          return (
            <div key={idx} className="relative flex justify-end">
              {/* Expanded content - slides out to the left */}
              {isExpanded && (
                <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border-2 border-[#c1d3ff] rounded-xl shadow-xl p-3 min-w-[160px] animate-in slide-in-from-right-2 duration-200">
                  <p className="text-[9px] font-bold text-[#283353] uppercase tracking-tight leading-tight mb-1">
                    {ind.title}
                  </p>
                  <p className="text-2xl font-extrabold text-[#1b1b1b] leading-none">
                    {ind.value}
                  </p>
                </div>
              )}

              {/* Circular button - always visible */}
              <button
                onClick={() => toggleExpand(idx)}
                className="relative bg-white/95 backdrop-blur-md border-2 border-[#c1d3ff] hover:border-[#3772ff] shadow-lg hover:shadow-xl transition-all duration-200 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer group"
              >
                <Icon className={`${ind.iconColor} h-5 w-5 transition-transform group-hover:scale-110`} />

                {/* Pulse indicator when collapsed */}
                {!isExpanded && (
                  <div className="absolute -top-0.5 -right-0.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3772ff] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3772ff]"></span>
                    </span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
