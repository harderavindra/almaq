import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const RevenueBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const [placedRes, deliveredRes] = await Promise.all([
          api.get('/reports/orders-placed-duration'),
          api.get('/reports/orders-delivered-duration')
        ]);

        const placedMap = new Map();
        placedRes.data.forEach(item => {
          placedMap.set(item.date, item.revenue);
        });

        const deliveredMap = new Map();
        deliveredRes.data.forEach(item => {
          deliveredMap.set(item.date, item.revenue);
        });

        const allDates = Array.from(new Set([
          ...placedMap.keys(),
          ...deliveredMap.keys()
        ])).sort();

        const combinedData = allDates.map(date => ({
          date,
          placed: placedMap.get(date) || 0,
          delivered: deliveredMap.get(date) || 0
        }));

        setChartData(combinedData);
      } catch (err) {
        console.error('Failed to fetch revenue data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) return <p>Loading chart...</p>;

  return (
    <div className="w-full h-96 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Placed vs Delivered Revenue (Last 6 Months)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="placed" fill="#8884d8" name="Placed Revenue" />
          <Bar dataKey="delivered" fill="#82ca9d" name="Delivered Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueBarChart;
