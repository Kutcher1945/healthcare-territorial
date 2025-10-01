import { useEffect, useState } from "react";

export default function Infratable(){
    const [merged, setMerged] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const [res1, res2] = await Promise.all([
                fetch("https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/?limit=100"),
                fetch("https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?limit=300")
            ]);

            const json1 = await res1.json();
            const json2 = await res2.json();

            // Normalize responses
            const arr1 = Array.isArray(json1) ? json1 : json1.results || json1.data || [];
            const arr2 = Array.isArray(json2) ? json2 : json2.results || json2.data || [];

            // Create lookup for API2 (min → object)
            const lookup = {};
            arr2.forEach(item => {
                if (item.min) {
                    lookup[item.min] = item;
                }
            });

            // Build merged data from API1
            const mergedData = arr1.map(item => {
                const match = lookup[item.id] || {};
                return {
                    id: item.id,
                    name: item.name,
                    buildingVolume: match.building_volume_cubic_m_field ?? "N/A",
                    totalArea: match.total_area_sq_m_field ?? "N/A",
                    usedPart: match.used_part_of_the_building ?? "N/A",
                    ownershipRight: match.ownership_right ?? "N/A"
                };
            });

            // ✅ Sort alphabetically by name
            mergedData.sort((a, b) => a.name.localeCompare(b.name));

            setMerged(mergedData);
        }
        fetchData();
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="relative flex-1 overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-blue-200">
                        <tr>
                            <th className="px-4 py-2 border ">Название</th>
                            <th className="px-4 py-2 border ">Объем здания, м3</th>
                            <th className="px-4 py-2 border ">Общая площадь, м2</th>
                            <th className="px-4 py-2 border ">Используемая часть здания</th>
                            <th className="px-4 py-2 border ">Право собственности</th>
                        </tr>
                    </thead>
                    <tbody>
                        {merged.map((item) => (
                            <tr className="hover:bg-gray-50 hover:bg-gray-100">
                                <td className="px-4 py-2 border text-left">{item.name}</td>
                                <td className="px-4 py-2 border">{item.buildingVolume}</td>
                                <td className="px-4 py-2 border">{item.totalArea}</td>
                                <td className="px-4 py-2 border">{item.usedPart}</td>
                                <td className="px-4 py-2 border">{item.ownershipRight}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}