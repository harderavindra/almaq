import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FiCalendar, FiClock, FiExternalLink, FiFile, FiFramer, FiPenTool, FiPlus, FiTrash2, FiTruck, FiUser } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';
import { hasAccess } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';
import IconButton from '../components/common/IconButton';
import { formatDate } from '../utils/dateUtils';
import { PiPottedPlant } from "react-icons/pi";

import { BsCurrencyRupee } from "react-icons/bs";
import ChallanSidebar from '../components/layout/ChallanSidebar';
import { OrderStatusIcon } from '../utils/constants';
import StatusSidebar from '../components/layout/StatusSidebar';

const ChallanListPage = () => {
    const { user } = useAuth();
    const canAdd = hasAccess(user?.role, ['admin', 'manager']);
    const canDelete = hasAccess(user?.role, ['admin', 'manager']);
    const location = useLocation();
    const successMessage = location.state?.success;
    const [message, setMessage] = useState({ type: '', text: '' });
    const [challans, setChallans] = useState([]);
    const query = new URLSearchParams(location.search);
    const statusFilter = query.get('status'); // "Draft", "Issued", etc.
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        api.get('/challans', {
            params: statusFilter ? { status: statusFilter } : {}
        })
            .then(res => {
                setChallans(res.data);
                            setMessage({ type: 'success', text: 'Challans loaded successfully!' });

                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching challans:', err);
                setIsLoading(false);
            });
    }, [statusFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this challan?')) return;
        try {
            await api.delete(`/challans/${id}`);
            setChallans(prev => prev.filter(challan => challan._id !== id));
        } catch (error) {
            console.error('Error deleting challan:', error);
        }
    };


    return (

        <div className="flex flex-col md:flex-row h-full  gap-10">
            <StatusSidebar
                statuses={['Draft', 'Issued', 'Delivered', 'Cancelled']}
                endpoint="/challans/status-counts"
                basePath="/challans"
                addPath="/add-challan"

                getStatusIcon={(status) => <OrderStatusIcon status={status} size={20} />}
                allowedRoles={['admin', 'manager']}
            />

            {/* Main Content */}
            <div className="px-10 py-6 w-full  flex flex-col bg-white rounded-xl relative">

                <div className="flex items-center justify-between gap-4 pb-5 min-h-10" >

                    <h2 className="text-3xl font-bold mb-4">Challan List
                    </h2>
                    <StatusMessageWrapper
                        loading={isLoading}
                        success={message.type === 'success' ? message.text : ''}
                        error={message.type === 'error' ? message.text : ''}
                    />
                </div>

                {challans.length === 0 ? (
                    <p className="text-gray-500">No challans found.</p>
                ) : (
                    <table className="w-full rounded-xl overflow-hidden" border="0">
                        <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-left">Challans Ref No</th>
                                <th className="px-3 py-3 font-semibold text-left">Dispatch Info</th>

                                <th className="px-3 py-3 font-semibold text-left">Items</th>
                                <th className="px-3 py-3 font-semibold text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {challans.map((challan) => (
                                <tr key={challan._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-3 py-4"><p className='text-lg font-semibold'>{challan.challanNo}</p>
                                        <span className='flex items-center gap-1'> <FiClock /> {formatDate(challan.createdAt)}</span>
                                    </td>
                                    <td className="px-3 py-4">
                                        <span className='flex items-center gap-1 text-md font-semibold'> <FiTruck /> {challan.vehicleId?.vehicleNumber} <FiUser className='ml-2' /> {challan.vehicleId?.driverName}</span>
                                        <span className='flex items-center gap-1'> <FiCalendar /> {formatDate(challan.dispatchDate)}</span>
                                    </td>

                                    {/* ✅ Summary: Total Farmers, Quantity, Price */}
                                    <td className="px-3 py-4 space-y-1">
                                        <span className='flex items-center gap-1 text-lg font-semibold pr-10'><FiUser />{challan.summary?.totalFarmers || 0} <PiPottedPlant className='ml-5' />{challan.summary?.totalQuantity || 0}</span>
                                        <span className='flex items-center gap-1 text-lg font-semibold pr-10'><BsCurrencyRupee />{challan.summary?.totalPrice?.toLocaleString() || 0}</span>
                                    </td>


                                    <td className="px-3 py-4">
                                        <div className="flex gap-2">
                                            <IconButton label='' shape='pill' onClick={() => navigate(`/challans/${challan._id}/edit?status=${challan.status}`)} icon={<FiPenTool size="18" />} />
                                            {canDelete && (
                                                <IconButton variant='danger' label='' shape='pill' onClick={() => handleDelete(challan._id)} icon={<FiTrash2 size="18" />} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ChallanListPage;
