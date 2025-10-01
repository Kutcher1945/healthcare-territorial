export default function Indicators({totalCount, totalPopulation, avgVisit, avgPerson}) {
    const formatAvgPerson = (value) => {
        return Math.ceil(value * 100) / 100; // ceil, keep 2 digits
    };

    const formatPopulation = (value) => {
        if (value >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(2)} млн`;
        } else if (value >= 1_000) {
            return `${(value / 1_000).toFixed(2)} тыс`;
        }
        return value.toString();
    };

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:grid-cols-2 items-center justify-center">
            <div className="p-2 border rounded-xl border border-blue-200 bg-blue-200/30">
                <p className="text-gray-600">
                    Ср посещении на человека
                </p>
                <div className="text-2xl font-bold">
                    {formatAvgPerson(avgPerson)}
                </div>
            </div>
            <div className="p-2 border rounded-xl border border-purple-200 bg-purple-200/30">
                <p className="text-gray-600">
                    Всего поликлиник
                </p>
                <div className="text-2xl font-bold">
                    {totalCount}
                </div>
            </div>
            <div className="p-2 border rounded-xl border border-green-200 bg-green-200/30">
                <p className="text-gray-600">
                    Ср посещении на поликлинику
                </p>  
                <div className="text-2xl font-bold">
                    {formatAvgPerson(avgVisit)}
                </div>
            </div>
            <div className="p-2 border rounded-xl border border-yellow-200 bg-yellow-200/30">
                <p className="text-gray-600">
                    Обслуживаемое население
                </p>
                <div className="text-2xl font-bold">
                    {formatPopulation(totalPopulation)}
                </div>
            </div>
        </div>
    )
}