import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import SidebarMaster from '../components/layout/SidebarMaster';
import FarmerMaster from '../components/master/FarmerMaster';
import PlantTypeMaster from '../components/master/PlantTypeMaster';
import VehicleMaster from '../components/master/VehicleMaster';
import DepartmentsMaster from '../components/master/DepartmentMaster';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';

const tabHeadings = {
  farmers: 'Farmers List',
  'plant-types': 'Plant Types',
  vehicles: 'Vehicle Overview',
  departments: 'Departments',
  deliveries: 'Delivery Schedule',
};

const MasterPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('farmers');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    setActiveTab(path && path !== 'master' ? path : 'farmers');
  }, [location]);

  return (
    <div className="flex flex-col md:flex-row h-full gap-10">
      <SidebarMaster activeTab={activeTab} />

      <div className="px-10 py-6 w-full flex flex-col bg-white rounded-xl relative">
        <div className="flex items-center justify-between gap-4 pb-5 min-h-10">
          <h2 className="text-3xl font-bold">
            {tabHeadings[activeTab] || 'Master Section'}
          </h2>
{message.text && <p>{message.text}</p>}
          <StatusMessageWrapper
            loading={isLoading}
            success={message.type === 'success' ? message.text : ''}
            error={message.type === 'error' ? message.text : ''}
            className="sticky top-0 z-10"
          />
        </div>

        {activeTab === 'farmers' && (
          <FarmerMaster setMessage={setMessage} setIsLoading={setIsLoading} />
        )}
        {activeTab === 'plant-types' && (
          <PlantTypeMaster setMessage={setMessage} setIsLoading={setIsLoading} />
        )}
        {activeTab === 'vehicles' && (
          <VehicleMaster setMessage={setMessage} setIsLoading={setIsLoading} />
        )}
        {activeTab === 'departments' && (
          <DepartmentsMaster setMessage={setMessage} setIsLoading={setIsLoading} />
        )}
      </div>
    </div>
  );
};

export default MasterPage;
