import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FiExternalLink, FiPlus, FiTrash2, FiTruck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ChallanListPage = () => {
    const [challans, setChallans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/challans')
            .then(res => {
                setChallans(res.data);
                console.log('Challans fetched:', res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching challans:', err);
                setLoading(false);
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

    if (loading) return <p>Loading...</p>;

    return (
        <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">
            <div className="w-52 h-full p-4">
                <h3 className="text-lg font-bold mb-4">Order Status</h3>
                <ul className="space-y-2">
                    <li >
                        <Link to="/add-challan" className={`cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center `} >
                            <FiPlus />
                            Add Challan
                        </Link>
                    </li>
                    <li >
                    <Link to="/challans" className={`cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center  bg-blue-500 text-white`}><FiTruck /> Challans</Link>
                    </li>
                </ul>
            </div>
            <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl">
                <h2 className="text-3xl font-bold mb-4">Challan List</h2>
                <table className="w-full rounded-xl overflow-hidden" border="0">
                    <thead className="bg-blue-50 border-b border-blue-300 text-blue-400 font-light">
                        <tr>
                            <th className="px-3 py-3 font-semibold text-left">Order Ref No</th>
                            <th className="px-3 py-3 font-semibold text-left">Chalaan Date</th>
                            <th className="px-3 py-3 font-semibold text-left">Vehicle</th>
                            <th className="px-3 py-3 font-semibold text-left">Driver</th>
                            <th className="px-3 py-3 font-semibold text-left">Items</th>
                            <th className="px-3 py-3 font-semibold text-left">Status</th>
                            <th className="px-3 py-3 font-semibold text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {challans.map(challan => (
                            <tr key={challan._id}>
                                <td className="px-3 py-4">{challan._id}</td>
                                <td className="px-3 py-4">{new Date(challan.challanDate).toLocaleDateString()}</td>
                                <td className="px-3 py-4">{challan.vehicleId?.vehicleNumber || 'N/A'}</td>
                                <td className="px-3 py-4">{challan.vehicleId?.driverName || 'N/A'}</td>
                                <td className="px-3 py-4">
                                    {challan.items.map((item, i) => (
                                        <div key={item._id} className='flex gap-2 items-center'>
                                            <span className='w-6 h-6 bg-green-500 flex justify-center items-center rounded-full text-white'>{+1}</span>
                                            {item.farmer?.name || 'Unknown'} - Qty: {item.deliveredQuantity} {item.deliveryStatus}
                                        </div>
                                    ))}
                                </td>
                                <td className="px-3 py-4">{challan.status}</td>
                                <td className="px-3 py-4">
                                    <div className="flex gap-2">

                                        <button className='cursor-pointer' onClick={() => window.location.href = `/challans/${challan._id}`}><FiExternalLink size={20} />
                                        </button>
                                        <button className='cursor-pointer' onClick={() => handleDelete(challan._id)}><FiTrash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ChallanListPage;
