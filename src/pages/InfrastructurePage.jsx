import DistrictHistogram from "../components/DistrictHistogram";
import YearHistogram from "../components/YearHistogram";
import Diagram from "../components/Diagram";
import InfraTable from "../components/InfraTable";

export default function InfrastructurePage(){
    return(
        <div className="pt-4">
            <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="">
                    <DistrictHistogram />
                </div>
                <div className="">
                    <Diagram/>
                </div>
                <div className="">
                    <YearHistogram/>
                </div>
                <div className="col-span-3 h-[500px] p-6">
                    <InfraTable/>
                </div>
            </div>
        </div>
    );
}