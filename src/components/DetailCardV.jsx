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

    const formatNumber= (num) => {
        if (isNaN(num)) return ""
        const number = Number(num)
        // Adds commas every 3 digits, e.g., 1000 -> "1,000"
        return number.toLocaleString("en-US")
    }

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
      <div className="group relative overflow-hidden rounded-lg bg-white border border-[#e8e8e8] p-2.5 transition-all duration-200 hover:shadow-md hover:border-[#c1d3ff]">
        <div className="flex items-center gap-2">
          <div className={`relative rounded-md p-1.5 ${colors.bg} border ${colors.border} transition-transform group-hover:scale-105 duration-200`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-md`}></div>
            {itemLoading ? (
              <Loader2 className={`h-3.5 w-3.5 ${colors.icon} animate-spin relative z-10`} />
            ) : (
              <Icon className={`h-3.5 w-3.5 ${colors.icon} relative z-10`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-[#283353] uppercase tracking-wide truncate leading-tight">{title}</p>
            <p className="text-xs font-bold text-[#1b1b1b] mt-0.5">
              {itemLoading ? <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse"></div> : (value ?? "—")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const CollapsibleSection = ({ title, sectionKey, children, icon: Icon }) => (
    <div className="space-y-2">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left group bg-[#ebf1ff] hover:bg-[#e1eaff] rounded-lg p-2 transition-all duration-200 border border-[#c1d3ff] hover:border-[#3772ff]"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-white border border-[#c1d3ff] group-hover:border-[#3772ff] transition-colors">
            <Icon className="h-3.5 w-3.5 text-[#3772ff]" />
          </div>
          <h3 className="text-[10px] font-bold text-[#283353] uppercase tracking-wide">{title}</h3>
        </div>
        {collapsedSections[sectionKey] ? (
          <ChevronDown className="h-4 w-4 text-[#283353] transition-all duration-200 group-hover:text-[#3772ff]" />
        ) : (
          <ChevronUp className="h-4 w-4 text-[#283353] transition-all duration-200 group-hover:text-[#3772ff]" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          collapsedSections[sectionKey] ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
        }`}
      >
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  )

  return (
    <>
      {showDetailCard && (
        <div className="h-full flex flex-col bg-[#eaebee] border-r-2 border-[#bcc0ca] shadow-2xl">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#3772ff] to-[#2956bf] p-3 border-b-2 border-[#2956bf]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnptMCAxMGMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNGMtMi4yMSAwLTQgMS43OS00IDRzMS43OSA0IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

            <div className="relative flex items-start justify-between">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-xl bg-white opacity-20 blur-md"></div>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 text-[#3772ff] animate-spin" />
                    ) : (
                      <Hospital className="h-5 w-5 text-[#3772ff]" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-tight drop-shadow-sm">
                    {isLoading ? (
                      <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
                    ) : (
                      detailCardData.name || buildingData.name || "Неизвестная поликлиника"
                    )}
                  </h2>
                  <div className="flex items-center gap-1 text-[10px] text-white/90 mb-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate font-medium">{buildingData.district} район</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <span className="text-[9px] text-white/80">ID:</span>
                    <span className="text-[9px] font-semibold text-white">{buildingData.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {error && (
                  <button
                    onClick={handleRetry}
                    className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
                    title="Повторить загрузку"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-white/80 hover:bg-red-500/20 hover:text-white transition-all duration-200"
                  title="Закрыть"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 detail-card-scroll">
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
