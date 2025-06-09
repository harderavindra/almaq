import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FiExternalLink, FiFile, FiPlus, FiTrash2, FiTruck } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';
import { hasAccess } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';
import IconButton from '../components/common/IconButton';

const ChallanListPage = () => {
    const { user } = useAuth();
    const canAdd = hasAccess(user?.role, ['admin', 'manager']);
    const canDelete = hasAccess(user?.role, ['admin', 'manager']);
    const location = useLocation();
    const successMessage = location.state?.success;
    const [message, setMessage] = useState({ type: '', text: '' });

    const [challans, setChallans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/challans')
            .then(res => {
                setChallans(res.data);
                console.log('Challans fetched:', res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching challans:', err);
                setIsLoading(false);
            });
    }, []);

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

        <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">

            {/* Sidebar */}
            <div className="w-52 h-full p-4">
                <h3 className="text-lg font-bold mb-4">Order Status</h3>
                <ul className="space-y-2">
                    {canAdd && (
                        <li>
                            <Link to="/add-challan" className="cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center hover:bg-blue-100">
                                <FiPlus />
                                Add Challan
                            </Link>
                        </li>
                    )}
                   
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
                {
                    <StatusMessageWrapper
                        loading={isLoading}
                        success={message.type === 'success' ? message.text : ''}
                        error={message.type === 'error' ? message.text : ''}
                    />}
                <h2 className="text-3xl font-bold mb-4">Challan List</h2>

                {challans.length === 0 ? (
                    <p className="text-gray-500">No challans found.</p>
                ) : (
                    <table className="w-full rounded-xl overflow-hidden" border="0">
                        <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                            <tr>
                                <th className="px-3 py-3 font-semibold text-left">Order Ref No</th>
                                <th className="px-3 py-3 font-semibold text-left">Challan Date</th>
                                <th className="px-3 py-3 font-semibold text-left">Vehicle</th>
                                <th className="px-3 py-3 font-semibold text-left">Driver</th>
                                <th className="px-3 py-3 font-semibold text-left">Items</th>
                                <th className="px-3 py-3 font-semibold text-left">Status</th>
                                <th className="px-3 py-3 font-semibold text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {challans.map((challan) => (
                                <tr key={challan._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-3 py-4">{challan._id}</td>
                                    <td className="px-3 py-4">
                                        {new Date(challan.dispatchDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-4">{challan.vehicleId?.vehicleNumber || 'N/A'}</td>
                                    <td className="px-3 py-4">{challan.vehicleId?.driverName || 'N/A'}</td>
                                    <td className="px-3 py-4 space-y-1">
                                        {challan.items.map((item, i) => (
                                            <div key={item._id || i} className="flex gap-2 items-center">
                                                <span className={`w-4 h-4 text-xs ${item.status === 'Delivered' ? "bg-green-400" : "bg-orange-400"} flex justify-center items-center rounded-full text-white text-sm`}>{i + 1}</span>
                                                <span>
                                                    {item.orderItemId?.farmerId?.name || 'Unknown'} {item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-3 py-4 capitalize">{challan.status || 'Pending'}</td>
                                    <td className="px-3 py-4">
                                        <div className="flex gap-2">
                                               <IconButton  label='' shape='pill' onClick={() => navigate(`/challans/${challan._id}`)}  icon={<FiFile size="18" />} >
                                            </IconButton>
                                             {canDelete && (
                                                <IconButton variant='danger' label='' shape='pill' onClick={() =>handleDelete(challan._id)}  icon={<FiTrash2 size="18"/>} >
                                            </IconButton>
                                                // <button onClick={() => handleDelete(challan._id)} className="text-red-600 hover:text-red-800 cursor-pointer">
                                                //     <FiTrash2 size={18} />
                                                // </button>
                                            )}
                                            {/* <button onClick={() => handleDelete(challan._id)} className="text-red-600 hover:text-red-800">
                                                <FiTrash2 size={18} />
                                            </button> */}
                                         
                                           
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
