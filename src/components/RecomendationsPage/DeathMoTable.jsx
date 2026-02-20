"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function DeathMoTable({ moData, setMoData }) {
    const [data, setData] = useState([])
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [loadStatusFilter, setLoadStatusFilter] = useState("all") 

    const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

    useEffect(() => {
        async function fetchData() {
            try {
                let url;
                const baseUrl = "https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/";

                if (moData && moData.id) {
                    url = `${baseUrl}${moData.id}/`;
                } else {
                    url = `${baseUrl}?limit=100`;
                    if (priorityFilter !== "all") {
                        url += `&priority_level=${priorityFilter}`;
                    }
                    if (loadStatusFilter !== "all") {
                        url += `&load_status=${loadStatusFilter}`;
                    }
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                
                const json = await response.json();
                
                let resultData = [];
                if (moData && moData.id) {
                    resultData = [json]; 
                } else {
                    resultData = json.results || [];
                }

                setData(resultData);

            } catch (err) {
                console.error("Failed to fetch stats", err);
                setData([]);
            }
        }

        fetchData();
    }, [moData, priorityFilter, loadStatusFilter]) 

    const clearFilters = () => {
        setPriorityFilter("all");
        setLoadStatusFilter("all");
        setMoData(null); 
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'priority_score') {
                    aVal = (aVal === null || aVal === undefined || aVal === '-') ? -1 : Number(aVal);
                    bVal = (bVal === null || bVal === undefined || bVal === '-') ? -1 : Number(bVal);
                }

                if (aVal < bVal) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const handleSort = (key) => {
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                setSortConfig({ key, direction: 'desc' });
            } else if (sortConfig.direction === 'desc') {
                setSortConfig({ key: null, direction: null });
            }
        } else {
            setSortConfig({ key, direction: 'asc' });
        }
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <span className="ml-1"><ChevronUp className="w-4 h-4"/></span>
        }
        return (
            <span className="ml-1">
                {sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </span>
        )
    }

    const renderPriorityBadge = (level) => {
        let styles = "";
        let dotColor = "";
        let label = "";

        switch (level) {
            case "high":
                styles = "bg-red-50 text-red-700 border-red-100";
                dotColor = "bg-red-500";
                label = "Высокий";
                break;
            case "low":
                styles = "bg-emerald-50 text-emerald-700 border-emerald-100";
                dotColor = "bg-emerald-500";
                label = "Низкий";
                break;
            case "medium":
            default:
                styles = "bg-orange-50 text-orange-700 border-orange-100";
                dotColor = "bg-orange-500";
                label = "Средний";
                break;
        }

        return (
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                {label}
            </div>
        );
    };

    const renderStatusStyle = (status) => {
        let styles = "bg-gray-50 text-gray-700 border-gray-100";
        let dotColor = "bg-gray-500";
        let label = "-";

        switch (status) {
            case "Перегружен":
                styles = "bg-red-50 text-red-700 border-red-100";
                dotColor = "bg-red-500";
                label = "Перегружен";
                break;
            case "Оптимально":
                styles = "bg-emerald-50 text-emerald-700 border-emerald-100";
                dotColor = "bg-emerald-500";
                label = "Оптимально";
                break;
            case "Недозагрузка":
            default:
                styles = "bg-orange-50 text-orange-700 border-orange-100";
                dotColor = "bg-orange-500";
                label = "Недозагрузка";
                break;
        }

        return (
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                {label}
            </div>
        );
    };

    const formatPopulation = (value) => {
        if (value === null || value === undefined || value === '') return '-';

        return new Intl.NumberFormat('ru-RU', {
            maximumFractionDigits: 0,
        }).format(Number(value));
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-300 flex flex-col max-h-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-end items-center bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    {(moData && moData.id) || priorityFilter !== "all" || loadStatusFilter !== "all" ? (
                        <button 
                            onClick={clearFilters} 
                            className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                            ✕ Сбросить фильтр
                        </button>
                    ) : null}

                    {(!moData || !moData.id) && (
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Уровень:</span>
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <option value="all">Все</option>
                                    <option value="high">Высокий</option>
                                    <option value="medium">Средний</option>
                                    <option value="low">Низкий</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Статус:</span>
                                <select
                                    value={loadStatusFilter}
                                    onChange={(e) => setLoadStatusFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <option value="all">Все</option>
                                    <option value="Перегружен">Перегружен</option>
                                    <option value="Оптимально">Оптимально</option>
                                    <option value="Недозагрузка">Недозагрузка</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0"> 
                <table className="min-w-full border border-gray-100 text-sm rounded-lg relative border-separate border-spacing-0">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th rowSpan="2" className="px-4 py-3 text-left border-b border-gray-200 font-semibold text-gov-text-primary bg-gray-50">
                                Название МО
                            </th>
                            
                            <th colSpan="3" className="px-4 py-2 text-center border-b border-gray-200 border-l border-r border-gray-200 font-semibold text-gov-text-primary bg-gray-50">
                                Факт
                            </th>

                            <th rowSpan="2" className="px-4 py-3 text-left border-b border-gray-200 border-r border-gray-200 font-semibold text-gov-text-primary bg-gray-50">
                                Уровень критичности (1-6)
                            </th>
                            
                            <th rowSpan="2" 
                                className="px-4 py-3 text-left border-b border-gray-200 font-semibold text-gov-text-primary cursor-pointer hover:bg-gray-100 bg-gray-50"
                                onClick={() => handleSort('priority_score')}
                            >
                                <div className="flex items-center">
                                    Оценка состояния
                                    <SortIcon columnKey="priority_score" />
                                </div>
                            </th>

                            <th colSpan="3" className="px-4 py-2 text-center border-b border-gray-200 border-l border-r border-gray-200 font-semibold text-gov-text-primary bg-gray-50">
                                Нехватка
                            </th>

                            <th rowSpan="2" className="px-4 py-3 text-left border-b border-gray-200 border-r border-gray-200 font-semibold text-gov-text-primary bg-gray-50">
                                Мощность МО
                            </th>
                            <th rowSpan="2" className="px-4 py-3 text-left border-b border-gray-200 border-r border-gray-200 font-semibold text-gov-text-primary bg-gray-50">
                                Население
                            </th>
                            <th rowSpan="2" className="px-4 py-3 text-left border-b border-gray-200 border-r border-gray-200 font-semibold text-gov-text-primary bg-gray-50">
                                Статус
                            </th>
                        </tr>

                        <tr>
                            <th className="px-4 py-2 text-center border-b border-gray-200 border-l border-gray-200 font-medium text-gray-600 bg-gray-50 text-xs uppercase tracking-wider">
                                Терапевт
                            </th>
                            <th className="px-4 py-2 text-center border-b border-gray-200 font-medium text-gray-600 bg-gray-50 text-xs uppercase tracking-wider">
                                Педиатр
                            </th>
                            <th className="px-4 py-2 text-center border-b border-gray-200 border-r border-gray-200 font-medium text-gray-600 bg-gray-50 text-xs uppercase tracking-wider">
                                ВОП
                            </th>

                            <th className="px-4 py-2 text-center border-b border-gray-200 border-l border-gray-200 font-medium text-gray-600 bg-gray-50 text-xs uppercase tracking-wider">
                                Терапевт
                            </th>
                            <th className="px-4 py-2 text-center border-b border-gray-200 font-medium text-gray-600 bg-gray-50 text-xs uppercase tracking-wider">
                                Педиатр
                            </th>
                            <th className="px-4 py-2 text-center border-b border-gray-200 border-r border-gray-200 font-medium text-gray-600 bg-gray-50 text-xs uppercase tracking-wider">
                                ВОП
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {sortedData && sortedData.length > 0 ? (
                            sortedData.map((item, i) => (
                                <tr 
                                    key={i} 
                                    className="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                                    onClick={() => {
                                        setMoData(item);
                                    }}
                                >
                                    <td className="px-4 py-3 text-left text-gov-text-primary font-medium">
                                        {item.name}
                                    </td>

                                    <td className="px-4 py-3 text-center text-gray-600 border-l border-gray-100">
                                        {item.therap_count || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {item.peds_count || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">
                                        {item.vop_count || '-'}
                                    </td>

                                    <td className="px-4 py-3 text-left border-r border-gray-100">
                                        {renderPriorityBadge(item.priority_level) || 'Нет данных'}
                                    </td>

                                    <td className="px-4 py-3 text-center text-gray-800">
                                        {item.priority_score || 'Нет данных'}
                                    </td>

                                    <td className="px-4 py-3 text-center text-red-600 bg-red-50/30 border-l border-gray-100">
                                        {item.deficit_therap || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-red-600 bg-red-50/30">
                                        {item.deficit_peds || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-red-600 bg-red-50/30 border-r border-gray-100">
                                        {item.deficit_vop || '-'}
                                    </td>

                                    <td className="px-4 py-3 text-left text-gray-600 border-r border-gray-100">
                                        {formatPopulation(item.total_covered) || 'Нет данных'}
                                    </td>

                                    <td className="px-4 py-3 text-left text-gray-600 border-r border-gray-100">
                                        {formatPopulation(item.total_population) || 'Нет данных'}
                                    </td>

                                    <td className="px-4 py-3 text-left text-gray-600 border-r border-gray-100">
                                        {renderStatusStyle(item.load_status) || 'Нет данных'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Ничего не найдено. Попробуйте изменить параметры фильтрации</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}