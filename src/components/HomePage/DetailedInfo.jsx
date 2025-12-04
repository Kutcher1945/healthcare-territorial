"use client";

import {
  MapPin,
  User,
  Users,
  Hospital,
  Gauge,
  Ruler,
  AlertCircle,
  Stethoscope,
  Loader2,
  Activity,
  TrendingUp,
  Building,
  ChevronDown,
  Venus,
  Mars,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DetailedInfo({ buildingData }) {
  // --- STATE MANAGEMENT ---
  const [collapsedSections, setCollapsedSections] = useState({
    metrics: false,
    demographics: true, // Collapsed by default to save space
    building: true,     // Collapsed by default
    vop: false,
  });

  const [detailCardData, setDetailCardData] = useState({});
  const [data5month, setData5month] = useState({});
  const [buildingAnalysis, setBuildingAnalysis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- HELPER FUNCTIONS ---
  const toggleSection = (sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return "—";
    const number = Number(num);
    return number.toLocaleString("en-US").replace(/,/g, " ");
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: "bg-[#ebf1ff]", border: "border-[#c1d3ff]", icon: "text-[#3772ff]" },
      green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600" },
      pink: { bg: "bg-pink-50", border: "border-pink-200", icon: "text-pink-600" },
      indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600" },
      amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600" },
      yellow: { bg: "bg-yellow-50", border: "border-yellow-200", icon: "text-yellow-600" },
      cyan: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600" },
      red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600" },
    };
    return colorMap[color] || colorMap.blue;
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    async function fetchData() {
      if (!buildingData?.id) return;

      setIsLoading(true);
      setError(null);

      // Use buildingData ID or fallback
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
    setError(null);
    const itemID = buildingData?.id ?? 12;
    Promise.all([
        fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/${itemID}`),
        fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/clinic-visit-5month/${itemID}`),
        fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?search=${itemID}`),
    ]).then(async ([r1, r2, r3]) => {
        if (!r1.ok || !r2.ok || !r3.ok) throw new Error("Ошибка");
        const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
        setDetailCardData(d1);
        setData5month(d2);
        setBuildingAnalysis(d3.results);
    }).catch(e => setError(e.message)).finally(() => setIsLoading(false));
  };

  // --- SUB COMPONENTS ---

  const InfoItem = ({ icon: Icon, title, value, color = "blue", isLoading: itemLoading }) => {
    const colors = getColorClasses(color);

    return (
      <div className="group relative rounded-lg bg-white border border-gray-200 p-2 transition-all duration-200 hover:shadow-sm hover:border-blue-300">
        <div className="flex items-center gap-2">
          <div className={`flex-shrink-0 rounded-md p-1.5 ${colors.bg} transition-transform group-hover:scale-105 duration-200`}>
            {itemLoading ? (
              <Loader2 className={`h-3.5 w-3.5 ${colors.icon} animate-spin`} />
            ) : (
              <Icon className={`h-3.5 w-3.5 ${colors.icon}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-600 truncate leading-tight">{title}</p>
            <p className="text-xs font-semibold text-gray-900 leading-tight mt-0.5">
              {itemLoading ? <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div> : (value ?? "—")}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const CollapsibleSection = ({ title, sectionKey, children, icon: Icon }) => (
    <div className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex w-full items-center justify-between gap-2 p-2.5 text-left transition-all duration-200 hover:bg-gray-50 group"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="rounded-md bg-blue-50 p-1.5 transition-transform group-hover:scale-105 duration-200">
            <Icon className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <h3 className="text-xs font-semibold text-gray-900 truncate">{title}</h3>
        </div>
        <div className={`transition-transform duration-200 text-gray-400 ${!collapsedSections[sectionKey] ? "rotate-180" : ""}`}>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          collapsedSections[sectionKey] ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        }`}
      >
        <div className="p-2 pt-0 space-y-1.5 bg-gray-50">{children}</div>
      </div>
    </div>
  );

  if (!buildingData) return null;

  // --- RENDER ---
  return (
    <div className="h-full flex flex-col bg-white border-t border-gray-200 max-h-[80vh]">
      {/* Header */}
      <div className="relative bg-white/50 backdrop-blur-sm border-b border-gray-100 p-4">
        <div className="flex flex-col items-start text-left w-full">
          <div className="flex items-center gap-3 w-full mb-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-blue-100/50 rounded-xl blur-md"></div>
              <div className="relative w-10 h-10 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 text-[#3772ff] animate-spin" />
                ) : (
                  <Hospital className="h-5 w-5 text-[#3772ff]" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 leading-tight mb-0.5">
                {isLoading ? (
                  <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  buildingData.name || "Неизвестная поликлиника"
                )}
              </h3>
              <p className="text-[10px] text-gray-500 font-medium">Медицинское учреждение</p>
            </div>
            
            {error && (
               <button onClick={handleRetry} className="p-1 hover:bg-gray-100 rounded-full" title="Повторить загрузку">
                 <RefreshCw className="w-3 h-3 text-gray-400"/>
               </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-100">
              <MapPin className="h-3 w-3 text-gray-500" />
              <span className="text-[10px] font-semibold text-gray-700">{buildingData.district || "Район не указан"}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-100">
                <Building className="h-3 w-3 text-gray-500" />
                <span className="text-[10px] font-semibold text-gray-700">ID: {buildingData.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        
        {/* SECTION: VOP */}
        <CollapsibleSection title="ВОП" sectionKey="vop" icon={Stethoscope}>
          <InfoItem
            icon={Stethoscope}
            title="Количество ВОП"
            value={detailCardData?.vop_count}
            color="cyan"
            isLoading={isLoading}
          />
          <InfoItem
            icon={AlertCircle}
            title="Дефицит ВОП"
            value={detailCardData?.vop_needed ? Number(detailCardData.vop_needed).toFixed(0) : 0}
            color="red"
            isLoading={isLoading}
          />
        </CollapsibleSection>

        {/* SECTION: METRICS */}
        <CollapsibleSection title="Основные показатели" sectionKey="metrics" icon={Activity}>
          <InfoItem
            icon={Activity}
            title="Загруженность"
            value={detailCardData.overall_coverage_ratio}
            color="orange"
            isLoading={isLoading}
          />
          <InfoItem
            icon={TrendingUp}
            title="Посещений на человека"
            value={data5month.per_1_person}
            color="blue"
            isLoading={isLoading}
          />
          <InfoItem
            icon={Users}
            title="Население"
            value={formatNumber(detailCardData.total_population)}
            color="green"
            isLoading={isLoading}
          />
          <InfoItem
            icon={Gauge}
            title="Мощность"
            value={formatNumber(detailCardData.total_covered)}
            color="purple"
            isLoading={isLoading}
          />
        </CollapsibleSection>

        {/* SECTION: DEMOGRAPHICS */}
        <CollapsibleSection title="Демография" sectionKey="demographics" icon={Users}>
              <InfoItem
                icon={User}
                title="Дети (0-18)"
                value={(() => {
                  const children = Number(detailCardData.children_total) || 0
                  const adults = Number(detailCardData.adults_total) || 0
                  const total = children + adults
                  const percent = total ? (children / total) * 100 : 0
                  return `${formatNumber(children)} - ${percent.toFixed(1)}%`
                })()}
                color="yellow"
                isLoading={isLoading}
              />

              <InfoItem
                icon={Users}
                title="Взрослые (18 и старше)"
                value={(() => {
                  const children = Number(detailCardData.children_total) || 0
                  const adults = Number(detailCardData.adults_total) || 0
                  const total = children + adults
                  const percent = total ? (adults / total) * 100 : 0
                  return `${formatNumber(adults)} - ${percent.toFixed(1)}%`
                })()}
                color="indigo"
                isLoading={isLoading}
              />

              <InfoItem
                icon={Mars}
                title="Мужчины"
                value={(() => {
                  const male = Number(detailCardData.male_count) || 0
                  const female = Number(detailCardData.female_count) || 0
                  const total = male + female
                  const percent = total ? (male / total) * 100 : 0
                  return `${formatNumber(male)} - ${percent.toFixed(1)}%`
                })()}
                color="blue"
                isLoading={isLoading}
              />

              <InfoItem
                icon={Venus}
                title="Женщины"
                value={(() => {
                  const male = Number(detailCardData.male_count) || 0
                  const female = Number(detailCardData.female_count) || 0
                  const total = male + female
                  const percent = total ? (female / total) * 100 : 0
                  return `${formatNumber(female)} - ${percent.toFixed(1)}%`
                })()}
                color="pink"
                isLoading={isLoading}
              />
        </CollapsibleSection>

        {/* SECTION: BUILDING */}
        <CollapsibleSection title="Здание" sectionKey="building" icon={Building}>
              <InfoItem
                icon={Building}
                title="Объем здания"
                value={formatNumber(buildingAnalysis?.[0]?.building_volume_cubic_m_field)}
                color="amber"
                isLoading={isLoading}
              />

              <InfoItem
                icon={Ruler}
                title="Общая площадь"
                value={formatNumber(buildingAnalysis?.[0]?.total_area_sq_m_field)}
                color="yellow"
                isLoading={isLoading}
              />
        </CollapsibleSection>

      </div>
    </div>
  );
}