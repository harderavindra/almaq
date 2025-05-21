import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import SidebarMaster from '../components/layout/SidebarMaster';
import FarmerMaster from '../components/master/FarmerMaster';
import PlantTypeMaster from '../components/master/PlantTypeMaster';
import VehicleMaster from '../components/master/VehicleMaster';
import DepartmentsMaster from '../components/master/DepartmentMaster';
const tabHeadings = {
    farmers: 'Farmers List',
   'plant-types': 'Plant Types',
    vehicles: 'Vehicle Overview',
    departments: 'Departments',
    deliveries: 'Delivery Schedule',
    // Add more tabs as needed
};
const MasterPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('farmers');
    const [data, setData] = useState([]);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        console.log("path", path);
setActiveTab(path && path !== 'master' ? path : 'farmers');
        // fetchData();
    }, [location]);

    return (
        <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">

            <SidebarMaster activeTab={activeTab} />


            <div className="px-8 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl shadow">
                <h2 className="text-3xl font-bold mb-4">
                    {tabHeadings[activeTab] || 'Master Section'}
                </h2>
                { activeTab === 'farmers' &&<FarmerMaster/>}
                { activeTab === 'plant-types' && <PlantTypeMaster/>} 
                { activeTab === 'vehicles' && <VehicleMaster/>}
                { activeTab === 'departments' && <DepartmentsMaster/>}
                
            </div>
        </div>
    )
}

export default MasterPage