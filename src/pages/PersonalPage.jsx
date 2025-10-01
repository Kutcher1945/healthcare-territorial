import DistrictTable from '../components/DistrictTable';
import PersonalHistogram from '../components/PersonalHistogram';
import PersonalTable from '../components/PersonalTable';


export default function PersonalPage(){
    return (
        <div className="pt-4">
            <div className="grid grid-rows-2 gap-2 mt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-[500px] p-3">
                        <DistrictTable/>
                    </div>
                    <div className="">
                        <PersonalHistogram />
                    </div>
                </div>
                <div className="h-[500px] p-6 pt-0">
                    <PersonalTable/>
                </div>
            </div>
        </div>
    );
}