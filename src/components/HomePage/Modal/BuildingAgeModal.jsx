import { useEffect, useState } from "react";
import { X, Building2, Loader2 } from "lucide-react";

export default function BuildingAgeModal({ onClose }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://admin.smartalmaty.kz/api/v1/healthcare/analytics/buildings/age-stats/")
            .then(res => res.json())
            .then(json => {
                // Фильтруем "nan" и сортируем по старым зданиям (pre1970)
                const filtered = json
                    .filter(item => item.district !== "nan")
                    .sort((a, b) => b.pre1970 - a.pre1970);
                setData(filtered);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="absolute left-[105%] top-0 w-[650px] bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden z-[100]">
            <div className="bg-indigo-600 p-2 px-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="font-bold text-sm">Возраст зданий по районам</span>
                </div>
                <button onClick={onClose} className="hover:bg-indigo-500 rounded-full p-1">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : (
                    <table className="w-full text-[11px] md:text-xs">
                        <thead className="bg-indigo-50 text-indigo-800 border-b sticky top-0">
                            <tr>
                                <th className="p-2 text-left">Район</th>
                                <th className="p-2 text-center">Всего зд.</th>
                                <th className="p-2 text-center text-red-700">50+ лет</th>
                                <th className="p-2 text-center text-orange-600">1970-2000</th>
                                <th className="p-2 text-center text-green-700">После 2000</th>
                                <th className="p-2 text-center text-purple-700">Критич.</th>
                                <th className="p-2 text-center text-gray-600">Снос</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((r, i) => {
                                const pctOld = Math.round((r.pre1970 / r.total) * 100);
                                return (
                                    <tr key={i} className={`border-b hover:bg-gray-50 ${pctOld > 30 ? 'bg-red-50/30' : ''}`}>
                                        <td className="p-2 font-bold text-gray-800">{r.district}</td>
                                        <td className="p-2 text-center font-semibold">{r.total}</td>
                                        <td className="p-2 text-center text-red-700 font-bold">
                                            {r.pre1970 > 0 ? (
                                                <>{r.pre1970} <span className="text-[10px] text-gray-400 font-normal">({pctOld}%)</span></>
                                            ) : "—"}
                                        </td>
                                        <td className="p-2 text-center text-orange-600">{r.p1970_2000 || "—"}</td>
                                        <td className="p-2 text-center text-green-700">{r.post2000 || "—"}</td>
                                        <td className="p-2 text-center text-purple-800 font-bold">{r.critical || "—"}</td>
                                        <td className="p-2 text-center text-gray-500">{r.snos || "—"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="p-2 bg-gray-50 text-[10px] text-gray-400 italic">
                * «50+ лет» — здания, построенные до 1970 года.
            </div>
        </div>
    );
}