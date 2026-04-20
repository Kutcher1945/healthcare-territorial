import { X, ClipboardList } from "lucide-react";

const distData = [
    { "district": "Наурызбайский", "count": 6, "pop": 187000, "avg_cap_load": 131.7, "avg_doc_load": 109.7 },
    { "district": "Алатауский", "count": 7, "pop": 269000, "avg_cap_load": 128.6, "avg_doc_load": 151.5 },
    { "district": "Турксибский", "count": 8, "pop": 265000, "avg_cap_load": 124.1, "avg_doc_load": 130.5 },
    { "district": "Медеуский", "count": 6, "pop": 268000, "avg_cap_load": 118.6, "avg_doc_load": 131.0 },
    { "district": "Жетысуский", "count": 6, "pop": 188000, "avg_cap_load": 118.1, "avg_doc_load": 105.5 },
    { "district": "Ауэзовский", "count": 13, "pop": 361000, "avg_cap_load": 106.1, "avg_doc_load": 113.6 },
    { "district": "Алмалинский", "count": 16, "pop": 349000, "avg_cap_load": 92.8, "avg_doc_load": 126.0 },
    { "district": "Бостандыкский", "count": 16, "pop": 509000, "avg_cap_load": 84.7, "avg_doc_load": 124.6 }
];

const getPctClass = (val) => {
    if (val >= 120) return "text-red-700 font-bold";
    if (val >= 100) return "text-orange-600 font-bold";
    if (val >= 90) return "text-green-600 font-bold";
    return "text-green-800";
};

export default function DistrictSummaryModal({ onClose }) {
    return (
        <div className="absolute left-[105%] top-0 w-[400px] bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden z-[100]">
            <div className="bg-blue-700 p-2 px-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    <span className="font-bold text-sm">Сводка по районам</span>
                </div>
                <button onClick={onClose} className="hover:bg-blue-600 rounded-full p-1">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <table className="w-full text-[11px] md:text-xs">
                <thead className="bg-blue-50 text-blue-800 border-b">
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
                            <td className="p-2 font-medium text-gray-700">{r.district}</td>
                            <td className="p-2 text-center">{r.count}</td>
                            <td className="p-2 text-center">{(r.pop / 1000).toFixed(0)}K</td>
                            <td className={`p-2 text-center ${getPctClass(r.avg_cap_load)}`}>
                                {r.avg_cap_load}%
                            </td>
                            <td className={`p-2 text-center ${getPctClass(r.avg_doc_load)}`}>
                                {r.avg_doc_load}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}