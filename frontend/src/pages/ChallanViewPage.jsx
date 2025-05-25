import React, { useEffect, useState, useCallback } from 'react';
import api from "../api/axios";
import { Link, useParams } from 'react-router-dom';
import { FiPlus, FiTruck } from 'react-icons/fi';
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';
import { hasAccess } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';

const ChallanViewPage = () => {
  const { user } = useAuth();
  const canUpdate = hasAccess(user?.role, ['admin', 'manager']);
  const canDelete = hasAccess(user?.role, ['admin', 'manager']);
  const { challanId } = useParams();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newDeliveredQuantities, setNewDeliveredQuantities] = useState({});
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const fetchChallan = useCallback(async () => {
    try {
      const res = await api.get(`/challans/${challanId}`);
      setChallan(res.data);
      console.log('Challan fetched:', res.data);
    } catch (err) {
      console.error('Failed to fetch challan:', err);
    } finally {
      setLoading(false);
    }
  }, [challanId]);

  useEffect(() => {
    if (challanId) fetchChallan();
  }, [challanId, fetchChallan]);



  const handleStatusUpdate = async (itemId, status = 'Delivered') => {




    try {
      await api.patch(`/challans/${challanId}/items/${itemId}/deliver`, {
        status: status,
      });
      fetchChallan();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) return <p>Loading challan...</p>;
  if (!challan) return <p>Challan not found.</p>;

  return (
    <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">
      {/* Sidebar */}
      <div className="w-52 h-full p-4">
        <h3 className="text-lg font-bold mb-4">Order Status</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/add-challan" className="cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center hover:bg-blue-100">
              <FiPlus />
              Add Challan
            </Link>
          </li>
          <li>
            <Link to="/challans" className="cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center bg-blue-500 text-white">
              <FiTruck />
              Challans
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="px-8 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl shadow">
        <h2 className="text-3xl font-bold mb-4">Challan Details</h2>

        <div className="bg-blue-100/50 rounded-2xl p-8 mb-6 space-y-1">
          <div className="flex gap-6 justify-start">
            <div>
              <label>Challan Number:</label>
              <p className="text-lg text-blue-700 font-medium">{challan.challanNo}</p>
            </div>
            <div>
              <label>Created Date</label>
              <p className="text-lg text-blue-700 font-medium">{new Date(challan.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label>Dispatch Date</label>
              <p className="text-lg text-blue-700 font-medium">{new Date(challan.dispatchDate).toLocaleDateString()}</p>
            </div>

          </div>
          <div className="flex gap-6">
            <div className='w-full'>
              <label>Vehicle:</label>
              <p className="text-lg text-blue-700 font-medium">
                {challan.vehicleId?.vehicleNumber || 'N/A'} ({challan.vehicleId?.transportName || 'N/A'}) - {challan.vehicleId?.driverName || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex gap-6">


            <div className='w-full'>
              <label>Route Details</label>
              <p className="text-lg text-blue-700 font-medium">{challan.routeDetails}</p>
            </div>
            <div className='w-full'>
              <label>Notes:</label>
              <p className="text-lg text-blue-700 font-medium">{challan.notes}</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-2 mt-6">Delivered Items</h3>
        <table className="w-full rounded-xl overflow-hidden">
          <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
            <tr className="text-left">
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Farmer</th>
              <th className="px-3 py-3">Plant Type</th>
              <th className="px-3 py-3">Ordered Qty</th>
              <th className="px-3 py-3">Price Per Unit </th>
              <th className="px-3 py-3 w-50">Status</th>
              <th className="px-3 py-3 w-50">Action</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item, index) => {
              const orderItem = item.orderItemId || {};
              const farmer = orderItem.farmerId || {};
              const plant = orderItem.plantTypeId || {};
              const orderQty = orderItem.quantity || 0;
              const status = item.status || 'n/a';




              return (
                <tr key={item._id}>
                  <td className="px-3 py-4">{index + 1}</td>
                  <td className="px-3 py-4">{farmer.name || 'Unknown'}</td>
                  <td className="px-3 py-4">{plant.name || 'N/A'}</td>
                  <td className="px-3 py-4">{item.quantity}</td>
                  <td className="px-3 py-4">
                    {item.orderItemId.pricePerUnit}
                  </td>
                  <td>{status}</td>
                  <td className="px-3 py-4">

                    <div className="flex items-center gap-2">
                      {
                        status === 'Delivered' ? (
                          <span className="text-green-500 font-semibold">{status}</span>
                        ) : (
                          <>
                          {canUpdate  && ( 
                          <Button size='sm' width='auto'

                            onClick={() => handleStatusUpdate(orderItem._id, 'Delivered', orderQty)}
                          >
                            Confirm Delivery
                          </Button>
                        )}
                        </>
                        )}


                    </div>

                  </td>
                </tr>
              );
            })}


          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChallanViewPage;
