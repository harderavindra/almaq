import UploadComponent from '../components/common/Upload';
import { useAuth } from '../context/AuthContext';
import axios from "../api/axios"
import { useState, useEffect } from 'react';
import Avatar from '../components/common/Avatar';
import SearchableFarmerSelect from '../components/common/SearchableFarmerSelect';
import OrdersOverTimeChart from '../components/dashboard/OrdersOverTimeChart';
import OrdersThisMonthChart from '../components/dashboard/OrdersThisMonthChart';
import RevenueLineChart from '../components/dashboard/RevenueLineChart';
const DashboardPage = () => {
  const [stats, setStats] = useState({
    challans: 0,
    deliveries: 0,
    revenue: 0,
    topFarmers: [],
    topDepartments: []
  });

  useEffect(() => {
    // Fetch or calculate report data
    // You can call APIs or compute from state/store
    const fetchData = async () => {
      // Example: Replace with real API/data logic
      setStats({
        challans: 42,
        deliveries: 39,
        revenue: 125000,
        topFarmers: ['Ravi Patil', 'Sunita Deshmukh'],
        topDepartments: ['Dept A', 'Dept B']
      });
    };

    fetchData();
  }, []);

  return (
     <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">Dashboard Reports</h2>

    <RevenueLineChart />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* <OrdersOverTimeChart /> */}
        {/* <OrdersThisMonthChart /> */}
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Total Challans This Month</p>
          <h3 className="text-3xl font-semibold">{stats.challans}</h3>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Orders Delivered</p>
          <h3 className="text-3xl font-semibold">{stats.deliveries}</h3>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Total Revenue</p>
          <h3 className="text-3xl font-semibold">₹{stats.revenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500">Top Farmers</p>
          <ul className="mt-2 space-y-1">
            {stats.topFarmers.map((name, idx) => (
              <li key={idx} className="text-sm">{name}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mt-8">
        <p className="text-gray-500 mb-2">Top Departments</p>
        <ul className="list-disc list-inside">
          {stats.topDepartments.map((dept, idx) => (
            <li key={idx}>{dept}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;