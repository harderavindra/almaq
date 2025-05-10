import React, { useEffect, useState } from 'react';
import api from "../api/axios";
import { useParams } from 'react-router-dom';

const ChallanViewPage = () => {
    const { challanId } = useParams();

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallan = async () => {
      try {

          console.log('Challan fetched:',challanId);
        const res = await api.get(`/challans/${challanId}`);
        console.log('Challan fetched:', res.data);
        setChallan(res.data);
      } catch (err) {
        console.error('Failed to fetch challan:', err); 
      } finally {
        setLoading(false);
      }
    };
console.log('Challan ID:', challanId);
    if (challanId) fetchChallan();
  }, [challanId]);

  if (loading) return <p>Loading challan...</p>;
  if (!challan) return <p>Challan not found.</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Challan Details</h2>
      <div className="mb-4">
        <p><strong>Challan Number:</strong> {challan.challanNumber}</p>
        <p><strong>Vehicle ID:</strong> {challan.vehicleId}</p>
        <p><strong>Challan Date:</strong> {new Date(challan.challanDate).toLocaleDateString()}</p>
      </div>

      <h3 className="text-lg font-medium mb-2">Delivered Items</h3>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Farmer</th>
            <th className="border px-2 py-1">Item Ref</th>
            <th className="border px-2 py-1">Plant Type</th>
            <th className="border px-2 py-1">Qty</th>
            <th className="border px-2 py-1">Delivered</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Reason</th>
          </tr>
        </thead>
        <tbody>
          {challan.items.map((item, index) => (
            <tr key={item._id}>
              <td className="border px-2 py-1">{index + 1}</td>
              <td className="border px-2 py-1">{item.farmer.name}</td>
              <td className="border px-2 py-1">{item.itemReferenceNumber}</td>
              <td className="border px-2 py-1">{item.plantTypeName}</td>
              <td className="border px-2 py-1">{item.quantity}</td>
              <td className="border px-2 py-1">{item.deliveredQuantity}</td>
              <td className="border px-2 py-1">{item.deliveryStatus}</td>
              <td className="border px-2 py-1">{item.returnReason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChallanViewPage;
