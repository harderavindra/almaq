import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import DataTable from '../common/DataTable';
import InputText from '../common/InputText';
import IconButton from '../common/IconButton';
import Pagination from '../common/Pagination';
import Button from '../common/Button';

const PlantTypeMaster = () => {
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

    const columns =isModalOpen ? [
        { header: 'Name', key: 'name' },
        { header: 'Rate/Unit (₹)', key: 'ratePerUnit' },
       
    ] :
    [
        { header: 'Name', key: 'name' },
        { header: 'HSN', key: 'HSN' },
        { header: 'Rate/Unit (₹)', key: 'ratePerUnit' },
        { header: 'Decription', key: 'description' },
        { header: 'Active', key: 'isActive',  render: item => item.isActive ? 'Yes' : 'No' }
    ]

    const filteredData = data.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/plants', {
                params: { page: currentPage, limit: ITEMS_PER_PAGE }
            });
            setData(response.data?.data || []);
            console.log('Plants:', response.data);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            setShowMessage({ type: 'error', text: 'Failed to fetch data' });
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async id => {
        if (window.confirm('Are you sure you want to delete this plant type?')) {
            setIsLoading(true);
            try {
                await api.delete(`/plants/${id}`);
                fetchData();
                setShowMessage({ type: 'success', text: 'Plant type deleted successfully' });
            } catch (error) {
                setShowMessage({ type: 'error', text: 'Failed to delete plant type' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const onEdit = async id => {
        try {
            const response = await api.get(`/plants/${id}`);
            const data = response.data.data;
            setCurrentItem(data);
            setFormData({
                name: data.name || '',
                HSN: data.HSN || '',
                description: data.description || '',
                ratePerUnit: data.ratePerUnit || '',
                isActive: data.isActive ?? true
            });
            setIsModalOpen(true);
        } catch (error) {
            setShowMessage({ type: 'error', text: 'Failed to load plant type for editing' });
        }
    };

    const onSave = async () => {
        try {
            if (currentItem?._id) {
                await api.put(`/plants/${currentItem._id}`, formData);
                setShowMessage({ type: 'success', text: 'Plant type updated successfully' });
            } else {
                await api.post('/plants', formData);
                setShowMessage({ type: 'success', text: 'Plant type added successfully' });
            }
            setIsModalOpen(false);
            setFormData({ isActive: true });
            setCurrentItem(null);
            fetchData();
        } catch (error) {
            setShowMessage({ type: 'error', text: 'Failed to save plant type' });
        }
    };

    return (
        <>
            {showMessage.text && (
                <div className={`mb-4 p-2 rounded ${showMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {showMessage.text}
                </div>
            )}

            <div className="flex flex-col md:flex-row w-full h-full">
                <div className="w-full transition-all duration-500">
                    <div className="flex justify-between gap-10 items-center mb-4">
                        <InputText
                            placeholder="Search..."
                            value={searchTerm}
                            handleOnChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />
                        <IconButton
                            icon={<FiPlus />}
                            label="Add Plant Type"
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
                        emptyMessage="No plant types found"
                    />

                    <Pagination
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        totalPages={totalPages}
                    />
                </div>

                {/* Modal */}
                <div className={`flex justify-center items-start transition-all duration-500 pl-20 ${isModalOpen ? 'opacity-100 visible w-full' : 'opacity-0 invisible w-1  h-1'}`}>
                    <div className="rounded-xl w-full max-w-lg relative">
                        <h3 className="text-xl font-semibold bg-blue-600 text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                            {currentItem ? 'Edit Plant Type' : 'Add Plant Type'}
                            <button type="button" onClick={() => {
                                setIsModalOpen(false);
                                setFormData({ isActive: true });
                                setCurrentItem(null);
                            }}>
                                <FiX size={24} />
                            </button>
                        </h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            onSave();
                        }} className="space-y-4 border border-green-300 p-10 rounded-b-lg">
                            <InputText
                                type="text"
                                label="Name"
                                value={formData.name || ''}
                                handleOnChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <InputText
                                type="text"
                                label="HSN"
                                value={formData.HSN || ''}
                                handleOnChange={(e) => setFormData({ ...formData, HSN: e.target.value })}
                                required
                            />
                            <InputText
                                type="text"
                                label="Description"
                                value={formData.description || ''}
                                handleOnChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <InputText
                                type="number"
                                label="Rate Per Unit (₹)"
                                value={formData.ratePerUnit || ''}
                                handleOnChange={(e) => setFormData({ ...formData, ratePerUnit: parseFloat(e.target.value) })}
                                required
                            />
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive ?? false}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                Active
                            </label>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => {
                                    setIsModalOpen(false);
                                    setFormData({ isActive: true });
                                    setCurrentItem(null);
                                }}>
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

export default PlantTypeMaster;
