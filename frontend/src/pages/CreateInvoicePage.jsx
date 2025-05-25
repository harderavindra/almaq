import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreateInvoicePage = () => {
  const { orderId, farmerId } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null); // Holds the full data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/orderItems/invoice-items?orderId=${orderId}&farmerId=${farmerId}`);
        console.log('Fetched invoice data:', res.data);
        setOrderData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, farmerId]);

  const handleCreateInvoice = async () => {
    setCreating(true);
    try {
      const res = await api.post('/invoices', { orderId, farmerId }); 
      navigate(`/invoice/${res.data.invoice._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p className="text-center mt-6 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center mt-6 text-red-600">{error}</p>;

  const { order, farmer, items } = orderData || {};

  const totalAmount = items?.reduce(
    (sum, item) => sum + (item.pricePerUnit || 0) * (item.deliveredQuantity || 0),
    0
  ) || 0;

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 border shadow-lg bg-white rounded">
      <h1 className="text-2xl font-bold text-center mb-4">Invoice Preview</h1>

      <div className="mb-4 space-y-1">
        <p><strong>Order Ref:</strong> {order?.orderRefNo}</p>
        <p><strong>Department:</strong> {order?.department?.name}</p>
        <p><strong>Department Contact:</strong> {order?.department?.contactPerson} ({order?.department?.contactNumber})</p>
        <p><strong>Farmer Name:</strong> {farmer?.name}</p>
        <p><strong>Farmer Contact:</strong> {farmer?.contactNumber}</p>
      </div>

      <table className="w-full border border-collapse border-gray-300 mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Delivered Qty</th>
            <th className="border p-2">Price/Unit</th>
            <th className="border p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, index) => (
            <tr key={item._id}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2">{item.plantTypeId?.name || '-'}</td>
              <td className="border p-2 text-center">{item.deliveredQuantity}</td>
              <td className="border p-2 text-right">₹ {item.pricePerUnit?.toFixed(2) || '0.00'}</td>
              <td className="border p-2 text-right">
                ₹ {(item.pricePerUnit || 0) * (item.deliveredQuantity || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right font-bold text-lg">
        Total Amount: ₹ {totalAmount.toFixed(2)}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Go Back
        </button>

        <button
          onClick={handleCreateInvoice}
          disabled={creating}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {creating ? 'Creating...' : 'Confirm & Create Invoice'}
        </button>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
