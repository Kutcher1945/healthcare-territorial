import { Building2, BarChart3, RotateCcw } from "lucide-react";

export default function Analytics() {
  return (
    <div className="flex flex-col gap-1.5 p-2 md:px-3 bg-white/95 border-t">
      <h3 className="text-left ml-1 font-bold text-gray-800 text-[11px] md:text-xs">Аналитика</h3>

      <button className="flex items-center gap-2 w-full rounded-lg border border-gray-100 bg-white shadow-sm p-2 hover:bg-gray-50 transition-colors text-left">
        <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="font-medium text-blue-900 text-[10px] md:text-[11px] leading-tight">Сводка по районам</span>
      </button>

      <button className="flex items-center gap-2 w-full rounded-lg border border-gray-100 bg-white shadow-sm p-2 hover:bg-gray-50 transition-colors text-left">
        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="font-medium text-blue-900 text-[10px] md:text-[11px] leading-tight">Возраст зданий</span>
      </button>

      <button className="flex items-center justify-center gap-1.5 w-full mt-0.5 rounded-lg border border-gray-100 bg-gray-50/50 p-1.5 text-gray-500 hover:bg-gray-100 transition-colors">
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="font-medium text-[10px]">Сбросить</span>
      </button>
    </div>
  );
}