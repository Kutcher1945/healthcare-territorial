"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, MapPin, Info } from "lucide-react";

export default function DetailedInfo({ buildingData }) {
  // --- STATE MANAGEMENT ---
  const [detailCardData, setDetailCardData] = useState({});
  const [data5month, setData5month] = useState({});
  const [buildingAnalysis, setBuildingAnalysis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- HELPER FUNCTIONS ---
  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return "—";
    const number = Number(num);
    return number.toLocaleString("ru-RU");
  };

  const calculatePercent = (part, total) => {
    if (!total || total === 0) return "(0 %)";
    return `(${((part / total) * 100).toFixed(1)}%)`.replace('.', ',');
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    async function fetchData() {
      if (!buildingData?.id) return;

      setIsLoading(true);
      setError(null);

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

  // --- REUSABLE STAT CARD ---
  // Updated: accepts 'textColor' to override colors per card
  const StatCard = ({ value, label, subValue, isLoading, textColor = "text-gray-900" }) => (
    <div className="text-center rounded-lg border shadow p-2 bg-white">
      <div className={`font-semibold text-[16px] ${isLoading ? 'text-gray-300' : textColor}`}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-400" />
        ) : (
          value
        )}
      </div>
      {subValue && !isLoading && (
        <div className={`text-[12px] font-semibold leading-tight mt-0.5 ${textColor}`}>{subValue}</div>
      )}
      <p className="text-xs text-gray-500 mt-2 leading-tight">{label}</p>
    </div>
  );

  // --- PREPARE DATA ---
  const childrenCount = Number(detailCardData.children_total) || 0;
  const adultsCount = Number(detailCardData.adults_total) || 0;
  const totalPop = childrenCount + adultsCount;

  const maleCount = Number(detailCardData.male_count) || 0;
  const femaleCount = Number(detailCardData.female_count) || 0;
  const totalGender = maleCount + femaleCount;

  return (
      <div className="space-y-3 text-xs bg-white/95 p-3 border-t pb-20">
        
        {/* Header Section */}
        <div className="flex items-start justify-between p-3 rounded-lg">
          <div className="w-full">
            <h3 className="font-bold text-left text-sm leading-tight mb-1">
              {buildingData.name || "Поликлиника"}
            </h3>
            <p className="text-gray-400 text-[10px] mb-1 text-left">Медицинское учреждение</p>
            <div className="flex items-center text-gray-500 gap-1">
              <MapPin className="w-3 h-3 text-red-600" />
              <span className="text-black">{`${buildingData.district} район`|| "Район"}</span>
              {error && (
                  <button onClick={handleRetry} className="ml-auto text-red-500 hover:text-red-700">
                      <RefreshCw className="w-3 h-3" />
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION: VOP (Blue Text) */}
        <div className="grid grid-cols-2 gap-2">
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

        {/* SECTION: MAIN INDICATORS (Black Text) */}
        <div className="text-left font-semibold text-gray-900 mt-2">Основные показатели:</div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard 
            value={detailCardData.overall_coverage_ratio || "—"} 
            label="Загруженность" 
            textColor="text-black"
            isLoading={isLoading} 
          />
          <StatCard 
            value={data5month.per_1_person || "—"} 
            label="Посещений на человека" 
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

        {/* SECTION: DEMOGRAPHY (Colored Text) */}
        <div className="text-left font-semibold text-gray-900 mt-2">Демография:</div>
        <div className="grid grid-cols-2 gap-2">
          {/* Children: Teal/Green */}
          <StatCard 
            value={formatNumber(childrenCount)} 
            subValue={calculatePercent(childrenCount, totalPop)} 
            label="Дети (0-18)" 
            textColor="text-teal-600"
            isLoading={isLoading} 
          />
          {/* Adults: Dark Blue */}
          <StatCard 
            value={formatNumber(adultsCount)} 
            subValue={calculatePercent(adultsCount, totalPop)} 
            label="Взрослые (18+)" 
            textColor="text-blue-900"
            isLoading={isLoading} 
          />
          {/* Men: Blue */}
          <StatCard 
            value={formatNumber(maleCount)} 
            subValue={calculatePercent(maleCount, totalGender)} 
            label="Мужчины" 
            textColor="text-blue-700"
            isLoading={isLoading} 
          />
          {/* Women: Pink */}
          <StatCard 
            value={formatNumber(femaleCount)} 
            subValue={calculatePercent(femaleCount, totalGender)} 
            label="Женщины" 
            textColor="text-pink-600"
            isLoading={isLoading} 
          />
        </div>

        {/* SECTION: BUILDING (Black Text) */}
        <div className="text-left font-semibold text-gray-900 mt-2">Здание:</div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard 
            value={formatNumber(buildingAnalysis?.[0]?.building_volume_cubic_m_field)} 
            label="Объем здания (м³)" 
            textColor="text-black"
            isLoading={isLoading} 
          />
          <StatCard 
            value={formatNumber(buildingAnalysis?.[0]?.total_area_sq_m_field)} 
            label="Общая площадь (м²)" 
            textColor="text-black"
            isLoading={isLoading} 
          />
        </div>
        
        {/* Footer info */}
        <div className="flex gap-2 items-start mt-4">
             <Info className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5"/>
             <p className="text-gray-400 text-[10px] leading-snug text-left">
                Данные предоставляются Министерством Здравоохранения.
             </p>
        </div>

      </div>
  );
}