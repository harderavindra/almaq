import UploadComponent from '../components/common/Upload';
import { useAuth } from '../context/AuthContext';
import axios from "../api/axios"
import { useState, useEffect } from 'react';
import Avatar from '../components/common/Avatar';
import SearchableFarmerSelect from '../components/common/SearchableFarmerSelect';
import OrdersOverTimeChart from '../components/dashboard/OrdersOverTimeChart';
import OrdersThisMonthChart from '../components/dashboard/OrdersThisMonthChart';
import RevenueLineChart from '../components/dashboard/RevenueLineChart';
import { FiMapPin } from 'react-icons/fi';
import { PiPottedPlant } from 'react-icons/pi';
import { LuIndianRupee } from "react-icons/lu";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalPlantQuantity: 0,
    totalRevenue: 0,
    departmentsList: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/reports/stats'); // Adjust path if needed
        setStats(res.data);
        console.log(res.data)
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="pt-5">
      <div className='flex gap-20 mb-10 justify-between items-stretch '>
        <RevenueLineChart />

        <div className="flex flex-col gap-6 w-lg h-full h-fit items-stretch justify-between">
          {/* <OrdersOverTimeChart /> */}
          {/* <OrdersThisMonthChart /> */}
          <div className="bg-white rounded-xl shadow p-4  flex  gap-6 items-center  ">
            <FiMapPin size={48} />
            <div className='flex flex-col gap-1'>
              <p className="text-gray-500 text-lg">Total Departsment</p>
              <h3 className=" font-semibold text-3xl">{stats?.totalDepartments}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4  flex  gap-6 items-center ">
            <PiPottedPlant size={48} />
            <div className='flex flex-col gap-1'>
              <p className="text-gray-500 text-lg">Total Plants</p>
              <h3 className=" font-semibold text-3xl">{stats?.totalPlantQuantity}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4  flex  gap-6 items-center h-full ">
            <LuIndianRupee size={48} />
            <div className='flex flex-col gap-1'>
              <p className="text-gray-500 text-lg">Total Plants</p>
              <h3 className=" font-semibold text-3xl">{stats?.totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
          </div>



        </div>

      </div>
      <div className="bg-white rounded-xl shadow p-4  flex flex-col gap-4 justify-center">
        <p className="text-gray-500">Top Departments</p>
        <ul className="mt-2 space-y-1 flex-col flex">
          {stats.departmentsList.map((item, idx) => (
            <li key={idx} className="text-sm flex gap-2 items-center"><FiMapPin />{item.name}, {item.district}</li>
          ))}
        </ul>
      </div>


      {/* <div className="bg-white rounded-xl shadow p-4 mt-8">
        <p className="text-gray-500 mb-2">Top Departments</p>
        <ul className="list-disc list-inside">
          {stats.topDepartments.map((dept, idx) => (
            <li key={idx}>{dept}</li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default DashboardPage;