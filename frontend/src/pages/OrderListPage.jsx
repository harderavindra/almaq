import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import OrderSidebar from '../components/layout/OrderSidebar';
import Pagination from '../components/Pagination';
import IconButton from '../components/common/IconButton';
import { FiFile, FiTrash } from 'react-icons/fi';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';

const OrderListPage = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const successMessage = location.state?.successMessage;

    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get("status") || "Draft";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const limit = 5;

    useEffect(() => {
        if (successMessage) {
            setMessage({ type: 'success', text: successMessage });
        }
    }, [successMessage]);

    const fetchOrders = async (status, pageNumber) => {
        try {
            const res = await api.get('/orders', {
                params: { status, page: pageNumber, limit },
            });
            console.log('Fetched Orders:', res.data);
            setOrders(res.data.orders);
            setTotalPages(res.data.totalPages || 1);
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
                    <StatusMessageWrapper
  loading={isLoading}
  success={message.type === 'success' ? message.text : ''}
  error={message.type === 'error' ? message.text : ''}
/>
                    <table className="w-full rounded-xl overflow-hidden" border="0">
                        <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-left">Department</th>
                                <th className="px-3 py-3 font-semibold text-left">Order Ref No</th>
                                <th className="px-3 py-3 font-semibold text-left">Letter No</th>
                                <th className="px-3 py-3 font-semibold text-left">Order Date</th>
                                <th className="px-3 py-3 font-semibold text-left">Contact</th>
                                <th className="px-3 py-3 font-semibold text-left">Status</th>
                                <th className="px-3 py-3 font-semibold text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o._id} className="even:bg-gray-100/70">
                                    <td className="px-3 py-4">{o.departmentId?.name}</td>
                                    <td className="px-3 py-4">{o.orderRefNo}</td>
                                    <td className="px-3 py-4">{o.orderLetterNumber}</td>
                                    <td className="px-3 py-4">
                                        {new Date(o.orderDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-4">{o.contactPerson}-{o.contactNumber}</td>
                                    <td className="px-3 py-4">{o.status}</td>
                                    <td className="px-3 py-4">
                                        <div className='flex gap-3'>

                                            <IconButton label='' shape='pill' onClick={() => navigate(`/orders/${o._id}`)} icon={<FiFile size="18" />} />
                                            <IconButton label='' shape='pill' onClick={() => handleDelete(o._id)} icon={<FiTrash size="18" />} />
                                        </div>


                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    totalPages={totalPages}
                />
            </div>
        </div>
    );
};

export default OrderListPage;
