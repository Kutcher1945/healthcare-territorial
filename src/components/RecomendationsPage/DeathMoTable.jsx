"use client";

import { useState, useEffect } from "react";

export default function DeathMoTable({ moData }) {
    const [data, setData] = useState([])
    const [priorityFilter, setPriorityFilter] = useState("all") // State for filter

    // State for dynamic column headers
    // const [headers, setHeaders] = useState({ 
    //     needed: "Нужен ВОП", 
    //     deficit: "Дефицит ВОП" 
    // })

    useEffect(() => {
        async function fetchData() {
            try {
                let url;
                const baseUrl = "https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/";

                // 1. Determine URL based on Map Selection OR Filter
                if (moData && moData.id) {
                    // CASE A: Specific point selected from Map (Ignore filter)
                    url = `${baseUrl}${moData.id}/`;
                } else {
                    // CASE B: List View (Apply filter)
                    url = `${baseUrl}?limit=100`;
                    
                    if (priorityFilter !== "all") {
                        url += `&priority_level=${priorityFilter}`;
                    }
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                
                const json = await response.json();
                
                // 2. Prepare Data Array
                let resultData = [];
                if (moData && moData.id) {
                    resultData = [json]; 
                } else {
                    resultData = json.results || [];
                }

                setData(resultData);

                // 3. Update Column Headers based on the data
                // updateHeaders(resultData);

            } catch (err) {
                console.error("Failed to fetch stats", err);
                setData([]);
            }
        }

        fetchData();
    }, [moData, priorityFilter]) // Re-run when Map Selection OR Filter changes

    // Helper to calculate headers
    // const updateHeaders = (currentData) => {
    //     let newHeaders = { needed: "Нужен ВОП", deficit: "Дефицит ВОП" };

    //     if (currentData && currentData.length > 0) {
    //         const type = currentData[0].profile_type;
    //         if (type === "adult") {
    //             newHeaders = { needed: "Нужен Терапевт", deficit: "Дефицит Терапевт" };
    //         } else if (type === "pediatric") {
    //             newHeaders = { needed: "Нужен Педиатр", deficit: "Дефицит Педиатр" };
    //         } else {
    //             newHeaders = { needed: "Нужен ВОП", deficit: "Дефицит ВОП" };
    //         }
    //     }
    //     setHeaders(newHeaders);
    // };

    // Helper to get row values
    // const getStats = (item) => {
    //     if (item.profile_type === "adult") {
    //         return { needed: item.needed_therap, deficit: item.deficit_therap };
    //     } else if (item.profile_type === "pediatric") {
    //         return { needed: item.needed_peds, deficit: item.deficit_peds };
    //     } else {
    //         return { needed: item.needed_vop, deficit: item.deficit_vop };
    //     }
    // };

    const getStatus = (item) => {
        if (item === "understaffed") return "явно не хватает";
        if (item === "balanced") return "баланс";
        if (item === "overshift") return "перекос";
        return "-";
    };

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
        <div className="histogram-container bg-white rounded-xl shadow-md border border-gray-300 h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-end items-center bg-white sticky top-0 z-20">
                {/* <h3 className="text-sm font-bold text-[#1b1b1b] uppercase tracking-wide">
                    Материнская смерть по МО
                </h3> */}

                <div className="flex items-center gap-2">
                    {/* CONDITION: Show Filter only if NO specific map point is selected */}
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
                        /* If Map Point is Selected, show Reset Button */
                        <button 
                            onClick={() => window.location.reload()} 
                            className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                            ✕ Сбросить фильтр
                        </button>
                    )}
                </div>
            </div>

            <div className="p-2 pt-0 h-full overflow-hidden">
                <div className="overflow-y-auto h-full max-h-[calc(100vh-200px)]"> 
                    <table className="min-w-full border border-gray-100 text-sm rounded-lg relative">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                    Название МО
                                </th>
                                <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                    {/* {headers.needed} */}
                                    Нужно Терапевт
                                </th>
                                <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                    {/* {headers.deficit} */}
                                    Нужно ВОП
                                </th>
                                <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                    {/* {headers.deficit} */}
                                    Нужно Педиатр
                                </th>
                                <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                                    Приоритетная оценка
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
                            {data && data.length > 0 ? (
                                data.map((item, i) => {
                                    // const { needed, deficit } = getStats(item);
                                    return (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0">
                                            <td className="px-4 py-3 text-left text-gov-text-primary font-medium">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {/* {needed} */}
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
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-400">
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
        </div>
    )
}