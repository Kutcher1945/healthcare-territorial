"use client";

import { useState, useEffect, useMemo } from "react";
// 1. Import Icons from lucide-react
import { ChevronUp, ChevronDown } from "lucide-react"; 

export default function DeathMoTable({ moData }) {
    const [data, setData] = useState([])
    const [priorityFilter, setPriorityFilter] = useState("all") 

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
    }, [moData, priorityFilter]) 

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Convert to numbers for priority_score
                if (sortConfig.key === 'priority_score') {
                    // Handle cases where data might be null or '-'
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
                setSortConfig({ key: null, direction: null }); // Reset to default
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

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-300 flex flex-col max-h-full overflow-hidden">

            <div className="p-4 border-b border-gray-100 flex justify-end items-center bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    {(!moData || !moData.id) ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">Приоритет:</span>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                <option value="all">Все</option>
                                <option value="high">Высокий</option>
                                <option value="medium">Средний</option>
                                <option value="low">Низкий</option>
                            </select>
                        </div>
                    ) : (
                        <button 
                            onClick={() => window.location.reload()} 
                            className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                            ✕ Сбросить фильтр
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0"> 
                <table className="min-w-full border border-gray-100 text-sm rounded-lg relative">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                Название МО
                            </th>
                            <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                Нужно Терапевт
                            </th>
                            <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                Нужно ВОП
                            </th>
                            <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                Нужно Педиатр
                            </th>
                            
                            {/* 6. Updated Header for Priority Score */}
                            <th 
                                className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary cursor-pointer transition-colors hover:bg-gray-100"
                                onClick={() => handleSort('priority_score')}
                            >
                                <div className="flex items-center">
                                    Приоритетная оценка
                                    <SortIcon columnKey="priority_score" />
                                </div>
                            </th>

                            <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                Приоритетный уровень
                            </th>
                            <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                Терапевт
                            </th>
                            <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                ВОП
                            </th>
                            <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                Педиатр
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 7. Map over sortedData instead of data */}
                        {sortedData && sortedData.length > 0 ? (
                            sortedData.map((item, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="px-4 py-3 text-left text-gov-text-primary font-medium">
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.deficit_therap || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800">
                                        {item.deficit_vop || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800">
                                        {item.deficit_peds || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.priority_score || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {renderPriorityBadge(item.priority_level) || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.therap_count || '-'}
                                    </td>  
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.vop_count || '-'}
                                    </td>  
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.peds_count || '-'}
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
                                        <span>Нет данных по выбранным критериям</span>
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