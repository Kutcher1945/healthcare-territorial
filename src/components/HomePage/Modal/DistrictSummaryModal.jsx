import { useEffect, useState } from "react";
import { X, ClipboardList, Loader2 } from "lucide-react";
import { HealthcareService } from "../../../services/apiService";

const getPctClass = (val) => {
    const num = parseFloat(val);
    if (num >= 120) return "text-red-700 font-bold";
    if (num >= 100) return "text-orange-600 font-bold";
    if (num >= 90) return "text-green-600 font-bold";
    return "text-green-800";
};

export default function DistrictSummaryModal({ onClose }) {
    const [distData, setDistData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await HealthcareService.getDistrictSummary();
                
                const sortedData = data.sort((a, b) => 
                    parseFloat(b.avg_cap_load) - parseFloat(a.avg_cap_load)
                );
                
                setDistData(sortedData);
            } catch (err) {
                setError("Не удалось загрузить данные");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="w-[400px] bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-left-2">
            {/* Header */}
            <div className="bg-[#1565C0] p-2 px-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    <span className="font-bold text-sm">Сводка по районам</span>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-10 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-[10px] text-gray-400">Загрузка данных...</span>
                    </div>
                ) : error ? (
                    <div className="p-10 text-center text-red-500 text-xs">{error}</div>
                ) : (
                    <table className="w-full text-[11px] md:text-xs">
                        <thead className="bg-blue-50 text-blue-800 border-b sticky top-0 z-10">
                            <tr>
                                <th className="p-2 text-left">Район</th>
                                <th className="p-2 text-center">ПМСП</th>
                                <th className="p-2 text-center">Нас.</th>
                                <th className="p-2 text-center">Ср% посещ.</th>
                                <th className="p-2 text-center">Ср% врачи</th>
                            </tr>
                        </thead>
                        <tbody>
                            {distData.map((r, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-2 font-medium text-gray-700">
                                        {r.district?.replace(" район", "") || "—"}
                                    </td>
                                    <td className="p-2 text-center text-gray-600">{r.count}</td>
                                    <td className="p-2 text-center text-gray-600">
                                        {r.pop ? (r.pop >= 1000 ? `${Math.round(r.pop / 1000)}K` : r.pop) : "—"}
                                    </td>
                                    <td className={`p-2 text-center ${getPctClass(r.avg_cap_load)}`}>
                                        {r.avg_cap_load ? `${r.avg_cap_load}%` : "—"}
                                    </td>
                                    <td className={`p-2 text-center ${getPctClass(r.avg_doc_load)}`}>
                                        {r.avg_doc_load ? `${r.avg_doc_load}%` : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="p-2 bg-gray-50 text-[9px] text-gray-400 italic border-t">
                * Данные обновляются в реальном времени на основе текущей нагрузки.
            </div>
        </div>
    );
}