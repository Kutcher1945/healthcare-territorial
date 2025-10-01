import React, { useEffect, useState } from "react";

export default function PersonalTable(){
    const [tableData, setTableData] = useState([]);
    const [tableDataDetail, setTableDataDetail] = useState([]);
    const [rowClicked, setRowCLicked] = useState(false);
    const [vopId, setVopId] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
              const response = await fetch("https://admin.smartalmaty.kz/api/v1/healthcare/vop-with-medical-org/?limit=3000");
              const data_json = await response.json();
              const data = data_json.results;
              setTableData(data);
            } catch (error) {
                console.error("Failed to fetch table data", error);
            }
        }
        fetchData();
    }, []);

    const handleClick = async (itemID) => {
        console.log(itemID);
        setRowCLicked(!rowClicked);
        setVopId(itemID); 
        try {
            const response = await fetch(`https://admin.smartalmaty.kz/api/v1/healthcare/vop-with-medical-org/${itemID}/`);
            const data = await response.json();
            setTableDataDetail(data.medical_organizations || []);
        } catch (error) {
            console.error("Error fetching medical organizations:", error);
        } 
    }


    return (
        <div className="h-full flex flex-col">
            <div className="relative flex-1 overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead className=" bg-blue-200">
                        <tr>
                            <th className="px-4 py-2 border ">Name</th>
                            <th className="px-4 py-2 border ">Количество name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item) => (
                            <React.Fragment key={item.id}>
                                <tr className="hover:bg-gray-50 hover:bg-gray-100" onClick={()=>handleClick(item.id)}>
                                    <td className="px-4 py-2 border text-left">{item.employee_name}</td>
                                    <td className="px-4 py-2 border">{item.medical_organizations.length}</td>
                                </tr>
                                {vopId === item.id && 
                                        <tr>
                                            <td colSpan="11" className="p-2">
                                                <table className="w-full text-sm border border-gray-300">
                                                    <thead className="bg-gray-200">
                                                        <tr>
                                                            <th className="px-2 py-1 border">Clinic name</th>
                                                            <th className="px-2 py-1 border">Clinic district</th>
                                                        </tr>
                                                    </thead>
                                            {tableDataDetail.map((itemDetail)=>(
                                                <tbody>
                                                    <tr key={tableDataDetail.id}>
                                                        <td className="px-2 py-1 border">{itemDetail.name}</td>
                                                        <td className="px-2 py-1 border">{itemDetail.district}</td>
                                                    </tr>
                                                </tbody>
                                            ))} 
                                                </table>
                                            </td>
                                        </tr>   
                                }
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}