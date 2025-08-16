import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import OrderSidebar from '../components/layout/OrderSidebar';
import Pagination from '../components/Pagination';
import IconButton from '../components/common/IconButton';
import { FiFile, FiPenTool, FiTrash, FiUser } from 'react-icons/fi';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';
import StatusSidebar from '../components/layout/StatusSidebar';
import { OrderStatusIcon } from '../utils/constants';
import TableSkeletonRows from '../components/common/TableSkeletonRows';
import { useAuth } from '../context/AuthContext';
import { BsCurrencyRupee } from 'react-icons/bs';
import { PiPottedPlant } from 'react-icons/pi';
import LocationDropdowns from '../components/common/LocationDropdowns';

const OrderListPage = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const successMessage = location.state?.successMessage;
    const { user, logout, loading } = useAuth();

    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get("status") || "Draft";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const limit = 20;

    const [locationFilter, setLocationFilter] = useState({
        state: '',
        district: '',
        taluka: ''
    });


    useEffect(() => {
        if (successMessage) {
            setMessage({ type: 'success', text: successMessage });
        }
    }, [successMessage]);

    const fetchOrders = async (status, pageNumber) => {
        setIsLoading(true);
        try {
            const res = await api.get('/orders', {
                params: { status, page: pageNumber, limit,  state: locationFilter.state,
        district: locationFilter.district,
        taluka: locationFilter.taluka },
            });

            const { orders = [], totalPages = 1 } = res.data || {};
            setOrders(orders);
            setTotalPages(totalPages);
            console.log(orders)

            setMessage({ type: 'success', text: 'Orders loaded successfully' });
        } catch (err) {
            console.error('Failed to fetch orders', err);
            setMessage({
                type: 'error',
                text: err?.response?.data?.message || 'Failed to load orders',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(page);
        fetchOrders(statusFilter, page);
    }, [statusFilter, page, locationFilter]);

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
        <div className="flex flex-col md:flex-row h-full  gap-10 ">
            <StatusSidebar
                statuses={['Draft', 'Submitted', 'Approved', 'Delivered', 'Cancelled']}
                endpoint="/orders/status-counts"
                basePath="/orders"
                addPath="/add-order"
                getStatusIcon={(status) => <OrderStatusIcon status={status} size={20} />}
                allowedRoles={['admin', 'manager']}
            />
            <div className="px-10 py-6 w-full  flex flex-col bg-white rounded-xl relative">
                <div className="flex items-center justify-between gap-4 pb-5 min-h-10" >
                    <h2 className="text-3xl font-bold  ">Order : {statusFilter}
                    </h2>
                    <StatusMessageWrapper
                        loading={isLoading}
                        success={message.type === 'success' ? message.text : ''}
                        error={message.type === 'error' ? message.text : ''}
                        className="sticky top-0 z-10"
                    />
                </div>

                <div className="overflow-x-auto flex-1">

                    <LocationDropdowns
                        onChange={(locationData) => {
                            setLocationFilter({
                                state: locationData.state,
                                district: locationData.district,
                                taluka: locationData.taluka
                            });
                        }}
                        defaultState=""
                        defaultDistrict=""
                        defaultTaluka=""
                        showCityInput={false}
                        hideLabel={false}
                        listStyle="flex"
                        className="flex-row gap-4 mb-4"
                    />

                    <table className="w-full rounded-xl overflow-hidden" border="0">
                        <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-left">Order Ref No</th>
                                <th className="px-3 py-3 font-semibold text-left">Order Date</th>
                                <th className="px-3 py-3 font-semibold text-left">Location</th>
                                <th className="px-3 py-3 font-semibold text-left">Department</th>
                                <th className="px-3 py-3 font-semibold text-left">Info</th>
                                <th className="px-3 py-3 font-semibold text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows
                                    rowCount={5}
                                    columnWidths={['6rem', '5rem', '8rem', '7rem', '6rem']}
                                    hasActions={true}
                                />
                            ) : (
                                orders.map((o) => (
                                    <tr key={o._id} className="even:bg-gray-100/70">
                                        <td className="px-3 py-4">{o.orderRefNo}</td>
                                        <td className="px-3 py-4">
                                            {new Date(o.orderDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-4">{o.departmentId?.taluka}, {o.departmentId?.district}</td>
                                        <td className="px-3 py-4">{o.departmentId?.name}</td>
                                        {/* <td className="px-3 py-4">{o.contactPerson}</td> */}
                                        <td className="px-3 py-4 w-60">
                                            <div className='flex items-center gap-3'>
                                                <FiUser />{o.totalFarmers} <PiPottedPlant />{o.totalQuantity} <BsCurrencyRupee />{o.totalAmount}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className='flex gap-3'>
                                                {
                                                    (user.role === 'admin' || ['Draft', 'Submited'].includes(statusFilter)) ? (
                                                        <IconButton
                                                            label=''
                                                            shape='pill'
                                                            onClick={() => navigate(`/orders/${o._id}/edit`)}
                                                            icon={<FiFile size="18" />}
                                                        />
                                                    ) : null
                                                }
                                                {/* <IconButton label='' shape='pill' onClick={() => navigate(`/orders/${o._id}`)} icon={<FiFile size="18" />} /> */}

                                                <IconButton variant='danger' label='' shape='pill' onClick={() => handleDelete(o._id)} icon={<FiTrash size="18" />} />
                                            </div>


                                        </td>
                                    </tr>
                                )))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    onPageChange={(pageNum) => {
                        setSearchParams({ status: statusFilter, page: pageNum });
                    }}
                    totalPages={totalPages}
                />
            </div>
        </div>

    );
};

export default OrderListPage;
