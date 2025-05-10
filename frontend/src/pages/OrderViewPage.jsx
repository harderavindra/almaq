import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import OrderSidebar from '../components/layout/OrderSidebar';

const OrderViewPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data);
            } catch (err) {
                console.error('Failed to fetch order', err);
            }
        };
        fetchOrder();
    }, [id]);

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            setOrder(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update order status');
        }
    };

    if (!order) return <p>Loading...</p>;

    return (
        <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">
            <OrderSidebar activeStatus={order.status} />

            <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl">
                <h2 className="text-3xl font-bold mb-4">Orders</h2>
                <div className="bg-blue-100/50 rounded-2xl p-8 mb-6 space-y-1">
                    <div className="flex gap-6 justify-between">
                        <div className="flex flex-col gap-1">
                            <label>Department:</label>
                            <p className="text-lg text-blue-700 font-medium">{order.department?.name}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label>Status</label>
                            <select
                                value={order.status}
                                onChange={handleStatusChange}
                                className="text-lg text-blue-700 font-medium bg-white border rounded-md px-2 py-1"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Approved">Approved</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-6 justify-between">
                        <div className="flex flex-col gap-1">
                            <label>Order Letter Number</label>
                            <p className="text-lg text-blue-700 font-medium">{order?.orderLetterNumber}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label>Order Date</label>
                            <p className="text-lg text-blue-700 font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label>Contact Person</label>
                            <p className="text-lg text-blue-700 font-medium capitalize">{order?.contactPerson}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label>Contact Number</label>
                            <p className="text-lg text-blue-700 font-medium capitalize">{order?.contactNumber}</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">Items</h3>
                <table className="w-full rounded-xl overflow-hidden" border="0">
                    <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                        <tr>
                            <th className="px-3 py-3 font-semibold text-left">Farmer</th>
                            <th className="px-3 py-3 font-semibold text-left">Plant</th>
                            <th className="px-3 py-3 font-semibold text-left">Qty</th>
                            <th className="px-3 py-3 font-semibold text-left">Amount</th>
                            <th className="px-3 py-3 font-semibold text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, i) => (
                            item.plants.map((plant, j) => (
                                <tr key={`${i}-${j}`} className="even:bg-gray-100/70">
                                    {j === 0 ? (
                                        <td rowSpan={item.plants.length} className="px-3 py-4">{item.farmer?.name}</td>
                                    ) : null}
                                    <td className="px-3 py-4">{plant?.name}</td>
                                    <td className="px-3 py-4">{plant?.quantity}</td>
                                    <td className="px-3 py-4">{plant?.amount}</td>
                                    <td className="px-3 py-4">{plant?.status}</td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>

                <Link to="/orders" className="inline-block mt-4 text-blue-600 underline">← Back to Order List</Link>
            </div>
        </div>
    );
};

export default OrderViewPage;
