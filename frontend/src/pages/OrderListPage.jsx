import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import OrderSidebar from '../components/layout/OrderSidebar';
import Pagination from '../components/Pagination';

const OrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get("status") || "Draft";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 5;

    const fetchOrders = async (status, pageNumber) => {
        try {
            const res = await api.get('/orders', {
                params: { status, page: pageNumber, limit },
            });
            setOrders(res.data.orders);
            setTotalPages(Math.ceil(res.data.total / limit));
        } catch (err) {
            console.error('Failed to fetch orders', err);
        }
    };

    useEffect(() => {
        fetchOrders(statusFilter, page);
    }, [statusFilter, page]);

    const handleStatusChange = (newStatus) => {
        setSearchParams({ status: newStatus, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ status: statusFilter, page: newPage });
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
      
        try {
          await api.delete(`/orders/${orderId}`);
          setOrders((prev) => prev.filter((o) => o._id !== orderId));
        } catch (err) {
          console.error("Failed to delete order", err);
          alert("Error deleting the order.");
        }
      };

    return (
        <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">
            <OrderSidebar activeStatus={statusFilter} onChange={handleStatusChange} />

            <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl">
                <h2 className="text-3xl font-bold mb-4">Orders – {statusFilter}</h2>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full rounded-xl overflow-hidden" border="0">
                        <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-left">Order Ref No</th>
                                <th className="px-3 py-3 font-semibold text-left">Letter No</th>
                                <th className="px-3 py-3 font-semibold text-left">Order Date</th>
                                <th className="px-3 py-3 font-semibold text-left">Department</th>
                                <th className="px-3 py-3 font-semibold text-left">Status</th>
                                <th className="px-3 py-3 font-semibold text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o._id} className="even:bg-gray-100/70">
                                    <td className="px-3 py-4">{o.orderReferenceNumber}</td>
                                    <td className="px-3 py-4">{o.orderLetterNumber}</td>
                                    <td className="px-3 py-4">
                                        {new Date(o.orderDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-4">{o.department?.name}</td>
                                    <td className="px-3 py-4">{o.status}</td>
                                    <td className="px-3 py-4">
                                        <Link to={`/orders/${o._id}`} className="text-blue-600 underline">
                                            View
                                        </Link>
                                        <button
    onClick={() => handleDelete(o._id)}
    className="text-red-600 underline"
  >
    Delete
  </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default OrderListPage;
