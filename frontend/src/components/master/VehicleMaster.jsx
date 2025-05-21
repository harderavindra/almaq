import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import DataTable from '../common/DataTable';
import InputText from '../common/InputText';
import IconButton from '../common/IconButton';
import Pagination from '../common/Pagination';
import Button from '../common/Button';

const VehicleMaster = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ isActive: true });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMessage, setShowMessage] = useState({ text: '', type: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const ITEMS_PER_PAGE = 5;

    const columns = [
        { header: 'Transport Name', key: 'transportName' },
        { header: 'Vehicle Number', key: 'vehicleNumber' },
        { header: 'Driver Name', key: 'driverName' },
        { header: 'Driver Contact', key: 'driverContact' },
        { header: 'Type', key: 'vehicleType' },
        {
            header: 'Registered On',
            key: 'registrationDate',
            render: item =>
                item.registrationDate ? new Date(item.registrationDate).toLocaleDateString() : '-'
        },
        {
            header: 'Active',
            key: 'isActive',
            render: item => (item.isActive ? 'Yes' : 'No')
        }
    ];

    const filteredData = data.filter(item =>
        item.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vehicles', {
                params: { page: currentPage, limit: ITEMS_PER_PAGE }
            });
            setData(response.data?.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            setShowMessage({ type: 'error', text: 'Failed to fetch vehicles' });
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async id => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await api.delete(`/vehicles/${id}`);
                fetchData();
                setShowMessage({ type: 'success', text: 'Vehicle deleted successfully' });
            } catch {
                setShowMessage({ type: 'error', text: 'Failed to delete vehicle' });
            }
        }
    };

    const onEdit = async id => {
        try {
            console.log('Vehiclesssss:', id);
            const response = await api.get(`/vehicles/${id}`);
            const vehicle = response.data;
            setCurrentItem(vehicle);
            console.log('Vehiclesssss:', vehicle);
            setFormData({ ...vehicle });
            setIsModalOpen(true);
        } catch {
            setShowMessage({ type: 'error', text: 'Failed to load vehicle for editing' });
        }
    };

    const onSave = async () => {
        try {
            if (currentItem?._id) {
                await api.put(`/vehicles/${currentItem._id}`, formData);
                setShowMessage({ type: 'success', text: 'Vehicle updated successfully' });
            } else {
                await api.post('/vehicles', formData);
                setShowMessage({ type: 'success', text: 'Vehicle added successfully' });
            }
            setIsModalOpen(false);
            setFormData({ isActive: true });
            setCurrentItem(null);
            fetchData();
        } catch (error) {
            setShowMessage({ type: 'error', text: 'Failed to save vehicle' });
        }
    };

    return (
        <>
            {showMessage.text && (
                <div
                    className={`mb-4 p-2 rounded ${
                        showMessage.type === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {showMessage.text}
                </div>
            )}

            <div className="flex flex-col md:flex-row w-full h-full">
                <div className="w-full transition-all duration-500">
                    <div className="flex justify-between gap-10 items-center mb-4">
                        <InputText
                            placeholder="Search..."
                            value={searchTerm}
                            handleOnChange={e => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />
                        <IconButton
                            icon={<FiPlus />}
                            label="Add Vehicle"
                            onClick={() => {
                                setCurrentItem(null);
                                setFormData({ isActive: true });
                                setIsModalOpen(true);
                            }}
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredData}
                        isLoading={isLoading}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        emptyMessage="No vehicles found"
                    />

                    <Pagination
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        totalPages={totalPages}
                    />
                </div>

                {/* Modal */}
                <div
                    className={`flex justify-center items-start transition-all duration-500 pl-20 ${
                        isModalOpen ? 'opacity-100 visible w-full' : 'opacity-0 invisible w-1'
                    }`}
                >
                    <div className="rounded-xl w-full max-w-lg relative">
                        <h3 className="text-xl font-semibold bg-blue-600 text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                            {currentItem ? 'Edit Vehicle' : 'Add Vehicle'}
                            <FiX
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setFormData({ isActive: true });
                                    setCurrentItem(null);
                                }}
                                className="cursor-pointer"
                            />
                        </h3>

                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                onSave();
                            }}
                            className="space-y-4 border border-green-300 p-10 rounded-b-lg"
                        >
                            <InputText
                                label="Transport Name"
                                value={formData.transportName || ''}
                                handleOnChange={e =>
                                    setFormData({ ...formData, transportName: e.target.value })
                                }
                                required
                            />
                            <InputText
                                label="Vehicle Number"
                                value={formData.vehicleNumber || ''}
                                handleOnChange={e =>
                                    setFormData({ ...formData, vehicleNumber: e.target.value })
                                }
                                required
                            />
                            <InputText
                                label="Driver Name"
                                value={formData.driverName || ''}
                                handleOnChange={e =>
                                    setFormData({ ...formData, driverName: e.target.value })
                                }
                                required
                            />
                            <InputText
                                label="Driver Contact"
                                value={formData.driverContact || ''}
                                handleOnChange={e =>
                                    setFormData({ ...formData, driverContact: e.target.value })
                                }
                            />
                            <InputText
                                label="Vehicle Type"
                                value={formData.vehicleType || ''}
                                handleOnChange={e =>
                                    setFormData({ ...formData, vehicleType: e.target.value })
                                }
                            />
                            <InputText
                                type="date"
                                label="Registration Date"
                                value={formData.registrationDate?.split('T')[0] || ''}
                                handleOnChange={e =>
                                    setFormData({ ...formData, registrationDate: e.target.value })
                                }
                            />
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive ?? false}
                                    onChange={e =>
                                        setFormData({ ...formData, isActive: e.target.checked })
                                    }
                                />
                                Active
                            </label>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setFormData({ isActive: true });
                                        setCurrentItem(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {currentItem ? 'Update' : 'Add'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VehicleMaster;
