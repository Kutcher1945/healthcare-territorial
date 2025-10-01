import {
    Building, 
    MapPin,
    User,
    Users,
    Percent,
    Hospital,
    AlertTriangle,
    Donut,
    Gauge,
    Box,
    LayoutGrid,
    Ruler,
    AlertCircle,
    Stethoscope
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DetailCard({buildingData, showDetailCard, setShowDetailCard}){
    const [detailCardData, setDetailCardData] = useState([]);
    const [data5month, setData5month] = useState([]);
    const [buildingAnalysis, setBuildingAnalysis] = useState({});

    useEffect(() => {
        async function fetchData() {
            // const itemID = buildingData.id || " ";
            const itemID = buildingData?.id ?? 12;
            const minID = buildingData?.id ?? 12;
            try {
              const response1 = await fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/org-capacity/${itemID}`);
              const response2 = await fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/clinic-visit-5month/${itemID}`);
              const response3 = await fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/buildings-analysis/?search=${minID}`);
              const data_json1 = await response1.json();
              const data_json2 = await response2.json();
              const data_json3 = await response3.json();
              const data3 = data_json3.results;
            //   const data = data_json.results;
              setDetailCardData(data_json1);
              setData5month(data_json2);
              setBuildingAnalysis(data3);
            } catch (error) {
                console.error("Failed to fetch detail card data", error);
            }
        }
        fetchData();
    }, [buildingData]);

    const handleClose = ()=>{
        setShowDetailCard(!showDetailCard);
    }

    return (
        <div className="space-y-4">
            {showDetailCard&&(
                <div className="rounded-xl border bg-white shadow-sm">
                    {/* Header */}
                    <div className="p-4 border-b">
                        <div className="flex items-start">
                            <div className="flex flex-col items-start">
                                <div className="flex items-center justify-between gap-2 text-lg font-semibold mb-2">
                                    <div>
                                        <Hospital className="h-5 w-5 text-green-600"/>
                                    </div>
                                    <h2 className="col-span-4 text-left">
                                        {detailCardData.name}
                                    </h2>
                                    
                                </div>
                                <p className="text-xs text-left text-muted-foreground">
                                    {buildingData.address}, {buildingData.district} район
                                    id: {buildingData.id}
                                </p>
                            </div>
                            <button
                                onClick={()=>handleClose()}
                                className="ml-auto text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <div className='flex flex-col items-start'>
                                <div className="text-sm font-medium">
                                    Загруженность
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {detailCardData.overall_coverage_ratio ?? "—"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <div className='flex flex-col items-start'>
                                <div className="text-sm font-medium">
                                    Посещаемость 1 человека
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {data5month.per_1_person ?? "—"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Donut className="h-4 w-4 text-pink-500" />
                            <div className='flex flex-col items-start'>
                                <div className="text-sm font-medium">
                                    <p>{`Доля детей (0-18)`}</p> 
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {/* {detailCardData.children_total} */}
                                    {(() => {
                                        const children = Number(detailCardData.children_total) || 0;
                                        const adults = Number(detailCardData.adults_total) || 0;
                                        const total = children + adults;
                                        const percent = total ? (children / total) * 100 : 0;
                                        return `${percent.toFixed(1)}%`;
                                    })()}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Donut className="h-4 w-4 text-pink-500" />
                            <div className='flex flex-col items-start'>
                                <div className="text-sm font-medium">
                                    {`Доля взрослых (18 и старше)`} 
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {/* {detailCardData.adults_total} */}
                                    {(() => {
                                        const children = Number(detailCardData.children_total) || 0;
                                        const adults = Number(detailCardData.adults_total) || 0;
                                        const total = children + adults;
                                        const percent = total ? (adults / total) * 100 : 0;
                                        return `${percent.toFixed(1)}%`;
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <div className='flex flex-col items-start'>
                                <div className="text-sm font-medium">
                                    Население
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {detailCardData.total_population ?? "—"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-purple-500" />
                            <div className='flex flex-col items-start'>
                                <div className="text-sm font-medium">
                                    Мощность поликлиники
                                </div>
                                <div className="text-sm text-primary font-semibold">
                                    {detailCardData.total_covered ?? "—"}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Box className="h-4 w-4 text-amber-700" />
                            <div className='flex flex-col items-start'>
                                <div className="text-sm font-medium">
                                    Объем здания
                                </div>
                                    <div className="text-sm text-primary font-semibold">
                                        {buildingAnalysis?.[0]?.building_volume_cubic_m_field ?? "—"}
                                    </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-yellow-500" />
                            <div className='flex flex-col items-start'>
                                <div className="text-sm font-medium">
                                    Общая площадь
                                </div>
                                <div className="text-sm text-primary font-semibold">
                                    {buildingAnalysis?.[0]?.total_area_sq_m_field ?? "—"}
                                </div>
                            </div>
                        </div>
                        {/* <div className='flex items-center justify-between pr-4'> */}
                        <div className='grid grid-cols-2'>
                            <div className="flex items-center justify-center gap-2 border-r bg-blue-100 rounded-l">
                                <Stethoscope className="h-4 w-4 text-blue-500" />
                                <div className='flex flex-col items-start'>
                                    <div className="text-sm font-medium">
                                        Кол-во ВОП
                                    </div>
                                    <div className="text-sm text-primary font-semibold">
                                        {detailCardData?.vop_count ?? "—"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 bg-red-100 rounded-l">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <div className='flex flex-col items-start'>
                                    <div className="text-sm font-medium">
                                        Дефицит ВОП
                                    </div>
                                    <div className="text-sm text-primary font-semibold">
                                        {detailCardData?.vop_needed ?? "—"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            )}
            
            {!showDetailCard&&(
                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <div className="text-center">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                            Выберите поликлинику для детальной информации
                        </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}