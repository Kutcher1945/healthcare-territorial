import { useState, useEffect } from "react";

export default function MapFilterIndicators({ totalCount, totalPopulation, avgVisit, avgPerson, selectedDistrict }) {
  // const [vopData, setVopData] = useState([]);

  const formatPopulation = (value) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} млн`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)} тыс`;
    return value.toString();
  };

  const formatAvgPerson = (value) => Math.ceil(value * 100) / 100;

  // const calcDeficitVop = (data) => {
  //   const sum = (data.peds_count * 800) + (data.vop_count * 1700) + (data.therap_count * 2200);
  //   const diff = data.total_population - sum;
  //   return Math.ceil(diff / 1700);
  // };

  useEffect(() => {
    async function fetchData() {
      const filter = selectedDistrict !== "Все районы" ? `district=${selectedDistrict}` : "";
      try {
        const response = await fetch(
          `https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/count_by_district/?${filter}`
        );
        const data = await response.json();
        // setVopData(data.totals);
      } catch (err) {
        console.error("Failed to fetch deficit data", err);
      }
    }
    fetchData();
  }, [selectedDistrict]);

  return (
    <div className="space-y-2 text-xs bg-white/95 p-3">
      
      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center rounded-lg border bg-white shadow p-2">
          <div className="font-semibold text-blue-800 text-[16px]">{totalCount}</div>
          <p className="text-xs text-gray-500 mt-2">Всего поликлиник</p>
        </div>

        <div className="text-center rounded-lg border bg-white shadow p-2">
          <div className="font-semibold text-blue-800 text-[16px]">
            {formatPopulation(totalPopulation)}
          </div>
          <p className="text-xs text-gray-500 mt-2">Обслуживаемое население</p>
        </div>
      </div>

      {/* Row 2 */}
        <div className="grid grid-cols-2 gap-2">
            <div className="text-center rounded-lg border bg-white shadow p-2">
                <div className="font-semibold text-blue-800 text-[16px]">
                    {formatAvgPerson(avgVisit)}
                </div>
                <p className="text-xs text-gray-500 mt-2">Ср. посещении на поликлинику</p>
            </div>

            {/* <div className="text-center rounded-lg border bg-white shadow p-2">
                <div className="font-semibold text-blue-800 text-[16px]">
                    {vopData ? calcDeficitVop(vopData) : 0}
                </div>
                <p className="text-xs text-gray-500 mt-2">Дефицит ВОП</p>
            </div> */}
            <div className="text-center rounded-lg border bg-white shadow p-2">
                <div className="font-semibold text-blue-800 text-[16px]">
                    {formatAvgPerson(avgPerson)}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Ср. посещении на человека
                </p>
            </div>
        </div>

      {/* Note */}
      <div className="bg-blue-200/40 p-3 rounded-lg border-l-4 border-blue-500">
        <div className="text-left text-[10px]">
          <b>Примечание:</b> Для просмотра детальной информации по медицинским учреждениям кликните на соответствующую точку на карте.
        </div>
      </div>

    </div>
  );
}
