import { Link } from 'react-router-dom';
import { FiTruck, FiUser, } from 'react-icons/fi';
import { RiPlantLine } from 'react-icons/ri';
import { FaRegBuilding } from "react-icons/fa";


const SidebarMaster = ({ activeTab }) => {
    const items = [
        { to: '/master/farmers', icon: <FiUser />, label: 'Farmers', tab: 'farmers' },
        { to: '/master/plant-types', icon: <RiPlantLine />, label: 'Plant Types', tab: 'plant-types' },
        { to: '/master/vehicles', icon: <FiTruck />, label: 'Vehicles', tab: 'vehicles' },
        { to: '/master/departments', icon: <FaRegBuilding />, label: 'Departments', tab: 'departments' }
    ];

    return (
    <div className="w-60 h-full py-10 sticky top-0">
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item.tab}>
                        <Link
                            to={item.to}
                            className={`cursor-pointer px-4 py-2 rounded-full flex gap-3 items-center ${activeTab === item.tab ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SidebarMaster;