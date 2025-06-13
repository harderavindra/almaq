import React, { useEffect, useState, useCallback } from 'react';
import api from "../api/axios";
import { Link, useParams } from 'react-router-dom';
import { FiCalendar, FiCheck, FiClipboard, FiClock, FiPlus, FiRefreshCw, FiTruck, FiX } from 'react-icons/fi';
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';
import { hasAccess } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';
import IconButton from '../components/common/IconButton';
import OrderItemSelector from '../components/challan/OrderItemSelector';
import Pagination from '../components/Pagination';
import ChallanSidebar from '../components/layout/ChallanSidebar';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';
import SelectDropdown from '../components/common/SelectDropdown';

const ChallanEditPage = () => {
    const { user } = useAuth();

    const canUpdate = hasAccess(user?.role, ['admin', 'manager']);
    const canDelete = hasAccess(user?.role, ['admin', 'manager']);
    const { challanId } = useParams();
    const [challan, setChallan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newDeliveredQuantities, setNewDeliveredQuantities] = useState({});
    const [selectedStatuses, setSelectedStatuses] = useState({});
    const [newItem, setNewItem] = useState({ orderItemId: '', quantity: '' });
    const [showSelector, setShowSelector] = useState(false);
    const [orderItems, setOrderItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newStatus, setNewStatus] = useState('');

    const statusOptions = ['Draft', 'Issued', 'Delivered', 'Cancelled'];

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const itemsPerPage = 5;
    const fetchChallan = useCallback(async () => {
        try {
            const res = await api.get(`/challans/${challanId}?page=${currentPage}&limit=${itemsPerPage}`);
            setChallan(res.data.data);
            setTotalPages(res.data.data.pagination?.totalPages || 1);
            setMessage({ type: 'success', text: 'Challan loaded successfully!' });

        } catch (err) {
            console.error('Failed to fetch challan:', err);
        } finally {
            setLoading(false);
        }
    }, [challanId, currentPage]);

    useEffect(() => {
        if (challanId) fetchChallan();
    }, [challanId, fetchChallan, currentPage]);



    const handleItemStatusUpdate = async (itemId, status = 'Delivered') => {




        try {
            await api.patch(`/challans/${challanId}/items/${itemId}/deliver`, {
                status: status,
            });
            fetchChallan();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };


    const handleStatusUpdate = async () => {
        if (!newStatus) return;
        setLoading(true);
        try {
            const res = await api.patch(`/challans/${challanId}/status`, { status: newStatus });
            setChallan(res.data);
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (loading) return <p>Loading challan...</p>;
    if (!challan) return <p>Challan not found.</p>;

    return (
        <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">
            <ChallanSidebar activeStatus={challan?.status} />
            <div className="px-8 py-8 w-full flex-1 flex flex-col bg-white rounded-4xl shadow">

                <StatusMessageWrapper
                    loading={isLoading}
                    success={message.type === 'success' ? message.text : ''}
                    error={message.type === 'error' ? message.text : ''}
                />
                <h2 className="text-3xl font-bold mb-4">Challan :<span className=" text-2xl font-semibold"> {challan.challanNo}</span>
                </h2>
                <div className="bg-blue-100/50 rounded-2xl p-4  space-y-1">
                    <div className="flex gap-10  justify-between items-center p-2 ">
                        <div className='flex items-center gap-2'>
                           <FiClipboard size={18} /> <p className="text-lg text-blue-700 font-medium">{challan.challanNo}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                           <FiClock size={18}/> <p className="text-lg text-blue-700 font-medium">{new Date(challan.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-lg text-blue-700 font-medium border border-blue-500 px-3">{challan.status}</p>
                        </div>

                        <div className="">
                            <div className='flex items-center gap-2'>
                                <SelectDropdown
                                    label=""
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    options={statusOptions.map((status) => ({ label: status, value: status }))}
                                />
                                <IconButton
                                    onClick={handleStatusUpdate}
                                    label=''
                                    disabled={loading}
                                    icon={loading ? <FiRefreshCw /> : <FiCheck />}
                                    className='mt-1'
                                >

                                </IconButton>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-between py-4 border-t border-blue-500 ">
                        <div className='w-full flex gap-4 items-center'>
                            <FiTruck size={18} />
                            <p className="text-lg text-blue-700 font-medium">
                                {challan.vehicleId?.vehicleNumber || 'N/A'} ({challan.vehicleId?.transportName || 'N/A'}) - {challan.vehicleId?.driverName || 'N/A'}
                            </p>
                        </div>
                        <div className='w-full flex gap-4 items-center'>
                            <FiCalendar size={18} />
                            <p className="text-lg text-blue-700 font-medium">{new Date(challan.dispatchDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-6 py-4 border-t border-blue-500 ">
                        <div className='w-full flex'>
                            <label>Route Details:</label>
                            <p className="text-lg text-blue-700 font-medium">{challan.routeDetails || 'N/A'}</p>
                        </div>
                        <div className='w-full flex'>
                            <label>Notes:</label>
                            <p className="text-lg text-blue-700 font-medium">{challan.notes}</p>
                        </div>
                    </div>
                    <div className='flex  gap-5 justify-between pt-5 border-t border-blue-500'>
                        <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                            <label className='text-blue-400 leading-4 pr-5 '>Total Farmers</label>
                            <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'>{challan.totalFarmers}</h4>
                        </div>
                        <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                            <label className='text-blue-400 leading-4 pr-5 '>Total Quantity</label>
                            <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'>{challan.totalChallanQuantity}</h4>
                        </div>
                        <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                            <label className='text-blue-400 leading-4 pr-5 '>Total Amount</label>
                            <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'> ₹{challan.totalAmount?.toLocaleString('en-IN')}</h4>
                        </div>
                    </div>
                </div>
                <div className='flex justify-end my-5'>
                    <IconButton label='Add Farmers' onClick={() => setShowSelector(!showSelector)} icon={<FiPlus />} className="btn btn-sm" />
                </div>

                {showSelector && (
                    <div className="w-screen h-screen p-5 fixed top-0 left-0 bg-black/50 z-50 flex justify-center items-center">
                        <div className=" h-full  bg-white rounded-2xl pr-5 pt-5 relative  ">
                            <button type="button" onClick={() => setShowSelector(false)} className=" bg-blue-500  text-gray-50 hover:bg-blue-600 rounded-full p-3 absolute -top-2 -right-2  z-10 cursor-pointer">
                                    <FiX size={24} />
                                </button>
                            <div className="mb-2  h-full overflow-y-auto  w-6xl relative  p-5 mx-5">
                                
                                 <OrderItemSelector
                                    chalanItems={challan.items}
                                    challanId={challan._id}
                                    onItemsSelected={(items) => {
                                        setForm(prev => ({
                                            ...prev,
                                            items: [...prev.items, ...items]
                                        }));
                                        setShowSelector(false);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <table className="w-full rounded-xl overflow-hidden">
                    <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                        <tr className="text-left">
                            <th className="px-3 py-3">#</th>
                            <th className="px-3 py-3">Farmer</th>
                            <th className="px-3 py-3">Plant Type</th>
                            <th className="px-3 py-3">Qty Issued </th>
                            <th className="px-3 py-3">Price </th>
                            {/* <th className="px-3 py-3 w-50">Status</th> */}
                            <th className="px-3 py-3 w-50">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {challan.items.map((item, index) => {
                            const orderItem = item.orderItemId || {};
                            const farmer = item.farmer || {};
                            const plant = item.plantType || {};
                            const orderQty = item.challanQuantity || 0;
                            const status = item.status || 'n/a';




                            return (
                                <tr className='even:bg-gray-100/70' key={item.orderItemId}>
                                    <td className="px-3 py-4">
                                        <span className='w-5 h-5 bg-blue-100 flex items-center justify-center rounded-full text-blue-800 font-semibold text-xs'>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </span></td>
                                    <td className="px-3 py-4">{farmer.firstName || 'Unknown'} {farmer.lastName}</td>
                                    <td className="px-3 py-4">{plant.name || 'N/A'}  ₹{item.plantType?.ratePerUnit}</td>
                                    <td className="px-3 py-4 text-gray-500 ">

                                        <span className='text-gray-800 font-semibold'> {item.challanQuantity}</span></td>
                                    <td className="px-3 py-4">
                                        ₹ {(item.plantType?.ratePerUnit * item.challanQuantity).toLocaleString('en-IN')}                  </td>
                                    <td className="px-3 py-4">

                                        <div className="flex items-center gap-2">
                                            {
                                                status === 'Delivered' ? (
                                                    <span className="text-green-500 font-semibold">{status}</span>
                                                ) : (
                                                    <>
                                                        {canUpdate && (
                                                            <Button size='sm' width='auto'

                                                                onClick={() => handleItemStatusUpdate(item.orderItemId, 'Delivered', orderQty)}
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
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default ChallanEditPage;
