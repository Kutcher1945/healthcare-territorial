"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, MapPin, Info } from "lucide-react";

export default function DetailedInfoRight({ buildingData }) {
  const [detailCardData, setDetailCardData] = useState({});
  const [data5month, setData5month] = useState({});
  const [buildingAnalysis, setBuildingAnalysis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtersHidden, setFiltersHidden] = useState(false);

  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return "—";
    return Number(num).toLocaleString("ru-RU");
  };

  const calculatePercent = (part, total) => {
    if (!total || total === 0) return "0%";
    return `${((part / total) * 100).toFixed(0)}%`;
  };

  useEffect(() => {
    async function fetchData() {
      if (!buildingData?.id) return;
      setIsLoading(true);
      setError(null);
      setFiltersHidden(false);
      const itemID = buildingData.id;

      try {
        const [response1, response2, response3] = await Promise.all([
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/${itemID}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/clinic-visit-5month/${itemID}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?search=${itemID}`),
        ]);

        if (!response1.ok || !response2.ok || !response3.ok) throw new Error("Ошибка");

        const [d1, d2, d3] = await Promise.all([response1.json(), response2.json(), response3.json()]);
        setDetailCardData(d1 || {});
        setData5month(d2 || {});
        setBuildingAnalysis(d3.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [buildingData]);

  if (!buildingData?.id) return null;

  const StatCard = ({ value, label, subValue, isLoading, textColor = "text-gray-900" }) => (
    <div className="text-center rounded-lg border bg-white shadow-sm p-1.5 flex flex-col justify-center items-center h-full">
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
      ) : (
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-[13px] md:text-[14px] ${textColor}`}>{value}</span>
          {subValue && <span className={`text-[10px] font-medium opacity-70 ${textColor}`}>{subValue}</span>}
        </div>
      )}
      <p className="text-[9px] text-gray-500 mt-1 leading-tight tracking-tighter">{label}</p>
    </div>
  );

  const childrenCount = Number(detailCardData.children_total) || 0;
  const adultsCount = Number(detailCardData.adults_total) || 0;
  const totalPop = childrenCount + adultsCount;

  const maleCount = Number(detailCardData.male_count) || 0;
  const femaleCount = Number(detailCardData.female_count) || 0;
  const totalGender = maleCount + femaleCount;

  return (
    <div className="relative">
      <div className="flex flex-col max-h-[calc(100vh-100px)] bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden text-xs">
        
        {/* Шапка */}
        <div className="sticky top-0 z-20 bg-white border-b p-2 md:p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[12px] md:text-[13px] leading-tight text-gray-900 truncate">
                {buildingData.name || "Поликлиника"}
              </h3>
              <div className="flex items-center text-gray-500 gap-1 mt-1">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span className="text-[10px] truncate">{buildingData.district} район</span>
              </div>
            </div>
            <button
              onClick={() => setFiltersHidden(!filtersHidden)}
              className="shrink-0 p-1 hover:bg-gray-100 rounded"
            >
              <svg className={`w-4 h-4 transition-transform ${filtersHidden ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Контент со скроллом */}
        <div className="overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="p-2 md:p-3 space-y-3">
            
            {/* Секция ВОП (Всегда видна) */}
            <div className="grid grid-cols-2 gap-1.5">
              <StatCard value={detailCardData.vop_count || "—"} label="Врачи ВОП" textColor="text-blue-600" isLoading={isLoading} />
              <StatCard value={Math.ceil(detailCardData.vop_needed) || "0"} label="Дефицит ВОП" textColor="text-red-500" isLoading={isLoading} />
            </div>

            {/* Разворачиваемая часть */}
            <div className={`space-y-3 transition-all duration-300 ${filtersHidden ? "hidden" : "block"}`}>
              
              <section>
                <div className="text-left text-[12px] font-bold text-gray-400 mb-1.5 px-1">Основные показатели</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard value={detailCardData.overall_coverage_ratio || "—"} label="Загрузка" isLoading={isLoading} />
                  <StatCard value={data5month.per_1_person || "—"} label="Посещ/чел" isLoading={isLoading} />
                  <StatCard value={formatNumber(detailCardData.total_population)} label="Население" isLoading={isLoading} />
                  <StatCard value={formatNumber(detailCardData.total_covered)} label="Мощность" isLoading={isLoading} />
                </div>
              </section>

              <section>
                <div className="text-left text-[12px] font-bold text-gray-400 mb-1.5 px-1">Демография</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard 
                    value={formatNumber(childrenCount)} 
                    subValue={calculatePercent(childrenCount, totalPop)} 
                    label="Дети (0-18)" 
                    textColor="text-teal-600"
                    isLoading={isLoading} 
                  />
                  <StatCard 
                    value={formatNumber(adultsCount)} 
                    subValue={calculatePercent(adultsCount, totalPop)} 
                    label="Взрослые (18+)" 
                    textColor="text-blue-900"
                    isLoading={isLoading} 
                  />
                  <StatCard 
                    value={formatNumber(maleCount)} 
                    subValue={calculatePercent(maleCount, totalGender)} 
                    label="Мужчины" 
                    textColor="text-blue-700"
                    isLoading={isLoading} 
                  />
                  <StatCard 
                    value={formatNumber(femaleCount)} 
                    subValue={calculatePercent(femaleCount, totalGender)} 
                    label="Женщины" 
                    textColor="text-pink-600"
                    isLoading={isLoading} 
                  />
                </div>
              </section>

              <section>
                <div className="text-left text-[12px] font-bold text-gray-400 mb-1.5 px-1">Здание</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard value={formatNumber(buildingAnalysis?.[0]?.total_area_sq_m_field)} label="Площадь м²" isLoading={isLoading} />
                  <StatCard value={formatNumber(buildingAnalysis?.[0]?.building_volume_cubic_m_field)} label="Объем м³" isLoading={isLoading} />
                </div>
              </section>

              <div className="flex gap-1.5 items-start p-2 bg-blue-50/50 rounded-lg">
                <Info className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-blue-700/70 leading-tight">
                  Данные предоставлены МЗ РК. Возможны расхождения в реальном времени.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}