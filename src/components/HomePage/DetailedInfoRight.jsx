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
    const number = Number(num);
    return number.toLocaleString("ru-RU");
  };

  const calculatePercent = (part, total) => {
    if (!total || total === 0) return "(0 %)";
    return `(${((part / total) * 100).toFixed(1)}%)`.replace('.', ',');
  };

  useEffect(() => {
    async function fetchData() {
      if (!buildingData?.id) return;

      setIsLoading(true);
      setError(null);
      setFiltersHidden(false);

      const itemID = buildingData?.id ?? 12;

      try {
        const [response1, response2, response3] = await Promise.all([
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/${itemID}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/clinic-visit-5month/${itemID}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?search=${itemID}`),
        ]);

        if (!response1.ok || !response2.ok || !response3.ok) {
          throw new Error("Ошибка загрузки данных");
        }

        const [data_json1, data_json2, data_json3] = await Promise.all([
          response1.json(),
          response2.json(),
          response3.json(),
        ]);

        setDetailCardData(data_json1 || {});
        setData5month(data_json2 || {});
        setBuildingAnalysis(data_json3.results || []);
      } catch (error) {
        console.error("Failed to fetch detail card data", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [buildingData]);

  const handleRetry = () => {
    setIsLoading(true);
  };

  if (!buildingData) return null;

  const StatCard = ({ value, label, subValue, isLoading, textColor = "text-gray-900" }) => (
    <div className="text-center rounded-lg border shadow p-1.5 md:p-2 bg-white flex flex-col justify-center items-center h-full">
      <div className={`font-semibold text-sm md:text-[16px] leading-tight ${isLoading ? 'text-gray-300' : textColor}`}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-400" />
        ) : (
          value
        )}
      </div>
      {subValue && !isLoading && (
        <div className={`text-xs md:text-[16px] font-semibold leading-tight mt-0.5 ${textColor}`}>{subValue}</div>
      )}
      <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 leading-tight">{label}</p>
    </div>
  );

  const childrenCount = Number(detailCardData.children_total) || 0;
  const adultsCount = Number(detailCardData.adults_total) || 0;
  const totalPop = childrenCount + adultsCount;

  const maleCount = Number(detailCardData.male_count) || 0;
  const femaleCount = Number(detailCardData.female_count) || 0;
  const totalGender = maleCount + femaleCount;

  return (
    <>
      {buildingData?.id && (
        <div className="relative">
          <div className="flex flex-col max-h-[80vh] bg-white/95 backdrop-blur-sm rounded-xl md:rounded-xl border shadow-md md:shadow-lg overflow-hidden text-xs md:text-sm">
            
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b">
              <div className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div className="w-full pr-2">
                     <h3 className="font-bold text-left text-xs md:text-[16px] leading-tight mb-1 text-gray-900">
                      {buildingData.name || "Поликлиника"}
                    </h3>
                    
                    <div className="flex items-center text-gray-500 gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-red-600 flex-shrink-0" />
                      <span className="text-[10px] md:text-xs text-black truncate">
                        {buildingData.district ? `${buildingData.district} район` : "Район"}
                      </span>
                      {error && (
                        <button onClick={handleRetry} className="ml-2 text-red-500 hover:text-red-700" title="Повторить загрузку">
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setFiltersHidden(!filtersHidden)}
                    className="text-gray-600 hover:text-gray-900 transition-transform p-1 bg-gray-50 rounded-md border"
                    title={filtersHidden ? "Показать подробности" : "Скрыть подробности"}
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-300 ${
                        filtersHidden ? "" : "rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar">
              <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <StatCard 
                    value={detailCardData.vop_count || "—"} 
                    label="ВОП" 
                    textColor="text-blue-700"
                    isLoading={isLoading} 
                  />
                  <StatCard 
                    value={detailCardData.vop_needed ? Number(detailCardData.vop_needed).toFixed(0) : 0} 
                    label="Дефицит ВОП" 
                    textColor="text-blue-700"
                    isLoading={isLoading} 
                  />
                </div>

                <div
                  className={`flex flex-col min-h-0 transition-all duration-500 ease-in-out ${
                    filtersHidden ? "max-h-0 opacity-0 overflow-hidden" : "max-h-[1000px] opacity-100"
                  }`}
                >
                  <div className="space-y-3 md:space-y-4">
                    
                    <div>
                      <div className="text-left font-semibold text-gray-900 mb-2">Основные показатели:</div>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <StatCard 
                          value={detailCardData.overall_coverage_ratio || "—"} 
                          label="Загруженность" 
                          textColor="text-black"
                          isLoading={isLoading} 
                        />
                        <StatCard 
                          value={data5month.per_1_person || "—"} 
                          label="Посещ. на человека" 
                          textColor="text-black"
                          isLoading={isLoading} 
                        />
                        <StatCard 
                          value={formatNumber(detailCardData.total_population).replace(/,/g, " ")} 
                          label="Население" 
                          textColor="text-black"
                          isLoading={isLoading} 
                        />
                        <StatCard 
                          value={formatNumber(detailCardData.total_covered).replace(/,/g, " ")} 
                          label="Мощность" 
                          textColor="text-black"
                          isLoading={isLoading} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-left font-semibold text-gray-900 mb-2">Демография:</div>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
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
                    </div>

                    <div>
                      <div className="text-left font-semibold text-gray-900 mb-2">Здание:</div>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <StatCard 
                          value={formatNumber(buildingAnalysis?.[0]?.building_volume_cubic_m_field)} 
                          label="Объем (м³)" 
                          textColor="text-black"
                          isLoading={isLoading} 
                        />
                        <StatCard 
                          value={formatNumber(buildingAnalysis?.[0]?.total_area_sq_m_field)} 
                          label="Площадь (м²)" 
                          textColor="text-black"
                          isLoading={isLoading} 
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 items-start pt-2 border-t border-gray-50">
                      <Info className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-400 text-[9px] md:text-[10px] leading-snug text-left">
                        Данные предоставляются Министерством Здравоохранения.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}