export default function MapFilterIndicators({ totalCount, totalPopulation, avgVisit, avgPerson}) {

  const formatPopulation = (value) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} млн`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)} тыс`;
    return value.toString();
  };

  const formatAvgPerson = (value) => Math.ceil(value * 100) / 100;

  return (
    <div className="space-y-2 text-xs bg-white/95 p-3">
      
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center rounded-lg border bg-white shadow p-2">
          <div className="font-semibold text-blue-800 text-[16px]">{totalCount || '-'}</div>
          <p className="text-xs text-gray-500 mt-2">Всего поликлиник</p>
        </div>

        <div className="text-center rounded-lg border bg-white shadow p-2">
          <div className="font-semibold text-blue-800 text-[16px]">
            {formatPopulation(totalPopulation) || '-'}
          </div>
          <p className="text-xs text-gray-500 mt-2">Обслуживаемое население</p>
        </div>
      </div>

        <div className="grid grid-cols-2 gap-2">
            <div className="text-center rounded-lg border bg-white shadow p-2">
                <div className="font-semibold text-blue-800 text-[16px]">
                    {formatAvgPerson(avgVisit) || '-'}
                </div>
                <p className="text-xs text-gray-500 mt-2">Ср. посещении на поликлинику</p>
            </div>

            <div className="text-center rounded-lg border bg-white shadow p-2">
                <div className="font-semibold text-blue-800 text-[16px]">
                    {formatAvgPerson(avgPerson) || '-'}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Ср. посещении на человека
                </p>
            </div>
        </div>

      <div className="bg-blue-200/40 p-3 rounded-lg border-l-4 border-blue-500">
        <div className="text-left text-[10px]">
          <b>Примечание:</b> Для просмотра детальной информации по медицинским учреждениям кликните на соответствующую точку на карте.
        </div>
      </div>
    </div>
  );
}
