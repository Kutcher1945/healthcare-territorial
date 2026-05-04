import React from 'react';
import { Hospital } from 'lucide-react';

const recommendations = [
  { id: 1, district: "Алатауский район", pop: "15 495", clinics: 2, color: "#ef4444" },
  { id: 2, district: "Наурызбайский район", pop: "13 826", clinics: 2, color: "#ef4444" },
  { id: 3, district: "Бостандыкский район", pop: "12 400", clinics: 1, color: "#f97316" },
  { id: 4, district: "Алмалинский район", pop: "12 200", clinics: 1, color: "#f97316" },
  { id: 5, district: "Бостандыкский район", pop: "10 923", clinics: 1, color: "#f97316" },
  { id: 6, district: "Медеуский район", pop: "8 750", clinics: 1, color: "#22c55e" },
];

export default function PlanningToolList() {
  return (
    <div className="space-y-2 p-2 bg-gray-50/50">
      {/* Мини-табы фильтрации списка */}
      <div className="flex gap-1 mb-3">
        <button className="flex-1 py-1 text-[10px] bg-blue-600 text-white rounded font-bold">Все</button>
        <button className="flex-1 py-1 text-[10px] bg-white border border-gray-200 rounded text-gray-500">⚠️ Критические</button>
        <button className="flex-1 py-1 text-[10px] bg-white border border-gray-200 rounded text-gray-500">🟡 Средние</button>
      </div>

      {recommendations.map((item) => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-2 flex gap-3 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
          <div className="w-1 rounded-full" style={{ backgroundColor: item.color }}></div>
          <div className="flex-1">
            <div className="flex items-center gap-1 text-[11px] mb-0.5">
              <span className="font-bold" style={{ color: item.color }}>#{item.id}</span>
              <span className="font-bold text-gray-700">{item.district}</span>
            </div>
            <div className="text-[12px] font-bold text-gray-800">{item.pop} <span className="text-[10px] text-gray-400 font-normal">вне доступа</span></div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-medium">
              <Hospital className="w-3 h-3" />
              <span>{item.clinics} амбулатории</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}