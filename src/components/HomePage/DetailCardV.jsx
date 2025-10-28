"use client"

import {
  MapPin,
  User,
  Users,
  Hospital,
  AlertTriangle,
  Gauge,
  Ruler,
  AlertCircle,
  Stethoscope,
  X,
  Loader2,
  RefreshCw,
  Activity,
  TrendingUp,
  Building,
  ChevronDown,
  ChevronUp,
  Venus,
  Mars,
} from "lucide-react"
import { useState, useEffect } from "react"

export default function DetailCard({ buildingData, showDetailCard, setShowDetailCard }) {
  const [collapsedSections, setCollapsedSections] = useState({
    metrics: false,
    demographics: false,
    building: false,
    vop: false,
  })

  const [detailCardData, setDetailCardData] = useState([])
  const [data5month, setData5month] = useState([])
  const [buildingAnalysis, setBuildingAnalysis] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggleSection = (sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  useEffect(() => {
    async function fetchData() {
      if (!buildingData?.id) return

      setIsLoading(true)
      setError(null)

      const itemID = buildingData?.id ?? 12
      const minID = buildingData?.id ?? 12

      try {
        const [response1, response2, response3] = await Promise.all([
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/${itemID}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/clinic-visit-5month/${itemID}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?search=${minID}`),
        ])

        if (!response1.ok || !response2.ok || !response3.ok) {
          throw new Error("Ошибка загрузки данных")
        }

        const [data_json1, data_json2, data_json3] = await Promise.all([
          response1.json(),
          response2.json(),
          response3.json(),
        ])

        const data3 = data_json3.results
        setDetailCardData(data_json1)
        setData5month(data_json2)
        setBuildingAnalysis(data3)
      } catch (error) {
        console.error("Failed to fetch detail card data", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (showDetailCard && buildingData?.id) {
      fetchData()
    }
  }, [buildingData, showDetailCard])

  const handleClose = () => {
    setShowDetailCard(!showDetailCard)
  }

  const handleRetry = () => {
    if (buildingData?.id) {
      const event = new Event("retry")
      // Trigger useEffect by updating a dependency
      setError(null)
      setIsLoading(true)
      // Re-fetch data
      setTimeout(() => {
        const itemID = buildingData?.id ?? 12
        const minID = buildingData?.id ?? 12

        Promise.all([
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/${itemID}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/clinic-visit-5month/${itemID}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?search=${minID}`),
        ])
          .then(async ([response1, response2, response3]) => {
            if (!response1.ok || !response2.ok || !response3.ok) {
              throw new Error("Ошибка загрузки данных")
            }
            const [data_json1, data_json2, data_json3] = await Promise.all([
              response1.json(),
              response2.json(),
              response3.json(),
            ])
            const data3 = data_json3.results
            setDetailCardData(data_json1)
            setData5month(data_json2)
            setBuildingAnalysis(data3)
          })
          .catch((error) => {
            setError(error.message)
          })
          .finally(() => {
            setIsLoading(false)
          })
      }, 100)
    }
  }

    const formatNumber = (num) => {
      if (isNaN(num)) return "";
      const number = Number(num);
      // Use space as a thousands separator
      return number.toLocaleString("en-US").replace(/,/g, " ");
    };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: "bg-[#ebf1ff]", border: "border-[#c1d3ff]", icon: "text-[#3772ff]", gradient: "from-[#3772ff] to-[#2c5bcc]" },
      green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", gradient: "from-green-500 to-green-600" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", gradient: "from-orange-500 to-orange-600" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", gradient: "from-purple-500 to-purple-600" },
      pink: { bg: "bg-pink-50", border: "border-pink-200", icon: "text-pink-600", gradient: "from-pink-500 to-pink-600" },
      indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", gradient: "from-indigo-500 to-indigo-600" },
      amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", gradient: "from-amber-500 to-amber-600" },
      yellow: { bg: "bg-yellow-50", border: "border-yellow-200", icon: "text-yellow-600", gradient: "from-yellow-500 to-yellow-600" },
      cyan: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600", gradient: "from-cyan-500 to-cyan-600" },
      red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", gradient: "from-red-500 to-red-600" },
    };
    return colorMap[color] || colorMap.blue;
  };

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
  }

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
  )

  return (
    <>
      {showDetailCard && (
        // <div className="h-full flex flex-col bg-gradient-to-br from-[#3772ff] via-[#2956bf] to-[#1e3a8a] shadow-2xl">
        <div className="h-full flex flex-col bg-white shadow-2xl">
          {/* Modern Header with Glass Effect */}
          <div className="relative bg-white/10 backdrop-blur-md border-b border-white/20">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/40 via-white/60 to-white/40"></div>

            <div className="p-4 border-b flex items-start justify-between">

              {/* Clinic Info */}
              <div className="flex flex-col items-start text-left w-full">
                {/* Title - with icon and decorative styling */}
                <div className="flex items-center gap-3 w-full mb-3">
                  {/* Icon Badge */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg"></div>
                    <div className="relative w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center transform transition-transform hover:scale-105 duration-200">
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 text-[#3772ff] animate-spin" />
                      ) : (
                        <Hospital className="h-6 w-6 text-[#3772ff]" />
                      )}
                    </div>
                  </div>

                  {/* Title with decorative underline */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-black leading-tight mb-1 drop-shadow-lg">
                      {isLoading ? (
                        <div className="h-6 w-48 bg-white/20 rounded-lg animate-pulse"></div>
                      ) : (
                        <span className="relative inline-block">
                          {detailCardData.name || buildingData.name || "Неизвестная поликлиника"}
                          {/* Decorative underline */}
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-black/60 via-black/80 to-transparent rounded-full"></span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-black/80 font-medium">Медицинское учреждение</p>
                  </div>
                </div>

                {/* Meta info chips - enhanced */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-gray/30 hover:bg-gray/30 hover:border-gray/50 transition-all duration-200">
                    <MapPin className="h-4 w-4 text-black group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-black">{buildingData.district}</span>
                  </div>
                  <div className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-gray/30 hover:bg-gray/30 hover:border-gray/50 transition-all duration-200">
                    <Building className="h-4 w-4 text-black group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-black">ID: {buildingData.id}</span>
                  </div>
                </div>
              </div>
              {/* Action buttons - top right */}
              <div className="flex justify-end gap-1 mb-3">
                {error && (
                  <button
                    onClick={handleRetry}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
                    title="Повторить загрузку"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg text-black/70 hover:text-black hover:bg-gray-500/30 transition-all duration-200"
                  title="Закрыть"
                  aria-label="Закрыть панель"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content - Compact layout to fit on one screen */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 detail-card-scroll">
            {/* {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-red-800">Ошибка загрузки</p>
                    <p className="text-xs text-red-600 truncate">{error}</p>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200 transition-colors flex-shrink-0"
                  >
                    Повторить
                  </button>
                </div>
              </div>
            )} */}

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
                value={(Number(detailCardData?.vop_needed)).toFixed(0)}
                color="red"
                isLoading={isLoading}
              />
            </CollapsibleSection>

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
      )}
    </>
  )
}
